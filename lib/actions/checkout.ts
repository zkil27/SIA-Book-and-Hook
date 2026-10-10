"use server";

import { z } from "zod";
import { getUser } from "@/lib/session";
import { deliveryFeeFor } from "@/lib/money";
import { DELIVERY_SLOTS, orderCode, parseOrderCode } from "@/lib/meta";
import { dbError, fail, ok, refreshAll, serializable, UserError, type ActionResult } from "./util";

const PlaceOrder = z.object({
  items: z
    .array(z.object({ variantId: z.string().min(1), qty: z.number().int().min(1).max(50) }))
    .min(1, "Your basket is empty."),
  delivery: z.object({
    name: z.string().trim().min(2, "Enter the name of the person receiving the order."),
    phone: z
      .string()
      .trim()
      .regex(/^(\+?63|0)9\d{2}[\s-]?\d{3}[\s-]?\d{4}$/, "Enter a mobile number like 0917 123 4567."),
    address: z.string().trim().min(5, "Enter a street address or house number."),
    barangay: z.string().trim().min(2, "Enter your barangay."),
    slot: z.enum(DELIVERY_SLOTS),
  }),
  payment: z.enum(["GCASH", "COD"]),
});

export type PlaceOrderInput = z.infer<typeof PlaceOrder>;

/**
 * Place an order. Prices are read from the database (never trusted from the
 * browser), stock is checked against the ledger, and the order, its stock
 * movements and its first timeline event are written in one serializable
 * transaction so two shoppers can't buy the same last kilo.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<ActionResult<{ code: string; total: number }>> {
  const user = await getUser();
  if (!user) return fail("Please sign in to place your order.");

  const parsed = PlaceOrder.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check your order details.");
  const { items, delivery, payment } = parsed.data;

  // Merge duplicate lines for the same variant.
  const qtyById = new Map<string, number>();
  for (const i of items) qtyById.set(i.variantId, (qtyById.get(i.variantId) ?? 0) + i.qty);
  const ids = [...qtyById.keys()];

  try {
    const result = await serializable(async tx => {
      const variants = await tx.productVariant.findMany({
        where: { id: { in: ids }, active: true, product: { active: true } },
        include: { product: { select: { name: true } } },
      });
      if (variants.length !== ids.length) {
        throw new UserError("Something in your basket is no longer sold. Remove it and try again.");
      }

      const sums = await tx.stockMovement.groupBy({
        by: ["variantId"],
        where: { variantId: { in: ids } },
        _sum: { quantity: true },
      });
      const stockOf = new Map(sums.map(s => [s.variantId, s._sum.quantity ?? 0]));

      for (const v of variants) {
        const want = qtyById.get(v.id) ?? 0;
        const have = stockOf.get(v.id) ?? 0;
        if (want > have) {
          throw new UserError(
            have <= 0
              ? `${v.product.name} (${v.name}) just sold out. Remove it to continue.`
              : `Only ${have} left of ${v.product.name} (${v.name}). Lower the quantity to continue.`
          );
        }
      }

      const subtotal = variants.reduce((s, v) => s + v.priceCentavos * (qtyById.get(v.id) ?? 0), 0);
      const fee = deliveryFeeFor(subtotal);

      const order = await tx.order.create({
        data: {
          customerId: user.id,
          paymentMethod: payment,
          deliveryName: delivery.name,
          deliveryPhone: delivery.phone,
          deliveryAddress: delivery.address,
          deliveryBarangay: delivery.barangay,
          deliverySlot: delivery.slot,
          deliveryFeeCentavos: fee,
          totalCentavos: subtotal + fee,
          items: {
            create: variants.map(v => ({
              variantId: v.id,
              quantity: qtyById.get(v.id) ?? 0,
              priceAtTime: v.priceCentavos,
            })),
          },
          statusEvents: { create: { toStatus: "PENDING", actorId: user.id, note: "Placed online" } },
        },
      });

      const code = orderCode(order.orderNumber);
      await tx.stockMovement.createMany({
        data: variants.map(v => ({
          variantId: v.id,
          quantity: -(qtyById.get(v.id) ?? 0),
          reason: `Sale — ${code}`,
          orderId: order.id,
        })),
      });

      return { code, total: subtotal + fee };
    });

    refreshAll();
    return ok(result);
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}

/**
 * Customer-facing cancellation:
 * Allowed when the order is not yet in delivery (status is PENDING or CONFIRMED).
 * Writes compensating stock movements to return held inventory into the ledger.
 */
export async function cancelCustomerOrder(orderCodeInput: string, reason?: string): Promise<ActionResult> {
  const user = await getUser();
  const n = parseOrderCode(orderCodeInput);
  if (!n) return fail("Invalid order code.");

  const note = reason?.trim() && reason.trim().length >= 2 ? reason.trim() : "Cancelled by customer";

  try {
    await serializable(async tx => {
      const order = await tx.order.findUnique({
        where: { orderNumber: n },
        include: { stockMovements: { select: { variantId: true, quantity: true } } },
      });
      if (!order) throw new UserError("Order not found.");

      if (user && user.role !== "ADMIN" && order.customerId !== user.id) {
        throw new UserError("You don't have permission to cancel this order.");
      }

      if (order.status === "READY" || order.status === "COMPLETED") {
        throw new UserError("This order is already out for delivery or completed and cannot be cancelled.");
      }
      if (order.status === "CANCELLED") {
        throw new UserError("This order is already cancelled.");
      }

      const code = orderCode(order.orderNumber);
      const actorId = user?.id ?? order.customerId;

      // Return exactly what this order still holds per variant into the ledger.
      const held = new Map<string, number>();
      for (const m of order.stockMovements) held.set(m.variantId, (held.get(m.variantId) ?? 0) - m.quantity);
      const returns = [...held.entries()].filter(([, q]) => q > 0);
      if (returns.length) {
        await tx.stockMovement.createMany({
          data: returns.map(([variantId, q]) => ({
            variantId,
            quantity: q,
            reason: `Cancelled by customer — ${code} (back to stock)`,
            orderId: order.id,
            actorId,
          })),
        });
      }

      await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      await tx.orderStatusEvent.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: "CANCELLED",
          actorId,
          note,
        },
      });
    });

    refreshAll();
    return ok(null);
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}


import "server-only";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { deliveryFeeFor } from "@/lib/money";
import { DELIVERY_SLOTS, orderCode, type OrderStatusKey } from "@/lib/meta";
import { UserError } from "@/lib/actions/util";

/**
 * Order write logic shared by checkout, the admin and the dev test scenarios.
 * Deliberately NOT a "use server" module: these take a customer/actor id as a
 * plain argument, so they must never be callable from the browser. Callers
 * authenticate first, then run these inside `serializable()`.
 */

export const PlaceOrderSchema = z.object({
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

export type PlaceOrderData = z.infer<typeof PlaceOrderSchema>;

export type CreateOrderOpts = {
  /** Appended to every sale movement's reason, e.g. " · dev test". */
  reasonSuffix?: string;
  /** Note on the first timeline event. Default "Placed online". */
  note?: string;
};

/**
 * Create an order: prices read from the database (never trusted from the
 * browser), stock checked against the ledger, then the order, its items, its
 * first timeline event and its sale movements written in the caller's
 * transaction. Throws UserError for expected conditions (sold out, etc.).
 */
export async function createOrderTx(
  tx: Prisma.TransactionClient,
  customerId: string,
  data: PlaceOrderData,
  opts: CreateOrderOpts = {}
): Promise<{ orderId: string; code: string; total: number }> {
  const { items, delivery, payment } = data;

  // Merge duplicate lines for the same variant.
  const qtyById = new Map<string, number>();
  for (const i of items) qtyById.set(i.variantId, (qtyById.get(i.variantId) ?? 0) + i.qty);
  const ids = [...qtyById.keys()];

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
      customerId,
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
      statusEvents: { create: { toStatus: "PENDING", actorId: customerId, note: opts.note ?? "Placed online" } },
    },
  });

  const code = orderCode(order.orderNumber);
  await tx.stockMovement.createMany({
    data: variants.map(v => ({
      variantId: v.id,
      quantity: -(qtyById.get(v.id) ?? 0),
      reason: `Sale — ${code}${opts.reasonSuffix ?? ""}`,
      orderId: order.id,
    })),
  });

  return { orderId: order.id, code, total: subtotal + fee };
}

/**
 * Cancel an order that the caller has already loaded and validated: put back
 * exactly what it still holds per variant (net of earlier returns) as
 * compensating movements, set CANCELLED, and append the timeline event. The
 * original sale movements are never touched.
 */
export async function cancelOrderTx(
  tx: Prisma.TransactionClient,
  order: {
    id: string;
    orderNumber: number;
    status: OrderStatusKey;
    stockMovements: { variantId: string; quantity: number }[];
  },
  actorId: string,
  note: string,
  /** Reason prefix, e.g. "Cancelled" or "Cancelled by customer". */
  label: string,
  reasonSuffix = ""
): Promise<void> {
  const code = orderCode(order.orderNumber);
  const held = new Map<string, number>();
  for (const m of order.stockMovements) held.set(m.variantId, (held.get(m.variantId) ?? 0) - m.quantity);
  const returns = [...held.entries()].filter(([, q]) => q > 0);
  if (returns.length) {
    await tx.stockMovement.createMany({
      data: returns.map(([variantId, q]) => ({
        variantId,
        quantity: q,
        reason: `${label} — ${code} (back to stock)${reasonSuffix}`,
        orderId: order.id,
        actorId,
      })),
    });
  }
  await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
  await tx.orderStatusEvent.create({
    data: { orderId: order.id, fromStatus: order.status, toStatus: "CANCELLED", actorId, note },
  });
}

"use server";

import { getUser } from "@/lib/session";
import { parseOrderCode } from "@/lib/meta";
import { cancelOrderTx, createOrderTx, PlaceOrderSchema, type PlaceOrderData } from "@/lib/orders-core";
import { dbError, fail, ok, invalidate, serializable, UserError, type ActionResult } from "./util";

export type PlaceOrderInput = PlaceOrderData & { saveDetails?: boolean };

/**
 * Place an order. Prices are read from the database (never trusted from the
 * browser), stock is checked against the ledger, and the order, its stock
 * movements and its first timeline event are written in one serializable
 * transaction so two shoppers can't buy the same last kilo. With `saveDetails`
 * the delivery details also go on the account, in that same transaction, so a
 * failed order never changes what's saved.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<ActionResult<{ code: string; total: number }>> {
  const user = await getUser();
  if (!user) return fail("Please sign in to place your order.");

  const parsed = PlaceOrderSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check your order details.");

  try {
    const { code, total } = await serializable(async tx => {
      const placed = await createOrderTx(tx, user.id, parsed.data);
      if (input.saveDetails === true) {
        const { phone, address, barangay } = parsed.data.delivery;
        await tx.user.update({ where: { id: user.id }, data: { phone, address, barangay } });
      }
      return placed;
    });
    invalidate("shop", "orders", "admin");
    return ok({ code, total });
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}

/**
 * Customer-facing cancellation:
 * Allowed for the signed-in owner (or staff) while the order is not yet in
 * delivery (PENDING or CONFIRMED). Writes compensating stock movements to
 * return held inventory into the ledger.
 */
export async function cancelCustomerOrder(orderCodeInput: string, reason?: string): Promise<ActionResult> {
  const user = await getUser();
  // Order codes are sequential, so an anonymous caller could walk them all.
  if (!user) return fail("Please sign in to cancel this order.");
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

      if (user.role !== "ADMIN" && order.customerId !== user.id) {
        throw new UserError("You don't have permission to cancel this order.");
      }

      if (order.status === "READY" || order.status === "COMPLETED") {
        throw new UserError("This order is already out for delivery or completed and cannot be cancelled.");
      }
      if (order.status === "CANCELLED") {
        throw new UserError("This order is already cancelled.");
      }

      await cancelOrderTx(tx, order, user.id, note, "Cancelled by customer");
    });

    invalidate("shop", "orders", "admin");
    return ok(null);
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}

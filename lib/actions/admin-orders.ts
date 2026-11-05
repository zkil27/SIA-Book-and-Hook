"use server";

import { requireAdmin } from "@/lib/session";
import { STATUS_META, type OrderStatusKey } from "@/lib/meta";
import { cancelOrderTx } from "@/lib/orders-core";
import { dbError, fail, ok, invalidate, serializable, UserError, type ActionResult } from "./util";

/**
 * Move an order one step along PENDING → CONFIRMED → READY → COMPLETED.
 * `from` guards against double-advancing when two staff click at once.
 */
export async function advanceOrder(orderId: string, from: OrderStatusKey): Promise<ActionResult<{ to: OrderStatusKey }>> {
  const admin = await requireAdmin();
  const to = STATUS_META[from]?.next;
  if (!to) return fail("This order is already finished.");
  try {
    await serializable(async tx => {
      const order = await tx.order.findUnique({ where: { id: orderId }, select: { status: true } });
      if (!order) throw new UserError("Order not found.");
      if (order.status !== from) throw new UserError("Someone already updated this order. Showing the latest.");
      await tx.order.update({ where: { id: orderId }, data: { status: to } });
      await tx.orderStatusEvent.create({ data: { orderId, fromStatus: from, toStatus: to, actorId: admin.id } });
    });
    invalidate("admin", "orders");
    return ok({ to });
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}

/** Undo of an advance: steps back once, recorded as its own timeline event. */
export async function revertOrder(orderId: string, from: OrderStatusKey, to: OrderStatusKey): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (STATUS_META[to]?.next !== from) return fail("That change can't be undone.");
  try {
    await serializable(async tx => {
      const order = await tx.order.findUnique({ where: { id: orderId }, select: { status: true } });
      if (!order || order.status !== from) throw new UserError("The order changed since; nothing was undone.");
      await tx.order.update({ where: { id: orderId }, data: { status: to } });
      await tx.orderStatusEvent.create({
        data: { orderId, fromStatus: from, toStatus: to, actorId: admin.id, note: "Undo" },
      });
    });
    invalidate("admin", "orders");
    return ok(null);
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}

/** Advance several orders that share a status (bulk "Confirm 3"). */
export async function advanceOrders(orderIds: string[], from: OrderStatusKey): Promise<ActionResult<{ count: number }>> {
  const admin = await requireAdmin();
  const to = STATUS_META[from]?.next;
  if (!to || orderIds.length === 0) return fail("Nothing to update.");
  try {
    const count = await serializable(async tx => {
      const orders = await tx.order.findMany({ where: { id: { in: orderIds }, status: from }, select: { id: true } });
      for (const o of orders) {
        await tx.order.update({ where: { id: o.id }, data: { status: to } });
        await tx.orderStatusEvent.create({ data: { orderId: o.id, fromStatus: from, toStatus: to, actorId: admin.id } });
      }
      return orders.length;
    });
    invalidate("admin", "orders");
    return ok({ count });
  } catch (err) {
    return dbError(err);
  }
}

/**
 * Cancel an order. Its stock goes back on the shelf as compensating ledger
 * movements (the original sale movements are never touched).
 */
export async function cancelOrder(orderId: string, reason: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const note = reason.trim();
  if (note.length < 3) return fail("Add a short reason for cancelling.");
  try {
    await serializable(async tx => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { stockMovements: { select: { variantId: true, quantity: true } } },
      });
      if (!order) throw new UserError("Order not found.");
      if (order.status === "CANCELLED" || order.status === "COMPLETED") {
        throw new UserError(`A ${STATUS_META[order.status].label.toLowerCase()} order can't be cancelled.`);
      }
      await cancelOrderTx(tx, order, admin.id, note, "Cancelled");
    });
    invalidate("admin", "orders");
    return ok(null);
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}

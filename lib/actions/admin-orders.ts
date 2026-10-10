"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { orderCode, STATUS_META, type OrderStatusKey } from "@/lib/meta";
import { dbError, fail, ok, refreshAll, serializable, UserError, type ActionResult } from "./util";

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
    refreshAll();
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
    refreshAll();
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
    refreshAll();
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
        include: { items: true, stockMovements: { select: { variantId: true, quantity: true } } },
      });
      if (!order) throw new UserError("Order not found.");
      if (order.status === "CANCELLED" || order.status === "COMPLETED") {
        throw new UserError(`A ${STATUS_META[order.status].label.toLowerCase()} order can't be cancelled.`);
      }
      const code = orderCode(order.orderNumber);
      // Return exactly what this order still holds per variant (net of earlier returns).
      const held = new Map<string, number>();
      for (const m of order.stockMovements) held.set(m.variantId, (held.get(m.variantId) ?? 0) - m.quantity);
      const returns = [...held.entries()].filter(([, q]) => q > 0);
      if (returns.length) {
        await tx.stockMovement.createMany({
          data: returns.map(([variantId, q]) => ({
            variantId,
            quantity: q,
            reason: `Cancelled — ${code} (back to stock)`,
            orderId,
            actorId: admin.id,
          })),
        });
      }
      await tx.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
      await tx.orderStatusEvent.create({
        data: { orderId, fromStatus: order.status, toStatus: "CANCELLED", actorId: admin.id, note },
      });
    });
    refreshAll();
    return ok(null);
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}

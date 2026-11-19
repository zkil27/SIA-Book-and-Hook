"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { getOrderDetail, type OrderDetail } from "@/lib/admin-data";
import { OFFICE_ADVANCE, STATUS_META, type OrderStatusKey } from "@/lib/meta";
import { cancelOrderTx } from "@/lib/orders-core";
import { dbError, fail, ok, invalidate, serializable, UserError, type ActionResult } from "./util";

/**
 * The opened order's contact details, photos and timeline, loaded when the
 * drawer opens so the Orders list itself stays one small query.
 */
export async function orderDetail(orderId: string): Promise<ActionResult<OrderDetail>> {
  await requireAdmin();
  try {
    const d = await getOrderDetail(orderId);
    return d ? ok(d) : fail("Order not found.");
  } catch (err) {
    return dbError(err);
  }
}

/** Refreshes every view an order status change can show up in. */
const refresh = () => invalidate("admin", "orders", "staff");

/**
 * Move an order one office step: PENDING → CONFIRMED → PACKED. Later steps
 * belong to the trip (Packed → On the truck) and the driver's handoff, or to
 * `markDeliveredByOffice` with a written reason.
 * `from` guards against double-advancing when two staff click at once.
 */
export async function advanceOrder(orderId: string, from: OrderStatusKey): Promise<ActionResult<{ to: OrderStatusKey }>> {
  const admin = await requireAdmin();
  const to = STATUS_META[from]?.next;
  if (!to) return fail("This order is already finished.");
  if (!OFFICE_ADVANCE.includes(from)) {
    return fail(from === "PACKED" ? "Packed orders go out on a trip. Plan one in Dispatch." : "Use Mark delivered and give a reason.");
  }
  try {
    // The status guard lives in the UPDATE itself (row-locked), so two staff
    // clicking at once can't both advance it: two statements, no read first.
    await prisma.$transaction(async tx => {
      const { count } = await tx.order.updateMany({ where: { id: orderId, status: from }, data: { status: to } });
      if (count !== 1) throw new UserError("Someone already updated this order. Showing the latest.");
      await tx.orderStatusEvent.create({ data: { orderId, fromStatus: from, toStatus: to, actorId: admin.id } });
    });
    refresh();
    return ok({ to });
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}

/**
 * Undo of an office advance: steps back once, recorded as its own timeline
 * event. A packed order already planned on a trip can't be un-packed.
 */
export async function revertOrder(orderId: string, from: OrderStatusKey, to: OrderStatusKey): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (STATUS_META[to]?.next !== from || !OFFICE_ADVANCE.includes(to)) return fail("That change can't be undone.");
  try {
    await serializable(async tx => {
      const order = await tx.order.findUnique({ where: { id: orderId }, select: { status: true, tripId: true } });
      if (!order || order.status !== from) throw new UserError("The order changed since; nothing was undone.");
      if (order.tripId) throw new UserError("This order is already planned on a trip. Take it off the trip first.");
      await tx.order.update({ where: { id: orderId }, data: { status: to } });
      await tx.orderStatusEvent.create({
        data: { orderId, fromStatus: from, toStatus: to, actorId: admin.id, note: "Undo" },
      });
    });
    refresh();
    return ok(null);
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}

/**
 * Advance several orders that share a status (bulk "Confirm 3"). Returns the
 * ids that actually moved, so the client prints labels for exactly those.
 * Two statements however many orders: one guarded UPDATE … RETURNING, one
 * insert for all the timeline events.
 */
export async function advanceOrders(orderIds: string[], from: OrderStatusKey): Promise<ActionResult<{ count: number; ids: string[] }>> {
  const admin = await requireAdmin();
  const to = STATUS_META[from]?.next;
  if (!to || orderIds.length === 0 || !OFFICE_ADVANCE.includes(from)) return fail("Nothing to update.");
  try {
    const ids = await prisma.$transaction(async tx => {
      const moved = await tx.$queryRaw<{ id: string }[]>`
        UPDATE "Order" SET "status" = ${to}::"OrderStatus", "updatedAt" = NOW()
        WHERE "id" = ANY(${orderIds}::text[]) AND "status" = ${from}::"OrderStatus"
        RETURNING "id"
      `;
      if (moved.length) {
        await tx.orderStatusEvent.createMany({
          data: moved.map(o => ({ orderId: o.id, fromStatus: from, toStatus: to, actorId: admin.id })),
        });
      }
      return moved.map(o => o.id);
    });
    refresh();
    return ok({ count: ids.length, ids });
  } catch (err) {
    return dbError(err);
  }
}

/**
 * Office override for an order on the truck: marks it delivered without the
 * customer's PIN. A written reason is required and goes on the timeline as
 * "Office: …", so it never reads like a PIN-verified handoff.
 */
export async function markDeliveredByOffice(orderId: string, reason: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const note = reason.trim();
  if (note.length < 3) return fail("Say why the office is marking this delivered.");
  try {
    await serializable(async tx => {
      const order = await tx.order.findUnique({ where: { id: orderId }, select: { status: true } });
      if (!order) throw new UserError("Order not found.");
      if (order.status !== "READY") throw new UserError("Only an order on the truck can be marked delivered.");
      await tx.order.update({ where: { id: orderId }, data: { status: "COMPLETED" } });
      await tx.orderStatusEvent.create({
        data: { orderId, fromStatus: "READY", toStatus: "COMPLETED", actorId: admin.id, note: `Office: ${note}` },
      });
    });
    refresh();
    return ok(null);
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
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
    refresh();
    return ok(null);
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}

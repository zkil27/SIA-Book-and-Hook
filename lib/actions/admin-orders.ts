"use server";

import { requireAdmin } from "@/lib/session";
import { getOrderDetail, type OrderDetail } from "@/lib/admin-data";
import { OFFICE_ADVANCE, orderCode, STATUS_META, type OrderStatusKey } from "@/lib/meta";
import { cancelOrderTx } from "@/lib/orders-core";
import { autoAssignPackedOrdersTx, cleanupEmptyTripTx, renumberTripTx } from "@/lib/trips-core";
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
 * `markDeliveredByOffice` with a written reason. Moving to PACKED also
 * auto-assigns the bag to a planned trip in barangay route order.
 */
export async function advanceOrder(
  orderId: string,
  from: OrderStatusKey
): Promise<ActionResult<{ to: OrderStatusKey; tripCode?: string | null }>> {
  const admin = await requireAdmin();
  const to = STATUS_META[from]?.next;
  if (!to) return fail("This order is already finished.");
  if (!OFFICE_ADVANCE.includes(from)) {
    return fail(from === "PACKED" ? "Packed orders go out on a trip. Plan one in Dispatch." : "Use Mark delivered and give a reason.");
  }
  try {
    const trip = await serializable(async tx => {
      const { count } = await tx.order.updateMany({ where: { id: orderId, status: from }, data: { status: to } });
      if (count !== 1) throw new UserError("Someone already updated this order. Showing the latest.");
      await tx.orderStatusEvent.create({ data: { orderId, fromStatus: from, toStatus: to, actorId: admin.id } });
      if (to === "PACKED") {
        const assigned = await autoAssignPackedOrdersTx(tx, [orderId]);
        return assigned.get(orderId) ?? null;
      }
      return null;
    });
    refresh();
    return ok({ to, tripCode: trip });
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}

/**
 * Undo of an office advance: steps back once, recorded as its own timeline
 * event. Reverting a packed bag detaches it from its unloaded planned trip.
 */
export async function revertOrder(orderId: string, from: OrderStatusKey, to: OrderStatusKey): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (STATUS_META[to]?.next !== from || !OFFICE_ADVANCE.includes(to)) return fail("That change can't be undone.");
  try {
    await serializable(async tx => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: { status: true, tripId: true, loadedAt: true, trip: { select: { status: true } } },
      });
      if (!order || order.status !== from) throw new UserError("The order changed since; nothing was undone.");
      if (order.trip && order.trip.status !== "PLANNED") throw new UserError("This order's trip has already left.");
      if (order.loadedAt) throw new UserError("This bag is already loaded on the truck. Untick it on Load first.");
      await tx.order.update({
        where: { id: orderId },
        data: { status: to, ...(from === "PACKED" ? { tripId: null, stopIndex: null, loadedAt: null } : {}) },
      });
      await tx.orderStatusEvent.create({
        data: { orderId, fromStatus: from, toStatus: to, actorId: admin.id, note: "Undo" },
      });
      if (from === "PACKED" && order.tripId) {
        await renumberTripTx(tx, order.tripId);
        await cleanupEmptyTripTx(tx, order.tripId);
      }
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
 */
export async function advanceOrders(orderIds: string[], from: OrderStatusKey): Promise<ActionResult<{ count: number; ids: string[] }>> {
  const admin = await requireAdmin();
  const to = STATUS_META[from]?.next;
  if (!to || orderIds.length === 0 || !OFFICE_ADVANCE.includes(from)) return fail("Nothing to update.");
  try {
    const ids = await serializable(async tx => {
      const moved = await tx.$queryRaw<{ id: string }[]>`
        UPDATE "Order" SET "status" = ${to}::"OrderStatus", "updatedAt" = NOW()
        WHERE "id" = ANY(${orderIds}::text[]) AND "status" = ${from}::"OrderStatus"
        RETURNING "id"
      `;
      const movedIds = moved.map(o => o.id);
      if (movedIds.length) {
        await tx.orderStatusEvent.createMany({
          data: movedIds.map(orderId => ({ orderId, fromStatus: from, toStatus: to, actorId: admin.id })),
        });
        if (to === "PACKED") await autoAssignPackedOrdersTx(tx, movedIds);
      }
      return movedIds;
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
        include: {
          trip: { select: { status: true } },
          stockMovements: { select: { variantId: true, quantity: true } },
        },
      });
      if (!order) throw new UserError("Order not found.");
      if (order.status === "CANCELLED" || order.status === "COMPLETED") {
        throw new UserError(`A ${STATUS_META[order.status].label.toLowerCase()} order can't be cancelled.`);
      }
      const plannedTripId = order.tripId && order.trip?.status === "PLANNED" ? order.tripId : null;
      await cancelOrderTx(tx, order, admin.id, note, "Cancelled");
      if (plannedTripId) {
        await renumberTripTx(tx, plannedTripId);
        await cleanupEmptyTripTx(tx, plannedTripId);
      }
    });
    invalidate("admin", "orders", "staff", "shop");
    return ok(null);
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}

/**
 * Bulk-cancel up to 50 open orders in one batched transaction: compensating
 * stock returns, status update, timeline events, and planned-trip cleanup.
 */
export async function cancelOrders(
  orderIds: string[],
  reason: string
): Promise<ActionResult<{ count: number; skipped: number }>> {
  const admin = await requireAdmin();
  const note = reason.trim();
  if (note.length < 3) return fail("Add a short reason for cancelling.");
  const ids = [...new Set(orderIds)].filter(Boolean).slice(0, 50);
  if (ids.length === 0) return fail("Pick at least one order to cancel.");
  try {
    const res = await serializable(async tx => {
      const orders = await tx.order.findMany({
        where: { id: { in: ids }, status: { notIn: ["CANCELLED", "COMPLETED"] } },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          tripId: true,
          trip: { select: { status: true } },
          stockMovements: { select: { variantId: true, quantity: true } },
        },
      });
      if (orders.length === 0) return { count: 0, skipped: ids.length };

      const returnRows: { variantId: string; quantity: number; reason: string; orderId: string; actorId: string }[] = [];
      for (const o of orders) {
        const code = orderCode(o.orderNumber);
        const held = new Map<string, number>();
        for (const m of o.stockMovements) held.set(m.variantId, (held.get(m.variantId) ?? 0) - m.quantity);
        for (const [variantId, q] of held.entries()) {
          if (q > 0) {
            returnRows.push({
              variantId,
              quantity: q,
              reason: `Cancelled — ${code} (back to stock)`,
              orderId: o.id,
              actorId: admin.id,
            });
          }
        }
      }
      if (returnRows.length) await tx.stockMovement.createMany({ data: returnRows });

      const cancelIds = orders.map(o => o.id);
      await tx.order.updateMany({
        where: { id: { in: cancelIds } },
        data: { status: "CANCELLED", tripId: null, stopIndex: null, loadedAt: null },
      });
      await tx.orderStatusEvent.createMany({
        data: orders.map(o => ({
          orderId: o.id,
          fromStatus: o.status,
          toStatus: "CANCELLED" as const,
          actorId: admin.id,
          note,
        })),
      });

      const plannedTrips = new Set(orders.filter(o => o.tripId && o.trip?.status === "PLANNED").map(o => o.tripId!));
      for (const tripId of plannedTrips) {
        await renumberTripTx(tx, tripId);
        await cleanupEmptyTripTx(tx, tripId);
      }

      return { count: orders.length, skipped: ids.length - orders.length };
    });
    invalidate("admin", "orders", "staff", "shop");
    return ok(res);
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}

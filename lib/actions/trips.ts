"use server";

import { timingSafeEqual } from "node:crypto";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { DELIVERY_SLOTS, orderCode, PIN_MAX_TRIES, routeRank, slotRank, tripCode } from "@/lib/meta";
import { parsePesoInput, peso } from "@/lib/money";
import { parseDayKey } from "@/lib/time";
import { dbError, fail, ok, invalidate, serializable, UserError, type ActionResult, type Area } from "./util";

/**
 * Packing, loading, dispatch and delivery. Every order status change writes
 * an OrderStatusEvent with the staff member as actor, so the order timeline
 * shows who packed it, which trip carried it and how the handoff was proven.
 * None of this touches the stock ledger: stock left the shelf at checkout.
 */

const PACKERS = ["ADMIN", "PACKER"] as const;
const LOADERS = ["ADMIN", "PACKER", "DRIVER"] as const;
const DRIVERS = ["ADMIN", "DRIVER"] as const;
const OFFICE = ["ADMIN"] as const;

/**
 * What each kind of action refreshes. Packer and driver actions run from the
 * staff screens, so they refresh those and the customer's order views; only
 * office (dispatch) actions also re-render the admin. Everyone else's screens
 * render fresh on their next visit either way.
 */
const STAFF_AREAS: Area[] = ["staff", "orders"];
const OFFICE_AREAS: Area[] = ["staff", "admin", "orders"];

async function run<T>(work: () => Promise<T>, areas: Area[] = STAFF_AREAS): Promise<ActionResult<T>> {
  try {
    const data = await work();
    invalidate(...areas);
    return ok(data);
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}

// ── Packing ──────────────────────────────────────────────────────────────────

/**
 * Confirmed → Packed. Returns the next order waiting to be packed (earliest
 * delivery day and slot, then oldest), so the packer goes straight to it.
 */
export async function markPacked(orderId: string): Promise<ActionResult<{ next: string | null }>> {
  const me = await requireRole(PACKERS, "/staff/pack");
  return run(async () => {
    await prisma.$transaction(async tx => {
      // The status guard is in the UPDATE itself: two packers can't both pack it.
      const { count } = await tx.order.updateMany({ where: { id: orderId, status: "CONFIRMED" }, data: { status: "PACKED" } });
      if (count !== 1) {
        const o = await tx.order.findUnique({ where: { id: orderId }, select: { status: true } });
        if (!o) throw new UserError("Order not found.");
        throw new UserError(o.status === "PACKED" ? "Someone already packed this order." : "This order isn't waiting to be packed.");
      }
      await tx.orderStatusEvent.create({ data: { orderId, fromStatus: "CONFIRMED", toStatus: "PACKED", actorId: me.id } });
    });
    const waiting = await prisma.order.findMany({
      where: { status: "CONFIRMED" },
      select: { orderNumber: true, deliveryDate: true, deliverySlot: true, createdAt: true },
      orderBy: [{ deliveryDate: "asc" }, { createdAt: "asc" }],
      take: 60,
    });
    const next = waiting.sort(
      (a, b) =>
        (a.deliveryDate?.getTime() ?? Infinity) - (b.deliveryDate?.getTime() ?? Infinity) ||
        slotRank(a.deliverySlot) - slotRank(b.deliverySlot) ||
        a.createdAt.getTime() - b.createdAt.getTime()
    )[0];
    return { next: next ? orderCode(next.orderNumber) : null };
  });
}

/** Undo a pack (Packed → Confirmed) while the order isn't planned on a trip. */
export async function undoPacked(orderId: string): Promise<ActionResult> {
  const me = await requireRole(PACKERS, "/staff/pack");
  return run(() =>
    serializable(async tx => {
      const o = await tx.order.findUnique({ where: { id: orderId }, select: { status: true, tripId: true } });
      if (!o || o.status !== "PACKED") throw new UserError("The order changed since; nothing was undone.");
      if (o.tripId) throw new UserError("It's already planned on a trip. Ask the office to take it off first.");
      await tx.order.update({ where: { id: orderId }, data: { status: "CONFIRMED" } });
      await tx.orderStatusEvent.create({
        data: { orderId, fromStatus: "PACKED", toStatus: "CONFIRMED", actorId: me.id, note: "Undo" },
      });
      return null;
    })
  );
}

// ── Dispatch (office) ────────────────────────────────────────────────────────

async function plannedTrip(tx: Prisma.TransactionClient, tripId: string) {
  const t = await tx.trip.findUnique({ where: { id: tripId }, select: { id: true, status: true, date: true, slot: true } });
  if (!t) throw new UserError("Trip not found.");
  if (t.status !== "PLANNED") throw new UserError("This trip has already left. Its stops can't change now.");
  return t;
}

type StopRow = { id: string; stopIndex: number | null };

function stopsOf(tx: Prisma.TransactionClient, tripId: string): Promise<StopRow[]> {
  return tx.order.findMany({
    where: { tripId },
    orderBy: [{ stopIndex: "asc" }, { createdAt: "asc" }],
    select: { id: true, stopIndex: true },
  });
}

/**
 * Write stop numbers for many orders in one statement instead of one round
 * trip per row. With `tripId` it also puts them on that trip and clears their
 * loading tick (drafting a trip).
 */
async function setStopNumbers(tx: Prisma.TransactionClient, rows: { id: string; stop: number }[], tripId?: string) {
  if (rows.length === 0) return;
  const ids = rows.map(r => r.id);
  const stops = rows.map(r => r.stop);
  if (tripId) {
    await tx.$executeRaw`
      UPDATE "Order" AS o
      SET "stopIndex" = v.stop, "tripId" = ${tripId}, "loadedAt" = NULL, "updatedAt" = NOW()
      FROM unnest(${ids}::text[], ${stops}::int[]) AS v(id, stop)
      WHERE o."id" = v.id`;
  } else {
    await tx.$executeRaw`
      UPDATE "Order" AS o
      SET "stopIndex" = v.stop, "updatedAt" = NOW()
      FROM unnest(${ids}::text[], ${stops}::int[]) AS v(id, stop)
      WHERE o."id" = v.id`;
  }
}

/** Only the rows whose number changes when `ids` is numbered 1..n. */
function changedStops(current: StopRow[], ids: string[]) {
  const now = new Map(current.map(r => [r.id, r.stopIndex]));
  return ids.map((id, i) => ({ id, stop: i + 1 })).filter(r => now.get(r.id) !== r.stop);
}

/** Renumber a trip's stops 1..n in their current order. */
async function renumber(tx: Prisma.TransactionClient, tripId: string) {
  const current = await stopsOf(tx, tripId);
  await setStopNumbers(tx, changedStops(current, current.map(r => r.id)));
}

export type DraftTripInput = { day: string; slot: string; driverId: string | null; vehicle: string };

/**
 * Draft a trip for one delivery day and slot. Every packed order for that
 * slot that isn't on a trip yet comes along, in the fixed barangay route
 * order (lib/meta.ts BARANGAY_ROUTE); the office can reorder after.
 */
export async function draftTrip(input: DraftTripInput): Promise<ActionResult<{ id: string; code: string; stops: number }>> {
  await requireRole(OFFICE, "/admin/dispatch");
  const date = parseDayKey(input.day);
  const vehicle = input.vehicle.trim();
  if (!date) return fail("Pick a delivery day.");
  if (!(DELIVERY_SLOTS as readonly string[]).includes(input.slot)) return fail("Pick a delivery slot.");
  if (vehicle.length < 2) return fail("Name the vehicle, like Truck 1.");
  return run(() =>
    serializable(async tx => {
      if (input.driverId) await assertDriver(tx, input.driverId);
      const trip = await tx.trip.create({
        data: { date, slot: input.slot, vehicle, driverId: input.driverId },
        select: { id: true, tripNumber: true },
      });
      const packed = await tx.order.findMany({
        where: { status: "PACKED", tripId: null, deliveryDate: date, deliverySlot: input.slot },
        select: { id: true, deliveryBarangay: true, createdAt: true },
      });
      const ordered = packed
        .sort((a, b) => routeRank(a.deliveryBarangay) - routeRank(b.deliveryBarangay) || a.createdAt.getTime() - b.createdAt.getTime())
        .map(o => o.id);
      await setStopNumbers(
        tx,
        ordered.map((id, i) => ({ id, stop: i + 1 })),
        trip.id
      );
      return { id: trip.id, code: tripCode(trip.tripNumber), stops: ordered.length };
    }),
    OFFICE_AREAS
  );
}

async function assertDriver(tx: Prisma.TransactionClient, driverId: string) {
  const u = await tx.user.findUnique({ where: { id: driverId }, select: { role: true } });
  if (u?.role !== "DRIVER") throw new UserError("Pick a driver account.");
}

/** Change a planned trip's driver or vehicle label. */
export async function updateTrip(tripId: string, patch: { driverId?: string | null; vehicle?: string }): Promise<ActionResult> {
  await requireRole(OFFICE, "/admin/dispatch");
  const vehicle = patch.vehicle?.trim();
  if (vehicle !== undefined && vehicle.length < 2) return fail("Name the vehicle, like Truck 1.");
  return run(() =>
    serializable(async tx => {
      await plannedTrip(tx, tripId);
      if (patch.driverId) await assertDriver(tx, patch.driverId);
      await tx.trip.update({
        where: { id: tripId },
        data: { ...(patch.driverId !== undefined ? { driverId: patch.driverId } : {}), ...(vehicle ? { vehicle } : {}) },
      });
      return null;
    }),
    OFFICE_AREAS
  );
}

/** Move a stop one place earlier (-1) or later (+1) on a planned trip. */
export async function moveStop(tripId: string, orderId: string, dir: -1 | 1): Promise<ActionResult> {
  await requireRole(OFFICE, "/admin/dispatch");
  return run(() =>
    serializable(async tx => {
      await plannedTrip(tx, tripId);
      const stops = await stopsOf(tx, tripId);
      const ids = stops.map(s => s.id);
      const i = ids.indexOf(orderId);
      const j = i + dir;
      if (i === -1) throw new UserError("That order isn't on this trip any more.");
      if (j < 0 || j >= ids.length) return null;
      [ids[i], ids[j]] = [ids[j], ids[i]];
      // Usually just the two swapped stops change: one statement.
      await setStopNumbers(tx, changedStops(stops, ids));
      return null;
    }),
    OFFICE_AREAS
  );
}

/**
 * Put a packed order on a planned trip (as its last stop), or take it off its
 * trip (`tripId` null) so it waits for another one. Moving resets its loading
 * tick, since the bag has to go on a different vehicle.
 */
export async function setOrderTrip(orderId: string, tripId: string | null): Promise<ActionResult> {
  await requireRole(OFFICE, "/admin/dispatch");
  return run(() =>
    serializable(async tx => {
      const o = await tx.order.findUnique({
        where: { id: orderId },
        select: { status: true, tripId: true, deliveryDate: true, deliverySlot: true, trip: { select: { status: true } } },
      });
      if (!o) throw new UserError("Order not found.");
      if (o.status !== "PACKED") throw new UserError("Only packed orders can go on a trip.");
      if (o.trip && o.trip.status !== "PLANNED") throw new UserError("Its trip has already left.");
      if (tripId) {
        const t = await plannedTrip(tx, tripId);
        if (o.deliveryDate && (t.date.getTime() !== o.deliveryDate.getTime() || t.slot !== o.deliverySlot)) {
          throw new UserError("That trip runs a different day or slot than this order.");
        }
        const last = await tx.order.aggregate({ where: { tripId }, _max: { stopIndex: true } });
        await tx.order.update({ where: { id: orderId }, data: { tripId, stopIndex: (last._max.stopIndex ?? 0) + 1, loadedAt: null } });
      } else {
        await tx.order.update({ where: { id: orderId }, data: { tripId: null, stopIndex: null, loadedAt: null } });
      }
      if (o.tripId) await renumber(tx, o.tripId);
      return null;
    }),
    OFFICE_AREAS
  );
}

/**
 * Scrap a drafted trip that hasn't left: its orders go back to waiting for a
 * trip. A trip that left is part of the delivery record and is never removed.
 */
export async function scrapTrip(tripId: string): Promise<ActionResult> {
  await requireRole(OFFICE, "/admin/dispatch");
  return run(() =>
    serializable(async tx => {
      await plannedTrip(tx, tripId);
      await tx.order.updateMany({ where: { tripId }, data: { tripId: null, stopIndex: null, loadedAt: null } });
      await tx.trip.delete({ where: { id: tripId } });
      return null;
    }),
    OFFICE_AREAS
  );
}

// ── Loading ──────────────────────────────────────────────────────────────────

/** Tick a bag onto (or off) the truck while the trip is being loaded. */
export async function setLoaded(orderId: string, loaded: boolean): Promise<ActionResult> {
  await requireRole(LOADERS, "/staff/load");
  return run(async () => {
    // One conditional write: only a packed order on a trip that hasn't left.
    const { count } = await prisma.order.updateMany({
      where: { id: orderId, status: "PACKED", trip: { is: { status: "PLANNED" } } },
      data: { loadedAt: loaded ? new Date() : null },
    });
    if (count === 1) return null;
    // Nothing changed: one read to say why.
    const o = await prisma.order.findUnique({
      where: { id: orderId },
      select: { tripId: true, trip: { select: { status: true } } },
    });
    if (!o?.tripId) throw new UserError("This order isn't on a trip any more.");
    if (o.trip && o.trip.status !== "PLANNED") throw new UserError("This trip has already left. Its stops can't change now.");
    throw new UserError("This order isn't packed. It may have been cancelled.");
  });
}

// ── The trip ─────────────────────────────────────────────────────────────────

/** The trip's own driver, or an admin. Returns the trip row. */
async function driverTrip(tx: Prisma.TransactionClient, tripId: string, me: { id: string; role: string }) {
  const t = await tx.trip.findUnique({ where: { id: tripId }, select: { id: true, tripNumber: true, status: true, driverId: true } });
  if (!t) throw new UserError("Trip not found.");
  if (me.role !== "ADMIN" && t.driverId !== me.id) throw new UserError("This trip is assigned to another driver.");
  return t;
}

/**
 * The truck leaves: every stop must be packed and loaded. Each order moves
 * Packed → On the truck with its stop number on the timeline.
 */
export async function startTrip(tripId: string): Promise<ActionResult> {
  const me = await requireRole(DRIVERS, "/staff/trip");
  return run(() =>
    serializable(async tx => {
      const t = await driverTrip(tx, tripId, me);
      if (t.status !== "PLANNED") throw new UserError("This trip has already left.");
      if (!t.driverId) throw new UserError("Assign a driver before the trip leaves.");
      const stops = await tx.order.findMany({
        where: { tripId },
        orderBy: [{ stopIndex: "asc" }, { createdAt: "asc" }],
        select: { id: true, status: true, loadedAt: true, orderNumber: true, stopIndex: true },
      });
      if (stops.length === 0) throw new UserError("This trip has no stops.");
      const notPacked = stops.filter(s => s.status !== "PACKED");
      if (notPacked.length) {
        throw new UserError(`${notPacked.map(s => orderCode(s.orderNumber)).join(", ")} isn't packed any more. Ask the office.`);
      }
      const notLoaded = stops.filter(s => !s.loadedAt);
      if (notLoaded.length) throw new UserError(`${notLoaded.length} bag${notLoaded.length === 1 ? " isn't" : "s aren't"} loaded yet.`);

      const code = tripCode(t.tripNumber);
      // Batched: changed stop numbers in one statement, one status update,
      // one insert for every timeline event.
      await setStopNumbers(tx, changedStops(stops, stops.map(s => s.id)));
      await tx.order.updateMany({ where: { tripId, status: "PACKED" }, data: { status: "READY" } });
      await tx.orderStatusEvent.createMany({
        data: stops.map((s, i) => ({
          orderId: s.id,
          fromStatus: "PACKED" as const,
          toStatus: "READY" as const,
          actorId: me.id,
          note: `On the truck · ${code} stop ${i + 1} of ${stops.length}`,
        })),
      });
      await tx.trip.update({ where: { id: tripId }, data: { status: "OUT", departedAt: new Date() } });
      return null;
    })
  );
}

export type HandoffInput =
  | { kind: "pin"; pin: string; codCollected: boolean }
  | { kind: "fallback"; reason: string; receivedBy: string; codCollected: boolean };

function samePin(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Finish a stop. With the customer's PIN it is recorded as "PIN verified";
 * without it the driver must give a reason and who received the order, and
 * the timeline says "No PIN", which the office's inbox flags. A wrong PIN is
 * counted; after PIN_MAX_TRIES only the logged reason can finish the stop.
 * Cash-on-delivery stops also need the driver to confirm the cash.
 */
export async function completeStop(
  orderId: string,
  input: HandoffInput
): Promise<ActionResult<{ wrongPin: false } | { wrongPin: true; triesLeft: number }>> {
  const me = await requireRole(DRIVERS, "/staff/trip");
  if (input.kind === "pin" && !/^\d{4}$/.test(input.pin)) return fail("Enter all 4 digits of the PIN.");
  if (input.kind === "fallback") {
    if (input.reason.trim().length < 3) return fail("Pick or type why there's no PIN.");
    if (input.receivedBy.trim().length < 2) return fail("Type the name of the person who received it.");
  }
  return run(() =>
    serializable(async tx => {
      const o = await tx.order.findUnique({
        where: { id: orderId },
        select: { status: true, tripId: true, paymentMethod: true, totalCentavos: true, handoffPin: true, pinAttempts: true },
      });
      if (!o?.tripId) throw new UserError("This order isn't on a trip.");
      await driverTrip(tx, o.tripId, me);
      if (o.status !== "READY") {
        throw new UserError(o.status === "COMPLETED" ? "This stop is already delivered." : "This order isn't on the truck.");
      }
      if (o.paymentMethod === "COD" && !input.codCollected) throw new UserError(`Confirm you collected ${peso(o.totalCentavos)} in cash.`);

      let how: string;
      if (input.kind === "pin") {
        if (!o.handoffPin) throw new UserError("This order has no PIN. Finish it with a reason instead.");
        if (o.pinAttempts >= PIN_MAX_TRIES) throw new UserError("The PIN is locked after too many wrong tries. Finish with a reason.");
        if (!samePin(input.pin, o.handoffPin)) {
          // Count the miss and keep it: returning (not throwing) commits it.
          const n = o.pinAttempts + 1;
          await tx.order.update({ where: { id: orderId }, data: { pinAttempts: n } });
          return { wrongPin: true as const, triesLeft: Math.max(0, PIN_MAX_TRIES - n) };
        }
        how = "PIN verified";
      } else {
        how = `No PIN: ${input.reason.trim()} · received by ${input.receivedBy.trim()}`;
      }
      const cash = o.paymentMethod === "COD" ? ` · COD ${peso(o.totalCentavos)} collected` : "";
      await tx.order.update({ where: { id: orderId }, data: { status: "COMPLETED" } });
      await tx.orderStatusEvent.create({
        data: { orderId, fromStatus: "READY", toStatus: "COMPLETED", actorId: me.id, note: `${how}${cash}` },
      });
      return { wrongPin: false as const };
    })
  );
}

/**
 * The driver couldn't deliver: the order comes back with the truck, returns
 * to Packed and leaves the trip, so the office can send it on a later one (or
 * cancel it). The reason goes on the timeline.
 */
export async function failStop(orderId: string, reason: string): Promise<ActionResult> {
  const me = await requireRole(DRIVERS, "/staff/trip");
  const why = reason.trim();
  if (why.length < 3) return fail("Pick or type why it couldn't be delivered.");
  return run(() =>
    serializable(async tx => {
      const o = await tx.order.findUnique({ where: { id: orderId }, select: { status: true, tripId: true } });
      if (!o?.tripId) throw new UserError("This order isn't on a trip.");
      const t = await driverTrip(tx, o.tripId, me);
      if (o.status !== "READY") throw new UserError("This order isn't on the truck.");
      await tx.order.update({ where: { id: orderId }, data: { status: "PACKED", tripId: null, stopIndex: null, loadedAt: null } });
      await tx.orderStatusEvent.create({
        data: {
          orderId,
          fromStatus: "READY",
          toStatus: "PACKED",
          actorId: me.id,
          note: `Couldn't deliver (${tripCode(t.tripNumber)}): ${why}`,
        },
      });
      return null;
    })
  );
}

/** Back at the stall: every stop must be delivered or brought back. */
export async function returnTrip(tripId: string): Promise<ActionResult> {
  const me = await requireRole(DRIVERS, "/staff/trip");
  return run(() =>
    serializable(async tx => {
      const t = await driverTrip(tx, tripId, me);
      if (t.status !== "OUT") throw new UserError(t.status === "PLANNED" ? "This trip hasn't left yet." : "This trip is already back.");
      const open = await tx.order.count({ where: { tripId, status: "READY" } });
      if (open) throw new UserError(`${open} stop${open === 1 ? " is" : "s are"} still on the truck. Deliver or bring back each one first.`);
      await tx.trip.update({ where: { id: tripId }, data: { status: "RETURNED", returnedAt: new Date() } });
      return null;
    })
  );
}

/**
 * The office counts the cash the driver hands in. Expected = the totals of
 * the trip's delivered cash-on-delivery orders. A different amount needs a
 * note. This records a handover between staff; no payment is processed.
 */
export async function confirmRemit(tripId: string, receivedInput: string, note: string): Promise<ActionResult<{ received: number }>> {
  const admin = await requireRole(OFFICE, "/admin/dispatch");
  const received = parsePesoInput(receivedInput);
  if (received === null) return fail("Enter the cash amount, like 1,250 or 1250.50.");
  return run(() =>
    serializable(async tx => {
      const t = await tx.trip.findUnique({ where: { id: tripId }, select: { status: true } });
      if (!t) throw new UserError("Trip not found.");
      if (t.status !== "RETURNED") throw new UserError(t.status === "REMITTED" ? "This trip's cash is already confirmed." : "The truck isn't back yet.");
      const sum = await tx.order.aggregate({
        where: { tripId, status: "COMPLETED", paymentMethod: "COD" },
        _sum: { totalCentavos: true },
      });
      const expected = sum._sum.totalCentavos ?? 0;
      const why = note.trim();
      if (received !== expected && why.length < 3) {
        throw new UserError(`Expected ${peso(expected)}. Add a note explaining the difference.`);
      }
      await tx.trip.update({
        where: { id: tripId },
        data: {
          status: "REMITTED",
          cashRemittedCentavos: received,
          remitNote: why || null,
          remitConfirmedById: admin.id,
          remittedAt: new Date(),
        },
      });
      return { received };
    }),
    OFFICE_AREAS
  );
}

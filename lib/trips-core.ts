import "server-only";
import type { Prisma } from "@prisma/client";
import { routeRank, SLOT_CAPACITY, tripCode, VEHICLES } from "@/lib/meta";
import { dayKey } from "@/lib/time";

/**
 * Transaction-level trip helpers shared by staff packing and admin order/trip
 * actions. Deliberately NOT a "use server" module: callers authenticate first
 * and pass a `serializable()` transaction client.
 */

export type StopRow = { id: string; stopIndex: number | null };

export function stopsOf(tx: Prisma.TransactionClient, tripId: string): Promise<StopRow[]> {
  return tx.order.findMany({
    where: { tripId },
    orderBy: [{ stopIndex: "asc" }, { createdAt: "asc" }],
    select: { id: true, stopIndex: true },
  });
}

/** Only the rows whose number changes when `ids` is numbered 1..n. */
export function changedStops(current: StopRow[], ids: string[]) {
  const now = new Map(current.map(r => [r.id, r.stopIndex]));
  return ids.map((id, i) => ({ id, stop: i + 1 })).filter(r => now.get(r.id) !== r.stop);
}

/**
 * Write stop numbers for orders already on a trip in one statement. Never
 * touches `loadedAt`, so bags already ticked onto the truck stay ticked.
 */
export async function setStopNumbers(tx: Prisma.TransactionClient, rows: { id: string; stop: number }[]) {
  if (rows.length === 0) return;
  const ids = rows.map(r => r.id);
  const stops = rows.map(r => r.stop);
  await tx.$executeRaw`
    UPDATE "Order" AS o
    SET "stopIndex" = v.stop, "updatedAt" = NOW()
    FROM unnest(${ids}::text[], ${stops}::int[]) AS v(id, stop)
    WHERE o."id" = v.id`;
}

/**
 * Attach newly assigned orders to a trip in one statement, clearing any stale
 * loading tick because the bag is going onto this vehicle.
 */
export async function assignOrdersToTrip(tx: Prisma.TransactionClient, rows: { id: string; stop: number }[], tripId: string) {
  if (rows.length === 0) return;
  const ids = rows.map(r => r.id);
  const stops = rows.map(r => r.stop);
  await tx.$executeRaw`
    UPDATE "Order" AS o
    SET "stopIndex" = v.stop, "tripId" = ${tripId}, "loadedAt" = NULL, "updatedAt" = NOW()
    FROM unnest(${ids}::text[], ${stops}::int[]) AS v(id, stop)
    WHERE o."id" = v.id`;
}

/** Renumber a trip's stops 1..n in their current order. */
export async function renumberTripTx(tx: Prisma.TransactionClient, tripId: string) {
  const current = await stopsOf(tx, tripId);
  await setStopNumbers(tx, changedStops(current, current.map(r => r.id)));
}

/** Delete an auto-planned or drafted trip if all its stops were removed/undone. */
export async function cleanupEmptyTripTx(tx: Prisma.TransactionClient, tripId: string) {
  const trip = await tx.trip.findUnique({
    where: { id: tripId },
    select: { status: true, _count: { select: { orders: true } } },
  });
  if (trip && trip.status === "PLANNED" && trip._count.orders === 0) {
    await tx.trip.delete({ where: { id: tripId } });
  }
}

/**
 * Auto-assign newly packed orders (that have a delivery date and no trip yet)
 * to a PLANNED trip for their `(deliveryDate, deliverySlot)` in barangay route
 * order (`BARANGAY_ROUTE`). If no planned trip has room (< SLOT_CAPACITY),
 * drafts a new one with the least-loaded driver and next available vehicle.
 * Returns `orderId -> tripCode` for caller toast/UI feedback.
 */
export async function autoAssignPackedOrdersTx(tx: Prisma.TransactionClient, orderIds: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (orderIds.length === 0) return result;

  const orders = await tx.order.findMany({
    where: { id: { in: orderIds }, status: "PACKED", tripId: null, deliveryDate: { not: null } },
    select: { id: true, deliveryDate: true, deliverySlot: true, deliveryBarangay: true, createdAt: true },
  });
  if (orders.length === 0) return result;

  type PackedRow = (typeof orders)[number];
  const groups = new Map<string, { date: Date; slot: string; rows: PackedRow[] }>();
  for (const o of orders) {
    const date = o.deliveryDate!;
    const key = `${dayKey(date)}|${o.deliverySlot}`;
    let g = groups.get(key);
    if (!g) {
      g = { date, slot: o.deliverySlot, rows: [] };
      groups.set(key, g);
    }
    g.rows.push(o);
  }

  let driversCache: { id: string }[] | null = null;
  const getDrivers = async () => {
    if (!driversCache) {
      driversCache = await tx.user.findMany({
        where: { role: "DRIVER" },
        orderBy: [{ name: "asc" }, { email: "asc" }],
        select: { id: true },
      });
    }
    return driversCache;
  };

  for (const { date, slot, rows } of groups.values()) {
    const sorted = [...rows].sort(
      (a, b) => routeRank(a.deliveryBarangay) - routeRank(b.deliveryBarangay) || a.createdAt.getTime() - b.createdAt.getTime()
    );

    const planned = await tx.trip.findMany({
      where: { date, slot, status: "PLANNED" },
      orderBy: { tripNumber: "asc" },
      select: {
        id: true,
        tripNumber: true,
        orders: {
          orderBy: [{ stopIndex: "asc" }, { createdAt: "asc" }],
          select: { id: true, deliveryBarangay: true, stopIndex: true },
        },
      },
    });

    type CandidateTrip = {
      id: string;
      code: string;
      stops: { id: string; barangay: string; isNew: boolean; prevStop: number | null }[];
    };
    const openTrips: CandidateTrip[] = planned
      .filter(t => t.orders.length < SLOT_CAPACITY)
      .map(t => ({
        id: t.id,
        code: tripCode(t.tripNumber),
        stops: t.orders.map(o => ({ id: o.id, barangay: o.deliveryBarangay, isNew: false, prevStop: o.stopIndex })),
      }));

    let dayTripsCache: { slot: string; driverId: string | null; vehicle: string }[] | null = null;
    const createPlannedTrip = async (): Promise<CandidateTrip> => {
      const [drivers, dayTrips] = await Promise.all([
        getDrivers(),
        dayTripsCache
          ? Promise.resolve(dayTripsCache)
          : tx.trip.findMany({ where: { date }, select: { slot: true, driverId: true, vehicle: true } }).then(xs => {
              dayTripsCache = xs;
              return xs;
            }),
      ]);

      const slotTrips = dayTrips.filter(t => t.slot === slot);
      const slotDrivers = new Set(slotTrips.map(t => t.driverId).filter((id): id is string => !!id));
      const dayLoad = new Map<string, number>();
      for (const t of dayTrips) {
        if (t.driverId) dayLoad.set(t.driverId, (dayLoad.get(t.driverId) ?? 0) + 1);
      }

      const pool = drivers.filter(d => !slotDrivers.has(d.id));
      const candidates = pool.length > 0 ? pool : drivers;
      const pickedDriver =
        [...candidates].sort((a, b) => (dayLoad.get(a.id) ?? 0) - (dayLoad.get(b.id) ?? 0))[0]?.id ?? null;

      const usedVehicles = new Set(slotTrips.map(t => t.vehicle));
      const pickedVehicle = VEHICLES.find(v => !usedVehicles.has(v)) ?? VEHICLES[0];

      const created = await tx.trip.create({
        data: { date, slot, vehicle: pickedVehicle, driverId: pickedDriver },
        select: { id: true, tripNumber: true },
      });
      dayTrips.push({ slot, driverId: pickedDriver, vehicle: pickedVehicle });
      return { id: created.id, code: tripCode(created.tripNumber), stops: [] };
    };

    let idx = 0;
    let tripIdx = 0;
    while (idx < sorted.length) {
      const target = openTrips[tripIdx] ?? (await createPlannedTrip());
      if (tripIdx >= openTrips.length) openTrips.push(target);

      const room = SLOT_CAPACITY - target.stops.length;
      if (room <= 0) {
        tripIdx++;
        continue;
      }

      const batch = sorted.slice(idx, idx + room);
      idx += batch.length;

      for (const inc of batch) {
        const incRank = routeRank(inc.deliveryBarangay);
        let insertAt = target.stops.findIndex(s => routeRank(s.barangay) > incRank);
        if (insertAt === -1) insertAt = target.stops.length;
        target.stops.splice(insertAt, 0, { id: inc.id, barangay: inc.deliveryBarangay, isNew: true, prevStop: null });
        result.set(inc.id, target.code);
      }

      const existingUpdates = target.stops
        .map((s, i) => ({ id: s.id, stop: i + 1, isNew: s.isNew, prevStop: s.prevStop }))
        .filter(s => !s.isNew && s.prevStop !== s.stop)
        .map(({ id, stop }) => ({ id, stop }));
      const newAssignments = target.stops
        .map((s, i) => ({ id: s.id, stop: i + 1, isNew: s.isNew }))
        .filter(s => s.isNew)
        .map(({ id, stop }) => ({ id, stop }));

      await setStopNumbers(tx, existingUpdates);
      await assignOrdersToTrip(tx, newAssignments, target.id);

      // Update local state in case another loop runs (already exhausted room if full).
      for (const s of target.stops) {
        s.isNew = false;
        s.prevStop = target.stops.indexOf(s) + 1;
      }
      tripIdx++;
    }
  }

  return result;
}

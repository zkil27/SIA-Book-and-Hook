import "server-only";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  DELIVERY_SLOTS,
  firstName,
  orderCode,
  PIN_MAX_TRIES,
  slotRank,
  splitName,
  tripCode,
  type OrderStatusKey,
  type TripStatusKey,
} from "@/lib/meta";
import { addDays, dayKey, deliveryDateFor, shopDate, startOfShopDay } from "@/lib/time";

/**
 * Reads for the packing, loading, trip and dispatch screens.
 *
 * Privacy rule: `handoffPin` is never selected here. Staff only ever learn
 * whether an order has a PIN and whether it is locked; the PIN itself is shown
 * to the customer alone (lib/orders.ts).
 */

// ── Packing ──────────────────────────────────────────────────────────────────

export type PackLine = { name: string; variant: string; qty: number };

export type PackOrder = {
  id: string;
  code: string;
  status: OrderStatusKey;
  firstName: string;
  barangay: string;
  slot: string;
  day: string | null; // day key
  placedAt: string;
  lines: PackLine[];
  units: number;
  trip: { code: string; stop: number | null } | null;
  /** For the bag label's payment band: COD shows the cash to collect. */
  payment: "GCASH" | "COD";
  total: number;
};

/**
 * Nested reads load in one SQL statement with a lateral join instead of one
 * query per relation level (Prisma `relationJoins` preview).
 */
const JOIN = { relationLoadStrategy: "join" } as const;

const packSelect = {
  id: true,
  orderNumber: true,
  status: true,
  deliveryName: true,
  deliveryBarangay: true,
  deliverySlot: true,
  deliveryDate: true,
  createdAt: true,
  stopIndex: true,
  paymentMethod: true,
  totalCentavos: true,
  trip: { select: { tripNumber: true } },
  items: {
    select: { quantity: true, variant: { select: { name: true, product: { select: { name: true } } } } },
  },
} satisfies Prisma.OrderSelect;

type PackRow = Prisma.OrderGetPayload<{ select: typeof packSelect }>;

function shapePack(o: PackRow): PackOrder {
  const lines = o.items.map(i => ({ name: splitName(i.variant.product.name).local, variant: i.variant.name, qty: i.quantity }));
  return {
    id: o.id,
    code: orderCode(o.orderNumber),
    status: o.status as OrderStatusKey,
    firstName: firstName(o.deliveryName),
    barangay: o.deliveryBarangay,
    slot: o.deliverySlot,
    day: o.deliveryDate ? dayKey(o.deliveryDate) : null,
    placedAt: o.createdAt.toISOString(),
    lines,
    units: lines.reduce((s, l) => s + l.qty, 0),
    trip: o.trip ? { code: tripCode(o.trip.tripNumber), stop: o.stopIndex } : null,
    payment: o.paymentMethod,
    total: o.totalCentavos,
  };
}

/** Sort by delivery day, then slot, then oldest order first. */
function byDaySlot<T extends { day: string | null; slot: string; placedAt: string }>(a: T, b: T) {
  return (
    (a.day ?? "").localeCompare(b.day ?? "") || slotRank(a.slot) - slotRank(b.slot) || a.placedAt.localeCompare(b.placedAt)
  );
}

/** Confirmed orders waiting to be packed. */
export async function packQueue(): Promise<PackOrder[]> {
  const rows = await prisma.order.findMany({ ...JOIN, where: { status: "CONFIRMED" }, select: packSelect, take: 200 });
  return rows.map(shapePack).sort(byDaySlot);
}

export type PackedBag = { code: string; firstName: string; barangay: string; day: string | null; slot: string; trip: string | null };

/**
 * Packed bags still at the stall: the packer's "waiting for the truck" list.
 * Names and barangays only, no items (one flat query).
 */
export async function packedBags(): Promise<PackedBag[]> {
  const rows = await prisma.order.findMany({
    ...JOIN,
    where: { status: "PACKED" },
    select: {
      orderNumber: true,
      deliveryName: true,
      deliveryBarangay: true,
      deliveryDate: true,
      deliverySlot: true,
      createdAt: true,
      trip: { select: { tripNumber: true } },
    },
    orderBy: [{ deliveryDate: "asc" }, { createdAt: "asc" }],
    take: 100,
  });
  return rows.map(o => ({
    code: orderCode(o.orderNumber),
    firstName: firstName(o.deliveryName),
    barangay: o.deliveryBarangay,
    day: o.deliveryDate ? dayKey(o.deliveryDate) : null,
    slot: o.deliverySlot,
    trip: o.trip ? tripCode(o.trip.tripNumber) : null,
  }));
}

/** One order for the pick list. */
export async function packOrder(orderNumber: number): Promise<PackOrder | null> {
  const row = await prisma.order.findUnique({ ...JOIN, where: { orderNumber }, select: packSelect });
  return row ? shapePack(row) : null;
}

export type PullRow = { day: string | null; product: string; variant: string; qty: number; orders: number };

/**
 * "Today's pull": units per variant across every confirmed order, so each fish
 * comes off the ice once instead of once per order. Summed in SQL.
 */
export async function pullTotals(): Promise<PullRow[]> {
  const rows = await prisma.$queryRaw<
    { day: Date | null; product: string; variant: string; qty: bigint; orders: bigint }[]
  >`
    SELECT o."deliveryDate" AS day, p."name" AS product, v."name" AS variant,
      SUM(oi."quantity")::bigint AS qty, COUNT(DISTINCT o."id")::bigint AS orders
    FROM "OrderItem" oi
    JOIN "Order" o ON o."id" = oi."orderId"
    JOIN "ProductVariant" v ON v."id" = oi."variantId"
    JOIN "Product" p ON p."id" = v."productId"
    WHERE o."status" = 'CONFIRMED'
    GROUP BY o."deliveryDate", p."name", v."name"
    ORDER BY o."deliveryDate" ASC NULLS LAST, p."name" ASC, v."name" ASC
  `;
  return rows.map(r => ({
    day: r.day ? dayKey(r.day) : null,
    product: splitName(r.product).local,
    variant: r.variant,
    qty: Number(r.qty),
    orders: Number(r.orders),
  }));
}

// ── Trips ────────────────────────────────────────────────────────────────────

export type Stop = {
  orderId: string;
  code: string;
  status: OrderStatusKey;
  stop: number; // 1-based position in route order
  firstName: string;
  barangay: string;
  units: number;
  lines: PackLine[];
  loaded: boolean;
  payment: "GCASH" | "COD";
  total: number;
  hasPin: boolean;
  pinLocked: boolean;
  triesLeft: number;
  deliveredAt: string | null;
  note: string | null; // how the stop was finished
  /** Full contact: only for the trip's own driver and admins. */
  contact: { name: string; phone: string; address: string } | null;
};

export type TripView = {
  id: string;
  code: string;
  day: string;
  slot: string;
  vehicle: string;
  status: TripStatusKey;
  driver: { id: string; name: string } | null;
  departedAt: string | null;
  returnedAt: string | null;
  stops: Stop[];
  /** COD cash the driver collected on delivered stops. */
  cashCollected: number;
  /** COD cash still to collect on stops on the truck. */
  cashToCollect: number;
};

const tripInclude = {
  driver: { select: { id: true, name: true, email: true } },
  orders: {
    orderBy: [{ stopIndex: "asc" as const }, { createdAt: "asc" as const }],
    select: {
      id: true,
      orderNumber: true,
      status: true,
      deliveryName: true,
      deliveryPhone: true,
      deliveryAddress: true,
      deliveryBarangay: true,
      paymentMethod: true,
      totalCentavos: true,
      loadedAt: true,
      pinAttempts: true,
      // Presence only, never the value: see the privacy rule above.
      handoffPin: true,
      items: { select: { quantity: true, variant: { select: { name: true, product: { select: { name: true } } } } } },
      statusEvents: {
        where: { toStatus: "COMPLETED" as const },
        orderBy: { createdAt: "desc" as const },
        take: 1,
        select: { createdAt: true, note: true },
      },
    },
  },
} satisfies Prisma.TripInclude;

type TripRow = Prisma.TripGetPayload<{ include: typeof tripInclude }>;

function shapeTrip(t: TripRow, withContact: boolean): TripView {
  const stops: Stop[] = t.orders.map((o, i) => {
    const lines = o.items.map(it => ({ name: splitName(it.variant.product.name).local, variant: it.variant.name, qty: it.quantity }));
    const done = o.statusEvents[0];
    return {
      orderId: o.id,
      code: orderCode(o.orderNumber),
      status: o.status as OrderStatusKey,
      stop: i + 1,
      firstName: firstName(o.deliveryName),
      barangay: o.deliveryBarangay,
      units: lines.reduce((s, l) => s + l.qty, 0),
      lines,
      loaded: !!o.loadedAt,
      payment: o.paymentMethod,
      total: o.totalCentavos,
      hasPin: !!o.handoffPin,
      pinLocked: o.pinAttempts >= PIN_MAX_TRIES,
      triesLeft: Math.max(0, PIN_MAX_TRIES - o.pinAttempts),
      deliveredAt: o.status === "COMPLETED" && done ? done.createdAt.toISOString() : null,
      note: o.status === "COMPLETED" && done ? done.note : null,
      contact: withContact ? { name: o.deliveryName, phone: o.deliveryPhone, address: o.deliveryAddress } : null,
    };
  });
  const cod = (s: Stop) => (s.payment === "COD" ? s.total : 0);
  return {
    id: t.id,
    code: tripCode(t.tripNumber),
    day: dayKey(t.date),
    slot: t.slot,
    vehicle: t.vehicle,
    status: t.status as TripStatusKey,
    driver: t.driver ? { id: t.driver.id, name: t.driver.name ?? t.driver.email } : null,
    departedAt: t.departedAt?.toISOString() ?? null,
    returnedAt: t.returnedAt?.toISOString() ?? null,
    stops,
    cashCollected: stops.filter(s => s.status === "COMPLETED").reduce((s, x) => s + cod(x), 0),
    cashToCollect: stops.filter(s => s.status === "READY").reduce((s, x) => s + cod(x), 0),
  };
}

/** One trip. `withContact` adds names, phones and addresses (driver and admin only). */
export async function getTrip(id: string, withContact: boolean): Promise<TripView | null> {
  const row = await prisma.trip.findUnique({ ...JOIN, where: { id }, include: tripInclude });
  return row ? shapeTrip(row, withContact) : null;
}

const byDayThenSlot = (a: TripView, b: TripView) => a.day.localeCompare(b.day) || slotRank(a.slot) - slotRank(b.slot);

/**
 * Trips being loaded (for /staff/load), from yesterday on. A driver sees only
 * their own; packers and admins see every one. No customer contact details.
 */
export async function tripsToLoad(driverId: string | null = null): Promise<TripView[]> {
  const rows = await prisma.trip.findMany({
    ...JOIN,
    where: { status: "PLANNED", date: { gte: addDays(shopDate(), -1) }, ...(driverId ? { driverId } : {}) },
    include: tripInclude,
    orderBy: [{ date: "asc" }, { tripNumber: "asc" }],
    take: 30,
  });
  return rows.map(r => shapeTrip(r, false)).sort(byDayThenSlot);
}

/**
 * A driver's trips: being loaded (from yesterday on), on the road, and today's
 * closed trips. An admin sees everyone's.
 */
export async function openTripsFor(driverId: string | null): Promise<TripView[]> {
  const today = shopDate();
  const rows = await prisma.trip.findMany({
    ...JOIN,
    where: {
      ...(driverId ? { driverId } : {}),
      OR: [
        { status: "PLANNED", date: { gte: addDays(today, -1) } },
        { status: "OUT" },
        { status: { in: ["RETURNED", "REMITTED"] }, returnedAt: { gte: startOfShopDay() } },
      ],
    },
    include: tripInclude,
    orderBy: [{ date: "asc" }, { tripNumber: "asc" }],
    take: 30,
  });
  return rows.map(r => shapeTrip(r, false)).sort(byDayThenSlot);
}

// ── Dispatch board ───────────────────────────────────────────────────────────

export type DispatchOrder = {
  id: string;
  code: string;
  firstName: string;
  barangay: string;
  units: number;
  payment: "GCASH" | "COD";
  total: number;
};

export type DispatchSlot = {
  slot: string;
  booked: number; // non-cancelled orders in the slot
  stillPacking: number; // CONFIRMED (and PENDING) orders not packed yet
  unassigned: DispatchOrder[]; // packed, not on a trip
  trips: TripView[];
};

export type DispatchDay = { day: string; slots: DispatchSlot[] };

/**
 * Everything the office needs to plan and close trips, by delivery day and
 * slot: today and the next delivery day always show, plus any day with open
 * orders or trips.
 */
export async function dispatchBoard(): Promise<{ days: DispatchDay[]; drivers: { id: string; name: string }[] }> {
  const today = shopDate();
  const nextDay = deliveryDateFor();
  const since = addDays(today, -1);
  const [orders, trips, drivers, bookedRows] = await Promise.all([
    prisma.order.findMany({
      ...JOIN,
      where: { status: { in: ["PENDING", "CONFIRMED", "PACKED"] }, deliveryDate: { gte: since } },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        tripId: true,
        deliveryName: true,
        deliveryBarangay: true,
        deliverySlot: true,
        deliveryDate: true,
        paymentMethod: true,
        totalCentavos: true,
        items: { select: { quantity: true } },
      },
      take: 500,
    }),
    prisma.trip.findMany({
      ...JOIN,
      // Open trips from any day, closed ones from today on.
      where: { OR: [{ status: { in: ["PLANNED", "OUT"] } }, { date: { gte: today } }] },
      include: tripInclude,
      orderBy: { tripNumber: "asc" },
      take: 100,
    }),
    prisma.user.findMany({ where: { role: "DRIVER" }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
    prisma.order.groupBy({
      by: ["deliveryDate", "deliverySlot"],
      where: { status: { not: "CANCELLED" }, deliveryDate: { gte: since } },
      _count: { _all: true },
    }),
  ]);

  const days = new Map<string, Map<string, DispatchSlot>>();
  const slotOf = (day: string, slot: string) => {
    if (!days.has(day)) days.set(day, new Map());
    const m = days.get(day)!;
    if (!m.has(slot)) m.set(slot, { slot, booked: 0, stillPacking: 0, unassigned: [], trips: [] });
    return m.get(slot)!;
  };
  for (const d of [today, nextDay]) for (const s of DELIVERY_SLOTS) slotOf(dayKey(d), s);

  for (const o of orders) {
    const s = slotOf(dayKey(o.deliveryDate!), o.deliverySlot);
    if (o.status !== "PACKED") s.stillPacking++;
    else if (!o.tripId) {
      s.unassigned.push({
        id: o.id,
        code: orderCode(o.orderNumber),
        firstName: firstName(o.deliveryName),
        barangay: o.deliveryBarangay,
        units: o.items.reduce((n, i) => n + i.quantity, 0),
        payment: o.paymentMethod,
        total: o.totalCentavos,
      });
    }
  }
  for (const t of trips) slotOf(dayKey(t.date), t.slot).trips.push(shapeTrip(t, false));
  for (const b of bookedRows) {
    if (!b.deliveryDate) continue;
    const key = dayKey(b.deliveryDate);
    if (days.get(key)?.has(b.deliverySlot)) days.get(key)!.get(b.deliverySlot)!.booked = b._count._all;
  }

  return {
    days: [...days.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, m]) => ({ day, slots: [...m.values()].sort((a, b) => slotRank(a.slot) - slotRank(b.slot)) })),
    drivers: drivers.map(d => ({ id: d.id, name: d.name ?? d.email })),
  };
}

// ── Customer-facing stop position ────────────────────────────────────────────

/**
 * Where an order on the truck sits in its trip: "stop 3 of 7, 2 before
 * yours". Only counts and positions: never another stop's details.
 */
export async function stopPosition(
  orderId: string,
  known?: { tripId: string | null; status: string }
): Promise<{ stop: number; total: number; before: number } | null> {
  // Callers that already read the order pass its trip and status: one query fewer.
  const order = known ?? (await prisma.order.findUnique({ where: { id: orderId }, select: { tripId: true, status: true } }));
  if (!order?.tripId || order.status !== "READY") return null;
  const stops = await prisma.order.findMany({
    where: { tripId: order.tripId },
    orderBy: [{ stopIndex: "asc" }, { createdAt: "asc" }],
    select: { id: true, status: true },
  });
  const i = stops.findIndex(s => s.id === orderId);
  if (i === -1) return null;
  return { stop: i + 1, total: stops.length, before: stops.slice(0, i).filter(s => s.status === "READY").length };
}

import "server-only";
import prisma from "@/lib/prisma";
import { DELIVERY_SLOTS, firstName, orderCode, SLOT_CAPACITY, type OrderStatusKey } from "@/lib/meta";
import { isStaff } from "@/lib/roles";
import type { SessionUser } from "@/lib/session";
import { trackToken, validTrackToken } from "@/lib/track-access";
import { stopPosition } from "@/lib/trips-data";
import { dayKey, deliveryDateFor } from "@/lib/time";

export type TrackedOrder = {
  code: string;
  status: OrderStatusKey;
  createdAt: Date;
  slot: string;
  day: string | null; // delivery day key
  payment: "GCASH" | "COD";
  total: number;
  fee: number;
  items: { name: string; variant: string; qty: number; price: number; image: string | null }[];
  events: { to: OrderStatusKey; at: Date; note: string | null }[];
};

const include = {
  items: { include: { variant: { include: { product: { select: { name: true, imageUrl: true } } } } } },
  statusEvents: { orderBy: { createdAt: "asc" as const } },
  trip: { select: { vehicle: true, driver: { select: { name: true } } } },
};

type Row = NonNullable<Awaited<ReturnType<typeof findRow>>>;
function findRow(orderNumber: number) {
  // One SQL statement for order + items + products + timeline + trip.
  return prisma.order.findUnique({ relationLoadStrategy: "join", where: { orderNumber }, include });
}

function shape(o: Row): TrackedOrder {
  return {
    code: orderCode(o.orderNumber),
    status: o.status,
    createdAt: o.createdAt,
    slot: o.deliverySlot,
    day: o.deliveryDate ? dayKey(o.deliveryDate) : null,
    payment: o.paymentMethod,
    total: o.totalCentavos,
    fee: o.deliveryFeeCentavos,
    items: o.items.map(i => ({
      name: i.variant.product.name,
      variant: i.variant.name,
      qty: i.quantity,
      price: i.priceAtTime,
      image: i.variant.product.imageUrl,
    })),
    // Staff-only notes (PIN verified, office overrides, trip numbers) stay
    // in the admin; the customer timeline keeps cancellation reasons only.
    events: o.statusEvents.map(e => ({ to: e.toStatus, at: e.createdAt, note: e.toStatus === "CANCELLED" ? e.note : null })),
  };
}

/** What the order's own customer sees on top of the shared view. */
export type OwnerExtras = {
  /** The handoff PIN, while the order is packed or on the truck. */
  pin: string | null;
  /** Driver's first name and vehicle once the order is on the truck. */
  driver: { name: string; vehicle: string } | null;
  /** Position on the trip: "stop 3 of 7". Counts only. */
  stop: { stop: number; total: number; before: number } | null;
};

export type OrderLookup =
  | { kind: "offline" }
  /** No order with that code (only ever told to its owner or staff). */
  | { kind: "missing" }
  /** The viewer must prove it's theirs (code + last 4 phone digits). Also
   *  returned for codes that don't exist, so the form doesn't reveal which. */
  | { kind: "locked" }
  | {
      kind: "ok";
      order: TrackedOrder;
      /** The signed-in customer who placed it. */
      owner: boolean;
      /** A shareable tracking link token. */
      token: string;
      extras: OwnerExtras | null;
      /** Only the owner (or staff) may cancel; the UI decides on top of this. */
      canCancel: boolean;
    };

/**
 * Look up an order for /track or /receipt with the access rules in
 * lib/track-access.ts. The PIN goes to the owner only, never staff.
 */
export async function lookupOrder(orderNumber: number, viewer: SessionUser | null, token: string | null): Promise<OrderLookup> {
  let row: Row | null;
  try {
    row = await findRow(orderNumber);
  } catch {
    return { kind: "offline" };
  }
  const staff = !!viewer && isStaff(viewer.role);
  if (!row) return staff ? { kind: "missing" } : { kind: "locked" };

  const owner = !!viewer && viewer.id === row.customerId;
  if (!owner && !staff && !validTrackToken(orderNumber, token)) return { kind: "locked" };

  let extras: OwnerExtras | null = null;
  if (owner) {
    const live = row.status === "PACKED" || row.status === "READY";
    let stop: OwnerExtras["stop"] = null;
    if (row.status === "READY") {
      try {
        stop = await stopPosition(row.id, { tripId: row.tripId, status: row.status });
      } catch {
        stop = null;
      }
    }
    extras = {
      pin: live ? row.handoffPin : null,
      driver:
        row.status === "READY" && row.trip
          ? { name: firstName(row.trip.driver?.name ?? "Our driver"), vehicle: row.trip.vehicle }
          : null,
      stop,
    };
  }

  const open = row.status === "PENDING" || row.status === "CONFIRMED" || row.status === "PACKED";
  return {
    kind: "ok",
    order: shape(row),
    owner,
    token: trackToken(orderNumber),
    extras,
    canCancel: open && (owner || viewer?.role === "ADMIN"),
  };
}

export type SlotAvailability = { day: string; slots: { slot: string; left: number }[] };

/**
 * Places left in each delivery slot for the day an order placed now would be
 * delivered (one truck run per slot, SLOT_CAPACITY orders). Checkout shows it;
 * `createOrderTx` enforces it. Null when the database is offline.
 */
export async function slotAvailability(): Promise<SlotAvailability | null> {
  const day = deliveryDateFor();
  try {
    const rows = await prisma.order.groupBy({
      by: ["deliverySlot"],
      where: { deliveryDate: day, status: { not: "CANCELLED" } },
      _count: { _all: true },
    });
    const taken = new Map(rows.map(r => [r.deliverySlot, r._count._all]));
    return {
      day: dayKey(day),
      slots: DELIVERY_SLOTS.map(slot => ({ slot, left: Math.max(0, SLOT_CAPACITY - (taken.get(slot) ?? 0)) })),
    };
  } catch {
    return null;
  }
}

export type MyOrder = Omit<TrackedOrder, "events"> & { pin: string | null };

/** Order history for /account: no timeline events (the list never shows them). */
export async function listMyOrders(customerId: string): Promise<MyOrder[] | "offline"> {
  try {
    const rows = await prisma.order.findMany({
      relationLoadStrategy: "join",
      where: { customerId },
      include: { items: include.items },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return rows.map(o => ({
      code: orderCode(o.orderNumber),
      status: o.status,
      createdAt: o.createdAt,
      slot: o.deliverySlot,
      day: o.deliveryDate ? dayKey(o.deliveryDate) : null,
      payment: o.paymentMethod,
      total: o.totalCentavos,
      fee: o.deliveryFeeCentavos,
      // The account page is the customer's own: the PIN shows while it's needed.
      pin: o.status === "PACKED" || o.status === "READY" ? o.handoffPin : null,
      items: o.items.map(i => ({
        name: i.variant.product.name,
        variant: i.variant.name,
        qty: i.quantity,
        price: i.priceAtTime,
        image: i.variant.product.imageUrl,
      })),
    }));
  } catch {
    return "offline";
  }
}

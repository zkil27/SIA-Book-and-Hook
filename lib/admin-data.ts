import "server-only";
import { cache } from "react";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { ageInDays } from "@/lib/ledger";
import { oldestInflowByVariant, stockByVariant } from "@/lib/stock-sql";
import { imageForName } from "@/lib/catalog-data";
import { LOW_STOCK_AT, orderCode, STALE_GCASH_HOURS, stockState, TO_SALE_AFTER_DAYS, tripCode, type OrderStatusKey } from "@/lib/meta";
import { DAY_MS, dayKey, daysAgo, startOfShopDay } from "@/lib/time";

// ── Inventory ────────────────────────────────────────────────────────────────

export type InvVariant = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  active: boolean;
  stock: number;
  oldestDays: number | null; // FIFO age of the oldest unit on hand
  toSale: boolean;
  priceChangedToday: boolean;
};

export type InvProduct = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  active: boolean;
  category: { id: string; name: string; slug: string };
  variants: InvVariant[];
};

const productSelect = {
  id: true,
  name: true,
  description: true,
  imageUrl: true,
  active: true,
  category: { select: { id: true, name: true, slug: true } },
  variants: {
    orderBy: { priceCentavos: "desc" as const },
    select: { id: true, name: true, sku: true, priceCentavos: true, active: true, priceUpdatedAt: true },
  },
} satisfies Prisma.ProductSelect;

type ProductRow = Prisma.ProductGetPayload<{ select: typeof productSelect }>;

function shapeProduct(p: ProductRow, stock: Map<string, number>, oldest: Map<string, Date>, today: Date): InvProduct {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    image: p.imageUrl ?? imageForName(p.name),
    active: p.active,
    category: p.category,
    variants: p.variants.map(v => {
      const s = stock.get(v.id) ?? 0;
      const oldestDays = s > 0 ? ageInDays(oldest.get(v.id) ?? null) : null;
      return {
        id: v.id,
        productId: p.id,
        name: v.name,
        sku: v.sku,
        price: v.priceCentavos,
        active: v.active,
        stock: s,
        oldestDays,
        toSale: s > 0 && (oldestDays ?? 0) >= TO_SALE_AFTER_DAYS,
        priceChangedToday: !!v.priceUpdatedAt && v.priceUpdatedAt >= today,
      };
    }),
  };
}

/**
 * Every product and variant (archived included) with ledger-derived stock.
 * Stock and FIFO age are aggregated in SQL (lib/stock-sql.ts); no ledger rows
 * are loaded. Uncached: dev timing probes call this directly.
 */
export async function loadInventoryUncached(): Promise<InvProduct[]> {
  const [rows, stock, oldest] = await Promise.all([
    prisma.product.findMany({ select: productSelect, orderBy: [{ category: { name: "asc" } }, { name: "asc" }] }),
    stockByVariant(prisma),
    oldestInflowByVariant(prisma),
  ]);
  const today = startOfShopDay();
  return rows.map(p => shapeProduct(p, stock, oldest, today));
}

/** Per-request deduplicated inventory (layout and page share one read). */
export const loadInventory = cache(loadInventoryUncached);

/** One product with its variants' stock, for the product editor. */
export async function loadProduct(id: string): Promise<InvProduct | null> {
  const p = await prisma.product.findUnique({ where: { id }, select: productSelect });
  if (!p) return null;
  const ids = p.variants.map(v => v.id);
  const [stock, oldest] = await Promise.all([stockByVariant(prisma, ids), oldestInflowByVariant(prisma, ids)]);
  return shapeProduct(p, stock, oldest, startOfShopDay());
}

/** Flat list of sellable variants (active product and variant). */
export function sellable(inv: InvProduct[]) {
  return inv
    .filter(p => p.active)
    .flatMap(p => p.variants.filter(v => v.active).map(v => ({ ...v, product: p })));
}

export type SellableVariant = ReturnType<typeof sellable>[number];

// ── Counts for the rail / inbox ─────────────────────────────────────────────

export type AdminCounts = { pending: number; out: number; low: number; toSale: number; dispatch: number };

async function countsWith(load: () => Promise<InvProduct[]>): Promise<AdminCounts> {
  const [inv, [c]] = await Promise.all([
    load(),
    // Two badge counts in one round trip.
    prisma.$queryRaw<{ pending: bigint; unplanned: bigint }[]>`
      SELECT
        (SELECT COUNT(*) FROM "Order" WHERE "status" = 'PENDING') AS pending,
        (SELECT COUNT(*) FROM "Order" WHERE "status" = 'PACKED' AND "tripId" IS NULL) AS unplanned
    `,
  ]);
  const vs = sellable(inv);
  return {
    pending: Number(c.pending),
    // Dispatch badge: packed orders with no trip.
    dispatch: Number(c.unplanned),
    out: vs.filter(v => v.stock <= 0).length,
    low: vs.filter(v => stockState(v.stock) === "low").length,
    toSale: vs.filter(v => v.toSale).length,
  };
}

export const getAdminCounts = cache(() => countsWith(loadInventory));
export const getAdminCountsUncached = () => countsWith(loadInventoryUncached);

// ── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboard(load: () => Promise<InvProduct[]> = loadInventory) {
  const today = startOfShopDay();
  const weekStart = daysAgo(6);
  const staleCutoff = new Date(Date.now() - STALE_GCASH_HOURS * 3_600_000);
  const [[summary], weekOrders, sellerRows, pipeline, pendingOrders, inv, noPin, staleGcash, unplanned] = await Promise.all([
    // Today order count plus uncollected pipeline totals (GCash on hold, COD on delivery).
    prisma.$queryRaw<{ todayCount: bigint; onHold: bigint; onDelivery: bigint }[]>`
      SELECT
        COUNT(*) FILTER (WHERE "createdAt" >= ${today} AND "status" <> 'CANCELLED')::bigint AS "todayCount",
        COALESCE(SUM("totalCentavos") FILTER (WHERE "paymentMethod" = 'GCASH' AND "status" = 'PENDING'), 0)::bigint AS "onHold",
        COALESCE(SUM("totalCentavos") FILTER (WHERE "paymentMethod" = 'COD' AND "status" IN ('PENDING', 'CONFIRMED', 'PACKED', 'READY')), 0)::bigint AS "onDelivery"
      FROM "Order"
    `,
    // Collected sales per shop day, bucketed in SQL (day 0 = weekStart, day 6 = today).
    // GCash counts on confirm; COD counts on delivery.
    prisma.$queryRaw<{ idx: number; orders: bigint; revenue: bigint }[]>`
      WITH collected AS (
        SELECT
          o."id",
          o."totalCentavos",
          COALESCE(
            (
              SELECT MAX(e."createdAt")
              FROM "OrderStatusEvent" e
              WHERE e."orderId" = o."id"
                AND e."toStatus" = (
                  CASE WHEN o."paymentMethod" = 'GCASH'
                    THEN 'CONFIRMED'::"OrderStatus"
                    ELSE 'COMPLETED'::"OrderStatus"
                  END
                )
            ),
            o."createdAt"
          ) AS collected_at
        FROM "Order" o
        WHERE (o."paymentMethod" = 'GCASH' AND o."status" IN ('CONFIRMED', 'PACKED', 'READY', 'COMPLETED'))
           OR (o."paymentMethod" = 'COD' AND o."status" = 'COMPLETED')
      )
      SELECT
        FLOOR(EXTRACT(EPOCH FROM (collected_at - ${weekStart}::timestamp)) / 86400)::int AS idx,
        COUNT(*)::bigint AS orders,
        COALESCE(SUM("totalCentavos"), 0)::bigint AS revenue
      FROM collected
      WHERE collected_at >= ${weekStart}
      GROUP BY idx
    `,
    prisma.$queryRaw<{ name: string; qty: bigint; revenue: bigint }[]>`
      SELECT p."name", SUM(oi."quantity")::bigint AS qty, SUM(oi."quantity" * oi."priceAtTime")::bigint AS revenue
      FROM "OrderItem" oi
      JOIN "Order" o ON o."id" = oi."orderId"
      JOIN "ProductVariant" v ON v."id" = oi."variantId"
      JOIN "Product" p ON p."id" = v."productId"
      WHERE o."createdAt" >= ${weekStart}
        AND (
          (o."paymentMethod" = 'GCASH' AND o."status" IN ('CONFIRMED', 'PACKED', 'READY', 'COMPLETED'))
          OR (o."paymentMethod" = 'COD' AND o."status" = 'COMPLETED')
        )
      GROUP BY p."name"
      ORDER BY revenue DESC
      LIMIT 5
    `,
    orderCounts(),
    prisma.order.findMany({
      ...JOIN,
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        deliveryName: true,
        deliverySlot: true,
        deliveryDate: true,
        deliveryBarangay: true,
        paymentMethod: true,
        totalCentavos: true,
        createdAt: true,
        customer: { select: { name: true } },
        // Names too, so Confirm on Today can print the bag label.
        items: { orderBy: { id: "asc" }, select: { quantity: true, variant: { select: { name: true, product: { select: { name: true } } } } } },
      },
    }),
    load(),
    // Deliveries finished without the customer's PIN in the last 3 days.
    prisma.orderStatusEvent.findMany({
      ...JOIN,
      where: { toStatus: "COMPLETED", createdAt: { gte: daysAgo(2) }, OR: [{ note: { startsWith: "No PIN" } }, { note: { startsWith: "Office:" } }] },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, note: true, createdAt: true, actor: { select: { name: true } }, order: { select: { orderNumber: true, deliveryName: true } } },
    }),
    prisma.order.findMany({
      where: { status: "PENDING", paymentMethod: "GCASH", createdAt: { lte: staleCutoff } },
      orderBy: { createdAt: "asc" },
      take: 50,
      select: { id: true },
    }),
    prisma.order.count({ where: { status: "PACKED", tripId: null } }),
  ]);
  const pendingCount = pipeline.PENDING;

  const days = Array.from({ length: 7 }, (_, i) => {
    const start = new Date(weekStart.getTime() + i * DAY_MS);
    return { start, revenue: 0, orders: 0 };
  });
  for (const b of weekOrders) {
    if (days[b.idx]) {
      days[b.idx].revenue += Number(b.revenue);
      days[b.idx].orders += Number(b.orders);
    }
  }

  const vs = sellable(inv);
  return {
    todayCount: Number(summary?.todayCount ?? 0),
    todayRevenue: days[6].revenue,
    onHoldRevenue: Number(summary?.onHold ?? 0),
    onDeliveryRevenue: Number(summary?.onDelivery ?? 0),
    days,
    topSellers: sellerRows.map(r => ({ name: r.name, qty: Number(r.qty), revenue: Number(r.revenue) })),
    pendingCount,
    pipeline,
    packedNoTrip: unplanned,
    staleGcashIds: staleGcash.map(o => o.id),
    pendingOrders: pendingOrders.map(o => ({
      id: o.id,
      code: orderCode(o.orderNumber),
      customer: o.deliveryName || o.customer.name || "Customer",
      payment: o.paymentMethod,
      stale: o.paymentMethod === "GCASH" && o.createdAt <= staleCutoff,
      total: o.totalCentavos,
      items: o.items.reduce((s, i) => s + i.quantity, 0),
      createdAt: o.createdAt,
      slot: o.deliverySlot,
      // Bag label fields (no phone or address).
      label: {
        code: orderCode(o.orderNumber),
        createdAt: o.createdAt.toISOString(),
        delivery: {
          name: o.deliveryName || o.customer.name || "Customer",
          barangay: o.deliveryBarangay,
          slot: o.deliverySlot,
          day: o.deliveryDate ? dayKey(o.deliveryDate) : null,
        },
        payment: o.paymentMethod,
        total: o.totalCentavos,
        items: o.items.map(i => ({ name: i.variant.product.name, variant: i.variant.name, qty: i.quantity })),
      },
    })),
    noPinDeliveries: noPin.map(e => ({
      id: e.id,
      code: orderCode(e.order.orderNumber),
      customer: e.order.deliveryName,
      note: e.note ?? "",
      by: e.actor?.name ?? "Staff",
      at: e.createdAt,
    })),
    outOfStock: vs.filter(v => v.stock <= 0),
    lowStock: vs.filter(v => v.stock > 0 && v.stock <= LOW_STOCK_AT).sort((a, b) => a.stock - b.stock),
    toSale: vs.filter(v => v.toSale).sort((a, b) => (b.oldestDays ?? 0) - (a.oldestDays ?? 0)),
  };
}

// ── Orders ──────────────────────────────────────────────────────────────────

/** Nested reads in one SQL statement (Prisma `relationJoins` preview). */
const JOIN = { relationLoadStrategy: "join" } as const;

/**
 * What the Orders list, the drawer's first paint and the bag label need. No
 * phone, address or timeline: those load when an order is opened
 * (`getOrderDetail`), so a tab switch stays one small query.
 */
const orderListSelect = {
  id: true,
  orderNumber: true,
  status: true,
  createdAt: true,
  deliveryName: true,
  deliveryBarangay: true,
  deliverySlot: true,
  deliveryDate: true,
  paymentMethod: true,
  deliveryFeeCentavos: true,
  totalCentavos: true,
  stopIndex: true,
  loadedAt: true,
  customer: { select: { name: true, email: true } },
  trip: { select: { tripNumber: true, vehicle: true, status: true, driver: { select: { name: true } } } },
  items: {
    orderBy: { id: "asc" },
    select: {
      quantity: true,
      priceAtTime: true,
      variant: { select: { name: true, product: { select: { name: true } } } },
    },
  },
} satisfies Prisma.OrderSelect;

type OrderListRow = Prisma.OrderGetPayload<{ select: typeof orderListSelect }>;

function shapeAdminOrder(o: OrderListRow) {
  return {
    id: o.id,
    code: orderCode(o.orderNumber),
    status: o.status as OrderStatusKey,
    createdAt: o.createdAt.toISOString(),
    customer: o.customer.name ?? o.customer.email,
    delivery: {
      name: o.deliveryName,
      barangay: o.deliveryBarangay,
      slot: o.deliverySlot,
      day: o.deliveryDate ? dayKey(o.deliveryDate) : null,
    },
    trip: o.trip
      ? {
          code: tripCode(o.trip.tripNumber),
          vehicle: o.trip.vehicle,
          driver: o.trip.driver?.name ?? null,
          stop: o.stopIndex,
          loaded: !!o.loadedAt,
          leftStall: o.trip.status !== "PLANNED",
        }
      : null,
    payment: o.paymentMethod,
    fee: o.deliveryFeeCentavos,
    total: o.totalCentavos,
    items: o.items.map(i => ({
      name: i.variant.product.name,
      variant: i.variant.name,
      qty: i.quantity,
      price: i.priceAtTime,
    })),
  };
}

export type AdminOrder = ReturnType<typeof shapeAdminOrder>;

export async function listOrders(status: OrderStatusKey | "ALL"): Promise<AdminOrder[]> {
  const rows = await prisma.order.findMany({
    ...JOIN,
    where: status === "ALL" ? {} : { status },
    orderBy: [{ createdAt: "desc" }],
    take: 200,
    select: orderListSelect,
  });
  return rows.map(shapeAdminOrder);
}

/** One order by its number (for `?open=HB-0005` links into another tab). */
export async function getAdminOrder(orderNumber: number): Promise<AdminOrder | null> {
  const row = await prisma.order.findUnique({ ...JOIN, where: { orderNumber }, select: orderListSelect });
  return row ? shapeAdminOrder(row) : null;
}

/** The rest of an opened order: contact details, item photos and SKUs, timeline. */
export async function getOrderDetail(id: string) {
  const o = await prisma.order.findUnique({
    ...JOIN,
    where: { id },
    select: {
      deliveryPhone: true,
      deliveryAddress: true,
      customer: { select: { email: true } },
      items: { orderBy: { id: "asc" }, select: { variant: { select: { sku: true, product: { select: { name: true, imageUrl: true } } } } } },
      statusEvents: {
        orderBy: { createdAt: "asc" },
        select: { id: true, fromStatus: true, toStatus: true, createdAt: true, note: true, actor: { select: { name: true, role: true } } },
      },
    },
  });
  if (!o) return null;
  return {
    phone: o.deliveryPhone,
    address: o.deliveryAddress,
    email: o.customer.email,
    // Same order as the list's items (both sorted by id).
    items: o.items.map(i => ({
      sku: i.variant.sku,
      image: i.variant.product.imageUrl ?? imageForName(i.variant.product.name),
    })),
    events: o.statusEvents.map(e => ({
      id: e.id,
      from: e.fromStatus as OrderStatusKey | null,
      to: e.toStatus as OrderStatusKey,
      at: e.createdAt.toISOString(),
      note: e.note,
      actor: e.actor ? (e.actor.role === "CUSTOMER" ? "Customer" : e.actor.name ?? "Staff") : "System",
    })),
  };
}

export type OrderDetail = NonNullable<Awaited<ReturnType<typeof getOrderDetail>>>;

export async function orderCounts(): Promise<Record<OrderStatusKey | "ALL", number>> {
  const groups = await prisma.order.groupBy({ by: ["status"], _count: { _all: true } });
  const out = { ALL: 0, PENDING: 0, CONFIRMED: 0, PACKED: 0, READY: 0, COMPLETED: 0, CANCELLED: 0 };
  for (const g of groups) {
    out[g.status as OrderStatusKey] = g._count._all;
    out.ALL += g._count._all;
  }
  return out;
}

// ── Ledger ──────────────────────────────────────────────────────────────────

export type LedgerRow = {
  id: string;
  variantId: string;
  product: string;
  variant: string;
  sku: string;
  quantity: number;
  reason: string;
  kind: "sale" | "restock" | "correction" | "count" | "cancel" | "loss" | "other";
  orderCode: string | null;
  actor: string;
  at: string;
  balance: number; // that variant's stock right after this movement
};

function kindOf(reason: string, qty: number): LedgerRow["kind"] {
  const r = reason.toLowerCase();
  if (r.startsWith("sale") || r.startsWith("walk-in")) return "sale";
  if (r.startsWith("cancelled")) return "cancel";
  if (r.startsWith("morning count")) return "count";
  if (r.startsWith("undo") || r.startsWith("correction") || r.startsWith("miscount")) return "correction";
  if (r.startsWith("spoil") || r.startsWith("damaged")) return "loss";
  if (qty > 0) return "restock";
  return "other";
}

export const LEDGER_LIMIT = 300;

/**
 * Newest-first ledger rows with each variant's running balance. A row's
 * balance is the variant's current stock minus every movement after it, and
 * every movement after a row in the period is itself in the period, so the
 * window only runs over the period's rows (not the whole ledger) and the
 * balances stay exact.
 */
export async function loadLedger(opts: {
  variantId?: string;
  sinceDays?: number;
}): Promise<{ rows: LedgerRow[]; truncated: boolean }> {
  const since = opts.sinceDays !== undefined ? daysAgo(opts.sinceDays) : undefined;
  const scope = opts.variantId ? Prisma.sql`AND sm."variantId" = ${opts.variantId}` : Prisma.empty;
  const period = since ? Prisma.sql`AND sm."createdAt" >= ${since}` : Prisma.empty;
  const raw = await prisma.$queryRaw<
    {
      id: string;
      variantId: string;
      quantity: number;
      reason: string;
      orderId: string | null;
      createdAt: Date;
      balance: number;
      variantName: string;
      sku: string;
      productName: string;
      orderNumber: number | null;
      actorName: string | null;
    }[]
  >`
    WITH m AS (
      SELECT sm.*,
        COALESCE(SUM(sm."quantity") OVER (
          PARTITION BY sm."variantId" ORDER BY sm."createdAt" DESC, sm."id" DESC
          ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
        ), 0) AS later
      FROM "StockMovement" sm
      WHERE TRUE ${scope} ${period}
    ),
    s AS (
      SELECT "variantId", SUM("quantity") AS stock
      FROM "StockMovement"
      WHERE "variantId" IN (SELECT DISTINCT "variantId" FROM m)
      GROUP BY "variantId"
    )
    SELECT m."id", m."variantId", m."quantity", m."reason", m."orderId", m."createdAt", (s.stock - m.later)::int AS balance,
      v."name" AS "variantName", v."sku", p."name" AS "productName", o."orderNumber", a."name" AS "actorName"
    FROM m
    JOIN s ON s."variantId" = m."variantId"
    JOIN "ProductVariant" v ON v."id" = m."variantId"
    JOIN "Product" p ON p."id" = v."productId"
    LEFT JOIN "Order" o ON o."id" = m."orderId"
    LEFT JOIN "User" a ON a."id" = m."actorId"
    ORDER BY m."createdAt" DESC, m."id" DESC
    LIMIT ${LEDGER_LIMIT + 1}
  `;
  const truncated = raw.length > LEDGER_LIMIT;
  const rows = raw.slice(0, LEDGER_LIMIT).map(m => ({
    id: m.id,
    variantId: m.variantId,
    product: m.productName,
    variant: m.variantName,
    sku: m.sku,
    quantity: m.quantity,
    reason: m.reason,
    kind: kindOf(m.reason, m.quantity),
    orderCode: m.orderNumber !== null ? orderCode(m.orderNumber) : null,
    actor: m.actorName ?? (m.orderId ? "Checkout" : "System"),
    at: m.createdAt.toISOString(),
    balance: m.balance,
  }));
  return { rows, truncated };
}

/** Light variant list for the ledger filter (no inventory aggregation beyond stock). */
export async function ledgerVariants() {
  const [rows, stock] = await Promise.all([
    prisma.productVariant.findMany({
      select: { id: true, name: true, active: true, product: { select: { name: true, active: true } } },
      orderBy: [{ product: { category: { name: "asc" } } }, { product: { name: "asc" } }, { priceCentavos: "desc" }],
    }),
    stockByVariant(prisma),
  ]);
  return rows.map(v => ({
    id: v.id,
    productName: v.product.name,
    name: v.name,
    archived: !(v.product.active && v.active),
    stock: stock.get(v.id) ?? 0,
  }));
}

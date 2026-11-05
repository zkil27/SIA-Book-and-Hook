import "server-only";
import { cache } from "react";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { ageInDays } from "@/lib/ledger";
import { oldestInflowByVariant, stockByVariant } from "@/lib/stock-sql";
import { imageForName } from "@/lib/catalog-data";
import { LOW_STOCK_AT, orderCode, stockState, TO_SALE_AFTER_DAYS, type OrderStatusKey } from "@/lib/meta";
import { DAY_MS, daysAgo, startOfShopDay } from "@/lib/time";

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

export type AdminCounts = { pending: number; out: number; low: number; toSale: number };

async function countsWith(load: () => Promise<InvProduct[]>): Promise<AdminCounts> {
  const [inv, pending] = await Promise.all([load(), prisma.order.count({ where: { status: "PENDING" } })]);
  const vs = sellable(inv);
  return {
    pending,
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
  const open = { status: { not: "CANCELLED" as const } };
  const [todayAgg, weekOrders, sellerRows, pendingCount, pendingOrders, inv] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: today }, ...open },
      _count: { _all: true },
      _sum: { totalCentavos: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: weekStart }, ...open },
      select: { createdAt: true, totalCentavos: true },
    }),
    prisma.$queryRaw<{ name: string; qty: bigint; revenue: bigint }[]>`
      SELECT p."name", SUM(oi."quantity")::bigint AS qty, SUM(oi."quantity" * oi."priceAtTime")::bigint AS revenue
      FROM "OrderItem" oi
      JOIN "Order" o ON o."id" = oi."orderId"
      JOIN "ProductVariant" v ON v."id" = oi."variantId"
      JOIN "Product" p ON p."id" = v."productId"
      WHERE o."createdAt" >= ${weekStart} AND o."status" <> 'CANCELLED'
      GROUP BY p."name"
      ORDER BY revenue DESC
      LIMIT 5
    `,
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        deliveryName: true,
        deliverySlot: true,
        totalCentavos: true,
        createdAt: true,
        customer: { select: { name: true } },
        items: { select: { quantity: true } },
      },
    }),
    load(),
  ]);

  const days = Array.from({ length: 7 }, (_, i) => {
    const start = new Date(weekStart.getTime() + i * DAY_MS);
    return { start, revenue: 0, orders: 0 };
  });
  for (const o of weekOrders) {
    const idx = Math.floor((o.createdAt.getTime() - weekStart.getTime()) / DAY_MS);
    if (days[idx]) {
      days[idx].revenue += o.totalCentavos;
      days[idx].orders += 1;
    }
  }

  const vs = sellable(inv);
  return {
    todayCount: todayAgg._count._all,
    todayRevenue: todayAgg._sum.totalCentavos ?? 0,
    days,
    topSellers: sellerRows.map(r => ({ name: r.name, qty: Number(r.qty), revenue: Number(r.revenue) })),
    pendingCount,
    pendingOrders: pendingOrders.map(o => ({
      id: o.id,
      code: orderCode(o.orderNumber),
      customer: o.deliveryName || o.customer.name || "Customer",
      total: o.totalCentavos,
      items: o.items.reduce((s, i) => s + i.quantity, 0),
      createdAt: o.createdAt,
      slot: o.deliverySlot,
    })),
    outOfStock: vs.filter(v => v.stock <= 0),
    lowStock: vs.filter(v => v.stock > 0 && v.stock <= LOW_STOCK_AT).sort((a, b) => a.stock - b.stock),
    toSale: vs.filter(v => v.toSale).sort((a, b) => (b.oldestDays ?? 0) - (a.oldestDays ?? 0)),
  };
}

// ── Orders ──────────────────────────────────────────────────────────────────

const orderInclude = {
  customer: { select: { name: true, email: true } },
  items: { include: { variant: { include: { product: { select: { name: true, imageUrl: true } } } } } },
  statusEvents: {
    orderBy: { createdAt: "asc" as const },
    include: { actor: { select: { name: true, role: true } } },
  },
} satisfies Prisma.OrderInclude;

type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

function shapeAdminOrder(o: OrderRow) {
  return {
    id: o.id,
    code: orderCode(o.orderNumber),
    status: o.status as OrderStatusKey,
    createdAt: o.createdAt.toISOString(),
    customer: o.customer.name ?? o.customer.email,
    email: o.customer.email,
    delivery: {
      name: o.deliveryName,
      phone: o.deliveryPhone,
      address: o.deliveryAddress,
      barangay: o.deliveryBarangay,
      slot: o.deliverySlot,
    },
    payment: o.paymentMethod,
    fee: o.deliveryFeeCentavos,
    total: o.totalCentavos,
    items: o.items.map(i => ({
      name: i.variant.product.name,
      variant: i.variant.name,
      sku: i.variant.sku,
      qty: i.quantity,
      price: i.priceAtTime,
      image: i.variant.product.imageUrl ?? imageForName(i.variant.product.name),
    })),
    events: o.statusEvents.map(e => ({
      id: e.id,
      from: e.fromStatus as OrderStatusKey | null,
      to: e.toStatus as OrderStatusKey,
      at: e.createdAt.toISOString(),
      note: e.note,
      actor: e.actor ? (e.actor.role === "ADMIN" ? e.actor.name ?? "Staff" : "Customer") : "System",
    })),
  };
}

export type AdminOrder = ReturnType<typeof shapeAdminOrder>;

export async function listOrders(status: OrderStatusKey | "ALL"): Promise<AdminOrder[]> {
  const rows = await prisma.order.findMany({
    where: status === "ALL" ? {} : { status },
    orderBy: [{ createdAt: "desc" }],
    take: 200,
    include: orderInclude,
  });
  return rows.map(shapeAdminOrder);
}

/** One order by its number (for `?open=HB-0005` links into another tab). */
export async function getAdminOrder(orderNumber: number): Promise<AdminOrder | null> {
  const row = await prisma.order.findUnique({ where: { orderNumber }, include: orderInclude });
  return row ? shapeAdminOrder(row) : null;
}

export async function orderCounts(): Promise<Record<OrderStatusKey | "ALL", number>> {
  const groups = await prisma.order.groupBy({ by: ["status"], _count: { _all: true } });
  const out = { ALL: 0, PENDING: 0, CONFIRMED: 0, READY: 0, COMPLETED: 0, CANCELLED: 0 };
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
 * Newest-first ledger rows with each variant's running balance. The balance
 * is a window sum over that variant's full history (inner query), and the
 * period filter and row limit apply afterwards, so balances stay exact.
 */
export async function loadLedger(opts: {
  variantId?: string;
  sinceDays?: number;
}): Promise<{ rows: LedgerRow[]; truncated: boolean }> {
  const since = opts.sinceDays !== undefined ? daysAgo(opts.sinceDays) : undefined;
  const scope = opts.variantId ? Prisma.sql`WHERE sm."variantId" = ${opts.variantId}` : Prisma.empty;
  const period = since ? Prisma.sql`WHERE m."createdAt" >= ${since}` : Prisma.empty;
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
    SELECT m."id", m."variantId", m."quantity", m."reason", m."orderId", m."createdAt", m.balance::int AS balance,
      v."name" AS "variantName", v."sku", p."name" AS "productName", o."orderNumber", a."name" AS "actorName"
    FROM (
      SELECT sm.*, SUM(sm."quantity") OVER (PARTITION BY sm."variantId" ORDER BY sm."createdAt", sm."id") AS balance
      FROM "StockMovement" sm
      ${scope}
    ) m
    JOIN "ProductVariant" v ON v."id" = m."variantId"
    JOIN "Product" p ON p."id" = v."productId"
    LEFT JOIN "Order" o ON o."id" = m."orderId"
    LEFT JOIN "User" a ON a."id" = m."actorId"
    ${period}
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

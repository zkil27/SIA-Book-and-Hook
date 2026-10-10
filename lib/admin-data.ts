import "server-only";
import { cache } from "react";
import prisma from "@/lib/prisma";
import { ageInDays, oldestRemainingAt } from "@/lib/ledger";
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

/** Every product and variant (archived included) with ledger-derived stock. */
export const loadInventory = cache(async (): Promise<InvProduct[]> => {
  const rows = await prisma.product.findMany({
    include: {
      category: true,
      variants: {
        orderBy: { priceCentavos: "desc" },
        include: { stockMovements: { select: { quantity: true, createdAt: true } } },
      },
    },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });
  const today = startOfShopDay();
  return rows.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    image: p.imageUrl ?? imageForName(p.name),
    active: p.active,
    category: { id: p.category.id, name: p.category.name, slug: p.category.slug },
    variants: p.variants.map(v => {
      const stock = v.stockMovements.reduce((s, m) => s + m.quantity, 0);
      const oldestDays = stock > 0 ? ageInDays(oldestRemainingAt(v.stockMovements)) : null;
      return {
        id: v.id,
        productId: p.id,
        name: v.name,
        sku: v.sku,
        price: v.priceCentavos,
        active: v.active,
        stock,
        oldestDays,
        toSale: stock > 0 && (oldestDays ?? 0) >= TO_SALE_AFTER_DAYS,
        priceChangedToday: !!v.priceUpdatedAt && v.priceUpdatedAt >= today,
      };
    }),
  }));
});

/** Flat list of sellable variants (active product and variant). */
export function sellable(inv: InvProduct[]) {
  return inv
    .filter(p => p.active)
    .flatMap(p => p.variants.filter(v => v.active).map(v => ({ ...v, product: p })));
}

export type SellableVariant = ReturnType<typeof sellable>[number];

// ── Counts for the rail / inbox ─────────────────────────────────────────────

export const getAdminCounts = cache(async () => {
  const [inv, pending] = await Promise.all([
    loadInventory(),
    prisma.order.count({ where: { status: "PENDING" } }),
  ]);
  const vs = sellable(inv);
  return {
    pending,
    out: vs.filter(v => v.stock <= 0).length,
    low: vs.filter(v => stockState(v.stock) === "low").length,
    toSale: vs.filter(v => v.toSale).length,
  };
});

// ── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboard() {
  const today = startOfShopDay();
  const weekStart = daysAgo(6);
  const [todayOrders, weekOrders, pendingOrders, inv] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: today }, status: { not: "CANCELLED" } },
      select: { totalCentavos: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: weekStart }, status: { not: "CANCELLED" } },
      select: {
        createdAt: true,
        totalCentavos: true,
        items: { select: { quantity: true, priceAtTime: true, variant: { select: { product: { select: { name: true } } } } } },
      },
    }),
    prisma.order.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 8,
      include: { customer: { select: { name: true } }, items: { select: { quantity: true } } },
    }),
    loadInventory(),
  ]);

  const days = Array.from({ length: 7 }, (_, i) => {
    const start = new Date(weekStart.getTime() + i * DAY_MS);
    return { start, revenue: 0, orders: 0 };
  });
  const sellers = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of weekOrders) {
    const idx = Math.floor((o.createdAt.getTime() - weekStart.getTime()) / DAY_MS);
    if (days[idx]) {
      days[idx].revenue += o.totalCentavos;
      days[idx].orders += 1;
    }
    for (const it of o.items) {
      const name = it.variant.product.name;
      const s = sellers.get(name) ?? { name, qty: 0, revenue: 0 };
      s.qty += it.quantity;
      s.revenue += it.quantity * it.priceAtTime;
      sellers.set(name, s);
    }
  }

  const vs = sellable(inv);
  return {
    todayCount: todayOrders.length,
    todayRevenue: todayOrders.reduce((s, o) => s + o.totalCentavos, 0),
    days,
    topSellers: [...sellers.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
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

export type AdminOrder = Awaited<ReturnType<typeof listOrders>>[number];

export async function listOrders(status: OrderStatusKey | "ALL") {
  const rows = await prisma.order.findMany({
    where: status === "ALL" ? {} : { status },
    orderBy: [{ createdAt: "desc" }],
    take: 200,
    include: {
      customer: { select: { name: true, email: true } },
      items: { include: { variant: { include: { product: { select: { name: true, imageUrl: true } } } } } },
      statusEvents: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { name: true, role: true } } },
      },
    },
  });
  return rows.map(o => ({
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
  }));
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

export async function loadLedger(opts: { variantId?: string; sinceDays?: number }) {
  const since = opts.sinceDays !== undefined ? daysAgo(opts.sinceDays) : undefined;
  // Balances need every earlier movement, so read the full history per scope.
  const rows = await prisma.stockMovement.findMany({
    where: opts.variantId ? { variantId: opts.variantId } : {},
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    include: {
      variant: { select: { name: true, sku: true, product: { select: { name: true } } } },
      order: { select: { orderNumber: true } },
      actor: { select: { name: true } },
    },
  });
  const running = new Map<string, number>();
  const out: LedgerRow[] = [];
  for (const m of rows) {
    const bal = (running.get(m.variantId) ?? 0) + m.quantity;
    running.set(m.variantId, bal);
    if (since && m.createdAt < since) continue;
    out.push({
      id: m.id,
      variantId: m.variantId,
      product: m.variant.product.name,
      variant: m.variant.name,
      sku: m.variant.sku,
      quantity: m.quantity,
      reason: m.reason,
      kind: kindOf(m.reason, m.quantity),
      orderCode: m.order ? orderCode(m.order.orderNumber) : null,
      actor: m.actor?.name ?? (m.orderId ? "Checkout" : "System"),
      at: m.createdAt.toISOString(),
      balance: bal,
    });
  }
  return out.reverse(); // newest first
}

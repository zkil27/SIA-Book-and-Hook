"use server";

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireDev } from "@/lib/dev/access";
import { median } from "@/lib/dev/health";
import {
  DEV_CLEANUP_NOTE,
  DEV_ORDER_NOTE,
  DEV_REASON_SUFFIX,
  DEV_TEST_EMAIL,
  ensureTestCustomer,
  MAX_RUSH_ORDERS,
  MAX_TEST_ORDERS,
  OPEN_STATUSES,
  safeVariants,
  testDelivery,
  type SafeVariant,
} from "@/lib/dev/scenarios";
import {
  getAdminCountsUncached,
  getDashboard,
  listOrders,
  loadInventoryUncached,
  loadLedger,
  orderCounts,
} from "@/lib/admin-data";
import { loadCatalogFromDb } from "@/lib/catalog";
import { findOrderByNumber } from "@/lib/orders";
import { cancelOrderTx, createOrderTx, type PlaceOrderData } from "@/lib/orders-core";
import { stockByVariant } from "@/lib/stock-sql";
import { orderCode } from "@/lib/meta";
import { dbError, fail, invalidate, ok, serializable, UserError, type ActionResult } from "./util";

/**
 * Developer tools actions (/admin/dev). Every one starts with requireDev():
 * server actions are reachable by direct POST, so the page gate alone is not
 * enough. Non-developers get a 404.
 */

// ── Timing probes (read-only) ────────────────────────────────────────────────

export type ProbeRow = { name: string; runs: number[]; median: number; error?: string };

export async function runProbes(): Promise<ActionResult<{ rows: ProbeRow[]; at: string }>> {
  await requireDev();
  const latest = await prisma.order
    .findFirst({ orderBy: { orderNumber: "desc" }, select: { orderNumber: true } })
    .catch(() => null);

  // Uncached functions only, so React's per-request cache() can't hide repeat runs.
  const probes: [string, () => Promise<unknown>][] = [
    ["Database round trip (SELECT 1)", () => prisma.$queryRaw`SELECT 1`],
    ["Admin inventory (stock + age)", loadInventoryUncached],
    ["Admin badge counts", getAdminCountsUncached],
    ["Today dashboard", () => getDashboard(loadInventoryUncached)],
    ["Orders board (counts + 200 orders)", () => Promise.all([orderCounts(), listOrders("ALL")])],
    ["Stock ledger, 30 days", () => loadLedger({ sinceDays: 30 })],
    ["Storefront catalog", loadCatalogFromDb],
    ["Track an order", () => (latest ? findOrderByNumber(latest.orderNumber) : Promise.resolve(null))],
  ];

  const rows: ProbeRow[] = [];
  for (const [name, run] of probes) {
    const runs: number[] = [];
    let error: string | undefined;
    for (let i = 0; i < 3; i++) {
      const t = performance.now();
      try {
        await run();
      } catch (err) {
        error = err instanceof Error ? err.message.slice(0, 200) : String(err);
        break;
      }
      runs.push(Math.round(performance.now() - t));
    }
    rows.push({ name, runs, median: runs.length ? median(runs) : 0, error });
  }
  return ok({ rows, at: new Date().toISOString() });
}

// ── Test scenarios (writes; add-only) ────────────────────────────────────────

function orderFor(lines: { variantId: string; qty: number }[]): PlaceOrderData {
  return { items: lines, delivery: testDelivery(), payment: "COD" };
}

const testOpts = { reasonSuffix: DEV_REASON_SUFFIX, note: DEV_ORDER_NOTE };

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Plan `count` orders of 1–3 lines × 1–2 units from variants with spare
 * stock, never spending more than a variant's spare units across the run.
 */
function planOrders(count: number, pool: SafeVariant[]): { variantId: string; qty: number }[][] {
  const spare = new Map(pool.map(v => [v.id, v.spare]));
  const plans: { variantId: string; qty: number }[][] = [];
  for (let n = 0; n < count; n++) {
    const lines: { variantId: string; qty: number }[] = [];
    const want = 1 + Math.floor(Math.random() * 3);
    for (let l = 0; l < want; l++) {
      const open = pool.filter(v => (spare.get(v.id) ?? 0) > 0 && !lines.some(x => x.variantId === v.id));
      if (!open.length) break;
      const v = pick(open);
      const qty = Math.min(1 + Math.floor(Math.random() * 2), spare.get(v.id) ?? 0);
      spare.set(v.id, (spare.get(v.id) ?? 0) - qty);
      lines.push({ variantId: v.id, qty });
    }
    if (!lines.length) break;
    plans.push(lines);
  }
  return plans;
}

export type TestOrdersResult = { placed: string[]; failed: string[]; ms: number };

export async function placeTestOrders(count: number): Promise<ActionResult<TestOrdersResult>> {
  await requireDev();
  const n = Math.floor(count);
  if (!Number.isFinite(n) || n < 1 || n > MAX_TEST_ORDERS) return fail(`Place between 1 and ${MAX_TEST_ORDERS} orders.`);
  try {
    const started = Date.now();
    const [customerId, pool] = await Promise.all([ensureTestCustomer(), safeVariants()]);
    const plans = planOrders(n, pool);
    if (!plans.length) return fail(`No item has stock to spare above the low-stock line. Restock first.`);
    const placed: string[] = [];
    const failed: string[] = [];
    for (const lines of plans) {
      try {
        const r = await serializable(tx => createOrderTx(tx, customerId, orderFor(lines), testOpts));
        placed.push(r.code);
      } catch (err) {
        failed.push(err instanceof UserError ? err.message : errorLabel(err));
      }
    }
    invalidate("admin", "shop", "orders");
    return ok({ placed, failed, ms: Date.now() - started });
  } catch (err) {
    return dbError(err);
  }
}

function errorLabel(err: unknown): string {
  if (err instanceof UserError) return `Rejected: ${err.message}`;
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2034") return "Write conflict (retried once, still conflicted)";
    if (err.code === "P2024" || err.code === "P2028") return "Waited too long for a database connection";
    return `Database error ${err.code}`;
  }
  return err instanceof Error ? err.message.slice(0, 160) : String(err);
}

export type RushResult = {
  attempted: number;
  placed: number;
  rejected: number;
  conflicts: number;
  otherErrors: string[];
  ms: number;
  contention: { label: string; before: number; after: number } | null;
};

/**
 * Morning rush: `count` single-unit orders sent at the same time, each in its
 * own serializable transaction (exactly like simultaneous shoppers).
 * Contention mode aims them all at one variant to prove the ledger can't be
 * oversold; the run only starts if that variant can absorb every order and
 * still stay above the low-stock line.
 */
export async function morningRush(count: number, contention: boolean): Promise<ActionResult<RushResult>> {
  await requireDev();
  const n = Math.floor(count);
  if (!Number.isFinite(n) || n < 5 || n > MAX_RUSH_ORDERS) return fail(`Send between 5 and ${MAX_RUSH_ORDERS} orders.`);
  try {
    const [customerId, pool] = await Promise.all([ensureTestCustomer(), safeVariants()]);
    let plans: { variantId: string; qty: number }[][];
    let target: SafeVariant | null = null;
    if (contention) {
      const best = pool[0];
      if (!best || best.spare < n) {
        return fail(
          `No single item can take ${n} sales and stay above the low-stock line${best ? ` (best: ${best.label}, ${best.spare} spare)` : ""}.`
        );
      }
      target = best;
      plans = Array.from({ length: n }, () => [{ variantId: best.id, qty: 1 }]);
    } else {
      const spare = new Map(pool.map(v => [v.id, v.spare]));
      plans = [];
      for (let i = 0; i < n; i++) {
        const open = pool.filter(v => (spare.get(v.id) ?? 0) > 0);
        if (!open.length) break;
        const v = pick(open);
        spare.set(v.id, (spare.get(v.id) ?? 0) - 1);
        plans.push([{ variantId: v.id, qty: 1 }]);
      }
      if (!plans.length) return fail("No item has stock to spare above the low-stock line. Restock first.");
    }

    const before = target ? (await stockByVariant(prisma, [target.id])).get(target.id) ?? 0 : 0;
    const started = Date.now();
    const settled = await Promise.allSettled(
      plans.map(lines => serializable(tx => createOrderTx(tx, customerId, orderFor(lines), testOpts)))
    );
    const ms = Date.now() - started;

    let placed = 0;
    let rejected = 0;
    let conflicts = 0;
    const otherErrors: string[] = [];
    for (const s of settled) {
      if (s.status === "fulfilled") placed++;
      else if (s.reason instanceof UserError) rejected++;
      else if (s.reason instanceof Prisma.PrismaClientKnownRequestError && s.reason.code === "P2034") conflicts++;
      else otherErrors.push(errorLabel(s.reason));
    }
    const after = target ? (await stockByVariant(prisma, [target.id])).get(target.id) ?? 0 : 0;

    invalidate("admin", "shop", "orders");
    return ok({
      attempted: plans.length,
      placed,
      rejected,
      conflicts,
      otherErrors: [...new Set(otherErrors)],
      ms,
      contention: target ? { label: target.label, before, after } : null,
    });
  } catch (err) {
    return dbError(err);
  }
}

/**
 * Cancel every open test order. Stock goes back as compensating movements
 * tagged "· dev test"; the original sale rows stay. Completed test orders
 * can't be cancelled (same rule as for staff).
 */
export async function cleanUpTestOrders(): Promise<ActionResult<{ cancelled: string[]; skipped: number }>> {
  const dev = await requireDev();
  try {
    const open = await prisma.order.findMany({
      where: { customer: { email: DEV_TEST_EMAIL }, status: { in: [...OPEN_STATUSES] } },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });
    const cancelled: string[] = [];
    let skipped = 0;
    for (const { id } of open) {
      const code = await serializable(async tx => {
        const order = await tx.order.findUnique({
          where: { id },
          include: { stockMovements: { select: { variantId: true, quantity: true } } },
        });
        if (!order || !(OPEN_STATUSES as readonly string[]).includes(order.status)) return null;
        await cancelOrderTx(tx, order, dev.id, DEV_CLEANUP_NOTE, "Cancelled", DEV_REASON_SUFFIX);
        return order.orderNumber;
      });
      if (code === null) skipped++;
      else cancelled.push(orderCode(code));
    }
    invalidate("admin", "shop", "orders");
    return ok({ cancelled, skipped });
  } catch (err) {
    return dbError(err);
  }
}

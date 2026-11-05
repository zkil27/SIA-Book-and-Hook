import type { PrismaClient } from "@prisma/client";
import { oldestRemainingAt, sumStock } from "../ledger";
import { peso } from "../money";
import { oldestInflowByVariant, stockByVariant } from "../stock-sql";

/**
 * Read-only integrity checks, shared by the CLI scripts
 * (`npm run check:ledger`, `npm run check:data`) and the /admin/dev Checks
 * page so both always report the same thing. No `server-only` and relative
 * imports, so tsx can run it outside Next.js.
 */

export type CheckStatus = "pass" | "warn" | "fail";
export type CheckResult = { name: string; status: CheckStatus; detail: string };
export type CheckReport = { title: string; results: CheckResult[]; info: string[]; ms: number };

const isNonNegInt = (n: number) => Number.isInteger(n) && n >= 0;

function check(results: CheckResult[], ok: boolean, name: string, failDetail: string, okDetail = "", status: CheckStatus = "fail") {
  results.push(ok ? { name, status: "pass", detail: okDetail } : { name, status, detail: failDetail });
}

/** First few items of a list for a readable failure message. */
function sample(items: string[], n = 5): string {
  return items.length <= n ? items.join(", ") : `${items.slice(0, n).join(", ")} and ${items.length - n} more`;
}

/**
 * The stock ledger's invariants, plus parity between the SQL stock math the
 * app now uses (lib/stock-sql.ts) and the reference JavaScript in lib/ledger.ts.
 */
export async function runLedgerChecks(db: PrismaClient): Promise<CheckReport> {
  const started = Date.now();
  const results: CheckResult[] = [];
  const info: string[] = [];

  const [variants, movementCount, sqlStock, sqlOldest] = await Promise.all([
    db.productVariant.findMany({
      select: {
        id: true,
        sku: true,
        name: true,
        priceCentavos: true,
        product: { select: { name: true } },
        stockMovements: {
          select: { id: true, quantity: true, reason: true, createdAt: true },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
      },
    }),
    db.stockMovement.count(),
    stockByVariant(db),
    oldestInflowByVariant(db),
  ]);

  const negative: string[] = [];
  const zeroQty: string[] = [];
  const noReason: string[] = [];
  const wentNegative: string[] = [];
  const stockMismatch: string[] = [];
  const ageMismatch: string[] = [];
  const byReason = new Map<string, number>();
  let attached = 0;
  let inStock = 0;
  let value = 0;

  for (const v of variants) {
    const ms = v.stockMovements;
    attached += ms.length;
    const stock = sumStock(ms);
    if (stock < 0) negative.push(`${v.sku} (${stock})`);
    if (stock > 0) {
      inStock++;
      value += stock * v.priceCentavos;
    }

    let running = 0;
    let dipped = false;
    for (const m of ms) {
      running += m.quantity;
      if (running < 0) dipped = true;
      if (m.quantity === 0) zeroQty.push(`${m.id} on ${v.sku}`);
      if (!m.reason || m.reason.trim() === "") noReason.push(`${m.id} on ${v.sku}`);
      byReason.set(m.reason, (byReason.get(m.reason) ?? 0) + 1);
    }
    if (dipped) wentNegative.push(v.sku);

    const sql = sqlStock.get(v.id) ?? 0;
    if (sql !== stock) stockMismatch.push(`${v.sku} (SQL ${sql}, JS ${stock})`);

    // FIFO age parity only holds while the balance never went negative.
    if (!dipped && stock > 0) {
      const js = oldestRemainingAt(ms)?.getTime() ?? null;
      const s = sqlOldest.get(v.id)?.getTime() ?? null;
      if (js !== s) ageMismatch.push(v.sku);
    }
  }

  check(results, negative.length === 0, "No variant has negative stock", `${negative.length}: ${sample(negative)}`, `${variants.length} variants`);
  check(results, zeroQty.length === 0, "No zero-quantity movements", `${zeroQty.length}: ${sample(zeroQty)}`);
  check(results, noReason.length === 0, "Every movement has a reason", `${noReason.length}: ${sample(noReason)}`);
  check(
    results,
    attached === movementCount,
    "No orphaned movements",
    `${movementCount - attached} movement(s) point at a missing variant`,
    `${movementCount} movements, all on real variants`
  );
  check(
    results,
    wentNegative.length === 0,
    "Running balance never went below zero",
    `${wentNegative.length} variant(s) dipped below zero at some point: ${sample(wentNegative)}`,
    "",
    "warn"
  );
  check(results, stockMismatch.length === 0, "SQL stock matches the ledger sum", `${stockMismatch.length}: ${sample(stockMismatch)}`);
  check(
    results,
    ageMismatch.length === 0,
    "SQL stock age matches the FIFO calculation",
    `${ageMismatch.length}: ${sample(ageMismatch)}`,
    `${inStock} in-stock variants compared`
  );

  info.push(`Ledger size: ${movementCount} movements across ${variants.length} variants`);
  info.push(`${inStock} variants in stock · on-hand value ${peso(value)}`);
  for (const [reason, count] of [...byReason.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    info.push(`${String(count).padStart(4)}  ${reason}`);
  }

  return { title: "Stock ledger invariants", results, info, ms: Date.now() - started };
}

/** The non-ledger invariants: money as integer centavos, stable order totals, users. */
export async function runDataChecks(db: PrismaClient): Promise<CheckReport> {
  const started = Date.now();
  const results: CheckResult[] = [];
  const info: string[] = [];

  const [variants, orders, products, users] = await Promise.all([
    db.productVariant.findMany({ select: { sku: true, priceCentavos: true } }),
    db.order.findMany({
      select: {
        orderNumber: true,
        totalCentavos: true,
        deliveryFeeCentavos: true,
        items: { select: { quantity: true, priceAtTime: true } },
      },
    }),
    db.product.findMany({ select: { name: true, active: true, _count: { select: { variants: true } } } }),
    db.user.findMany({ select: { email: true, passwordHash: true, role: true } }),
  ]);

  const badPrices = variants.filter(v => !isNonNegInt(v.priceCentavos)).map(v => `${v.sku}=${v.priceCentavos}`);
  check(results, badPrices.length === 0, "Variant prices are non-negative integer centavos", sample(badPrices), `${variants.length} variants`);

  const badTotals: string[] = [];
  const mismatched: string[] = [];
  let badPriceAtTime = 0;
  for (const o of orders) {
    if (!isNonNegInt(o.totalCentavos)) badTotals.push(`#${o.orderNumber}`);
    const computed =
      o.items.reduce((s, i) => {
        if (!isNonNegInt(i.priceAtTime)) badPriceAtTime++;
        return s + i.priceAtTime * i.quantity;
      }, 0) + o.deliveryFeeCentavos;
    if (computed !== o.totalCentavos) mismatched.push(`#${o.orderNumber} (${peso(o.totalCentavos)} vs ${peso(computed)})`);
  }
  check(results, badTotals.length === 0, "Order totals are non-negative integer centavos", sample(badTotals));
  check(results, mismatched.length === 0, "Order totals match their items plus delivery fee", sample(mismatched), `${orders.length} orders`);
  check(results, badPriceAtTime === 0, "Order items carry a valid captured price", `${badPriceAtTime} item(s) invalid`);

  const activeNoVariant = products.filter(p => p.active && p._count.variants === 0).map(p => p.name);
  check(results, activeNoVariant.length === 0, "Every active product has a variant", sample(activeNoVariant));

  const emptySkus = variants.filter(v => !v.sku || v.sku.trim() === "").length;
  check(results, emptySkus === 0, "Every variant has a SKU", `${emptySkus} empty`);

  const noHash = users.filter(u => !u.passwordHash || u.passwordHash.length < 20).map(u => u.email);
  const badRole = users.filter(u => u.role !== "ADMIN" && u.role !== "CUSTOMER").length;
  const admins = users.filter(u => u.role === "ADMIN").length;
  check(results, noHash.length === 0, "Every user has a password hash", sample(noHash), `${users.length} users`);
  check(results, badRole === 0, "Every user has a valid role", `${badRole} invalid`);
  check(results, admins > 0, "At least one ADMIN exists", "No ADMIN user: nobody can open the admin", `${admins} admin(s)`);

  info.push(`${orders.length} orders · ${products.length} products · ${users.length} users`);
  return { title: "Data integrity", results, info, ms: Date.now() - started };
}

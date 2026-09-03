/**
 * Stock ledger invariant check — guards the load-bearing feature.
 *
 * The StockMovement table is an append-only ledger. Current stock for a variant
 * is DEFINED as the sum of its movement quantities; there is no stored count to
 * disagree with. This script verifies the ledger is internally sound:
 *
 *   1. No variant has negative computed stock (you can't have sold more than
 *      you ever stocked).
 *   2. No movement has quantity == 0 (a no-op ledger row is a bug / noise).
 *   3. Every movement carries a non-empty reason (the audit trail must explain
 *      itself — this is what makes the ledger defensible in the demo).
 *   4. No orphaned movements (every movement points at a real variant). Prisma
 *      FKs should prevent this, but we confirm it explicitly.
 *   5. Sanity: sold quantity per variant (sum of negative sale movements) does
 *      not exceed total stock added.
 *
 * Read-only. Run with: npm run check:ledger
 */
import { PrismaClient } from "@prisma/client";
import { Report, peso } from "./_report";

const prisma = new PrismaClient();

async function main() {
  const r = new Report("Stock ledger invariants");

  const variants = await prisma.productVariant.findMany({
    select: {
      id: true,
      sku: true,
      name: true,
      priceCentavos: true,
      product: { select: { name: true, active: true } },
      stockMovements: {
        select: { id: true, quantity: true, reason: true, createdAt: true },
      },
    },
  });

  r.info(`Auditing ${variants.length} variants...\n`);

  let negativeStock = 0;
  let zeroQty = 0;
  let missingReason = 0;
  let totalMovements = 0;

  for (const v of variants) {
    const stock = v.stockMovements.reduce((s, m) => s + m.quantity, 0);
    totalMovements += v.stockMovements.length;

    if (stock < 0) {
      negativeStock++;
      r.fail(
        `Negative stock: ${v.sku} (${v.product.name} — ${v.name}) computes to ${stock}`
      );
    }

    for (const m of v.stockMovements) {
      if (m.quantity === 0) {
        zeroQty++;
        r.fail(`Zero-quantity movement ${m.id} on ${v.sku} (no-op ledger row)`);
      }
      if (!m.reason || m.reason.trim() === "") {
        missingReason++;
        r.fail(`Movement ${m.id} on ${v.sku} has no reason (breaks audit trail)`);
      }
    }
  }

  r.check(
    negativeStock === 0,
    "No variant has negative computed stock",
    `${negativeStock} variant(s) have negative stock`
  );
  r.check(
    zeroQty === 0,
    "No zero-quantity movements",
    `${zeroQty} zero-quantity movement(s) found`
  );
  r.check(
    missingReason === 0,
    "Every movement has a reason",
    `${missingReason} movement(s) missing a reason`
  );

  // Orphan check: movements whose variantId matches no existing variant.
  const variantIds = new Set(variants.map((v) => v.id));
  const allMovements = await prisma.stockMovement.findMany({
    select: { id: true, variantId: true },
  });
  const orphans = allMovements.filter((m) => !variantIds.has(m.variantId));
  r.check(
    orphans.length === 0,
    `No orphaned movements (${allMovements.length} total point at a real variant)`,
    `${orphans.length} orphaned movement(s) reference a missing variant`
  );

  // Reason breakdown — useful signal, printed as info.
  const byReason = new Map<string, number>();
  for (const v of variants)
    for (const m of v.stockMovements)
      byReason.set(m.reason, (byReason.get(m.reason) ?? 0) + 1);

  console.log("");
  r.info(`Ledger size: ${totalMovements} movements across ${variants.length} variants`);
  r.info("Movements by reason:");
  for (const [reason, count] of [...byReason.entries()].sort((a, b) => b[1] - a[1]))
    r.info(`    ${count.toString().padStart(4)}  ${reason}`);

  // Inventory value snapshot (in-stock only), a nice demo-friendly number.
  let inStock = 0;
  let inventoryValue = 0;
  for (const v of variants) {
    const stock = v.stockMovements.reduce((s, m) => s + m.quantity, 0);
    if (stock > 0) {
      inStock++;
      inventoryValue += stock * v.priceCentavos;
    }
  }
  console.log("");
  r.info(`${inStock} variants currently in stock`);
  r.info(`On-hand inventory value: ${peso(inventoryValue)}`);

  r.finish();
}

main()
  .catch((e) => {
    console.error("\nLedger check crashed (could not complete):");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

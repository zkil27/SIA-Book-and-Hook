/**
 * Stock ledger invariant check — guards the load-bearing feature.
 *
 * The StockMovement table is an append-only ledger. Current stock for a variant
 * is DEFINED as the sum of its movement quantities; there is no stored count to
 * disagree with. The checks themselves live in lib/dev/checks.ts so this
 * script and the /admin/dev Checks page always agree:
 *
 *   1. No variant has negative computed stock.
 *   2. No movement has quantity == 0 (a no-op ledger row is a bug / noise).
 *   3. Every movement carries a non-empty reason (the audit trail must explain
 *      itself — this is what makes the ledger defensible in the demo).
 *   4. No orphaned movements (every movement points at a real variant).
 *   5. Warn when a variant's running balance ever dipped below zero.
 *   6. The SQL stock sums and FIFO stock ages the app uses (lib/stock-sql.ts)
 *      match the reference JavaScript in lib/ledger.ts.
 *
 * Read-only. Run with: npm run check:ledger
 */
import { PrismaClient } from "@prisma/client";
import { runLedgerChecks } from "../lib/dev/checks";
import { printReport } from "./_report";

const prisma = new PrismaClient();

runLedgerChecks(prisma)
  .then(async report => {
    await prisma.$disconnect();
    printReport(report); // exits non-zero on any failure
  })
  .catch(async e => {
    console.error("\nLedger check crashed (could not complete):");
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

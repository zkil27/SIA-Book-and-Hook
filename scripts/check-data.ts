/**
 * Data integrity check — the non-ledger invariants.
 *
 * Verifies the rules the schema alone can't enforce (logic shared with the
 * /admin/dev Checks page in lib/dev/checks.ts):
 *
 *   1. Money is sane: every priceCentavos and every stored total is a
 *      non-negative integer (no floats, no negatives).
 *   2. Order totals are stable and correct: Order.totalCentavos equals the sum
 *      of its OrderItem.priceAtTime * quantity plus Order.deliveryFeeCentavos.
 *   3. OrderItem.priceAtTime is populated (captured price).
 *   4. Every active product has at least one variant.
 *   5. SKUs are non-empty.
 *   6. Users have a password hash and a valid role, and an ADMIN exists.
 *
 * Read-only. Run with: npm run check:data
 */
import { PrismaClient } from "@prisma/client";
import { runDataChecks } from "../lib/dev/checks";
import { printReport } from "./_report";

const prisma = new PrismaClient();

runDataChecks(prisma)
  .then(async report => {
    await prisma.$disconnect();
    printReport(report); // exits non-zero on any failure
  })
  .catch(async e => {
    console.error("\nData integrity check crashed (could not complete):");
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

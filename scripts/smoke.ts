/**
 * Smoke test — the fastest "is anything obviously broken?" check.
 *
 * Confirms the app can reach the database, every model is queryable, and the
 * seed data looks healthy (the seed is the de-facto backup on Supabase's free
 * tier, so an empty DB usually means "run `npx prisma db seed`").
 *
 * Read-only. Run with: npm run smoke
 */
import { PrismaClient } from "@prisma/client";
import { Report } from "./_report";

const prisma = new PrismaClient();

// Rough expectations from the seed (~50 products across 5 categories).
const EXPECTED = { categories: 5, products: 40, variants: 45 };

async function main() {
  const r = new Report("Smoke test");

  const started = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  r.pass(`Database reachable (${Date.now() - started}ms)`);

  const [
    users,
    categories,
    products,
    variants,
    movements,
    orders,
    orderItems,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.stockMovement.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
  ]);

  r.info("Row counts:");
  r.info(`    users:          ${users}`);
  r.info(`    categories:     ${categories}`);
  r.info(`    products:       ${products}`);
  r.info(`    productVariant: ${variants}`);
  r.info(`    stockMovement:  ${movements}`);
  r.info(`    orders:         ${orders}`);
  r.info(`    orderItems:     ${orderItems}`);
  console.log("");

  // Every model responded without throwing => schema is in sync with the DB.
  r.pass("All 7 models are queryable (schema matches the database)");

  // Seed-health signals. These are warnings, not failures: a fresh clone with
  // an empty DB is a legitimate state, it just isn't ready for a demo.
  if (products === 0 && categories === 0 && users === 0) {
    r.warn("Database looks empty. Run: npx prisma db seed");
  } else {
    r.check(
      users > 0,
      "At least one user exists (login will work)",
      "No users found — admin/customer login will fail. Run the seed."
    );
    r.check(
      categories >= EXPECTED.categories,
      `Category count looks seeded (${categories} >= ${EXPECTED.categories})`,
      `Fewer categories than expected (${categories} < ${EXPECTED.categories})`
    );
    if (products < EXPECTED.products) {
      r.warn(
        `Product count is low (${products}; seed targets ~50). Storefront may look sparse.`
      );
    } else {
      r.pass(`Product catalog looks seeded (${products} products)`);
    }
    r.check(
      movements > 0,
      `Stock ledger has entries (${movements} movements)`,
      "Stock ledger is empty — no variant has any stock. Run the seed."
    );
  }

  r.finish();
}

main()
  .catch((e) => {
    console.error("\nSmoke test crashed (could not complete):");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

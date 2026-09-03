/**
 * Data integrity check — the non-ledger invariants.
 *
 * Verifies the rules the schema alone can't enforce:
 *
 *   1. Money is sane: every priceCentavos and every stored total is a
 *      non-negative integer (no floats, no negatives). Money is Int centavos
 *      everywhere; a fractional value here means someone stored pesos by mistake.
 *   2. Order totals are stable and correct: Order.totalCentavos equals the sum
 *      of its OrderItem.priceAtTime * quantity. These are STORED (not
 *      recalculated) so history stays put — this check catches a total that was
 *      written wrong at creation time.
 *   3. OrderItem.priceAtTime is populated (captured price, so later price edits
 *      don't rewrite history).
 *   4. Every active product has at least one variant (a product with no
 *      purchasable unit is a dead storefront tile).
 *   5. SKUs are unique and non-empty (schema enforces unique; we confirm
 *      non-empty and report the count).
 *   6. Users have a password hash and a valid role.
 *
 * Read-only. Run with: npm run check:data
 */
import { PrismaClient, Role } from "@prisma/client";
import { Report, peso } from "./_report";

const prisma = new PrismaClient();

const isNonNegInt = (n: number) => Number.isInteger(n) && n >= 0;

async function main() {
  const r = new Report("Data integrity");

  // --- 1. Money sanity on variants -----------------------------------------
  const variants = await prisma.productVariant.findMany({
    select: { sku: true, priceCentavos: true },
  });
  const badPrices = variants.filter((v) => !isNonNegInt(v.priceCentavos));
  r.check(
    badPrices.length === 0,
    `All ${variants.length} variant prices are non-negative integer centavos`,
    `${badPrices.length} variant(s) have invalid prices: ${badPrices
      .map((v) => `${v.sku}=${v.priceCentavos}`)
      .join(", ")}`
  );

  // --- 2 & 3. Order totals + priceAtTime -----------------------------------
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      totalCentavos: true,
      items: { select: { quantity: true, priceAtTime: true } },
    },
  });

  let mismatchedTotals = 0;
  let badTotals = 0;
  let badPriceAtTime = 0;

  for (const o of orders) {
    if (!isNonNegInt(o.totalCentavos)) {
      badTotals++;
      r.fail(`Order ${o.id.slice(0, 8)} has invalid total: ${o.totalCentavos}`);
    }
    const computed = o.items.reduce((s, i) => {
      if (!isNonNegInt(i.priceAtTime)) badPriceAtTime++;
      return s + i.priceAtTime * i.quantity;
    }, 0);
    if (computed !== o.totalCentavos) {
      mismatchedTotals++;
      r.fail(
        `Order ${o.id.slice(0, 8)} total ${peso(o.totalCentavos)} != sum of items ${peso(
          computed
        )}`
      );
    }
  }

  r.check(
    badTotals === 0,
    "All order totals are non-negative integer centavos",
    `${badTotals} order(s) have invalid totals`
  );
  r.check(
    mismatchedTotals === 0,
    `All ${orders.length} order totals match their line items`,
    `${mismatchedTotals} order total(s) disagree with their items`
  );
  r.check(
    badPriceAtTime === 0,
    "All order items have a valid captured priceAtTime",
    `${badPriceAtTime} order item(s) have invalid priceAtTime`
  );

  // --- 4. Active products must have a variant ------------------------------
  const products = await prisma.product.findMany({
    select: { name: true, active: true, _count: { select: { variants: true } } },
  });
  const activeNoVariant = products.filter(
    (p) => p.active && p._count.variants === 0
  );
  r.check(
    activeNoVariant.length === 0,
    "Every active product has at least one variant",
    `${activeNoVariant.length} active product(s) have no variant: ${activeNoVariant
      .map((p) => p.name)
      .join(", ")}`
  );

  // --- 5. SKUs non-empty ----------------------------------------------------
  const emptySkus = variants.filter((v) => !v.sku || v.sku.trim() === "");
  r.check(
    emptySkus.length === 0,
    "All variant SKUs are non-empty",
    `${emptySkus.length} variant(s) have an empty SKU`
  );

  // --- 6. Users -------------------------------------------------------------
  const users = await prisma.user.findMany({
    select: { email: true, passwordHash: true, role: true },
  });
  const noHash = users.filter((u) => !u.passwordHash || u.passwordHash.length < 20);
  const badRole = users.filter((u) => u.role !== Role.ADMIN && u.role !== Role.CUSTOMER);
  const admins = users.filter((u) => u.role === Role.ADMIN).length;

  r.check(
    noHash.length === 0,
    `All ${users.length} users have a password hash`,
    `${noHash.length} user(s) missing/short password hash: ${noHash
      .map((u) => u.email)
      .join(", ")}`
  );
  r.check(
    badRole.length === 0,
    "All users have a valid role",
    `${badRole.length} user(s) have an invalid role`
  );
  r.check(
    admins > 0,
    `At least one ADMIN exists (${admins}) — admin panel is reachable`,
    "No ADMIN user — nobody can access the admin panel"
  );

  r.finish();
}

main()
  .catch((e) => {
    console.error("\nData integrity check crashed (could not complete):");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Seed script for Hook & Box.
 *
 * Design rules (see docs/data-model.md):
 *  - Money is stored as INTEGER CENTAVOS. ₱180.00 => 18000.
 *  - Stock is NEVER a stored count. Every variant's stock is the sum of its
 *    StockMovement rows (append-only ledger). Seeding "opening stock" means
 *    writing a positive movement, not setting a number.
 *  - Products/variants are archived (active=false), never hard-deleted.
 *
 * Idempotent: clears seedable tables first so re-running gives a clean set.
 * It never drops User rows created outside the seed by email collision — it
 * upserts the demo accounts.
 *
 * Run with: npx prisma db seed   (configured in package.json -> prisma.seed)
 */
import { PrismaClient, OrderStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const peso = (n: number) => Math.round(n * 100); // pesos -> centavos

type VariantSeed = { name: string; sku: string; price: number; opening: number };
type ProductSeed = {
  name: string;
  description: string;
  variants: VariantSeed[];
};
type CategorySeed = { name: string; slug: string; products: ProductSeed[] };

// Prices are in PESOS here for readability; converted to centavos on insert.
const CATALOG: CategorySeed[] = [
  {
    name: "Fish",
    slug: "fish",
    products: [
      { name: "Bangus (Milkfish)", description: "Fresh whole milkfish, caught daily.", variants: [
        { name: "Whole 1kg", sku: "FISH-BANGUS-W1", price: 180, opening: 42 },
        { name: "Boneless 500g", sku: "FISH-BANGUS-BL500", price: 130, opening: 30 },
      ]},
      { name: "Tilapia", description: "Freshwater tilapia, cleaned on request.", variants: [
        { name: "Whole 1kg", sku: "FISH-TILAPIA-W1", price: 150, opening: 60 },
      ]},
      { name: "Galunggong (Round Scad)", description: "Classic Pinoy round scad.", variants: [
        { name: "1kg", sku: "FISH-GG-1", price: 200, opening: 35 },
      ]},
      { name: "Tamban (Sardines)", description: "Small fresh sardines, great for paksiw.", variants: [
        { name: "1kg", sku: "FISH-TAMBAN-1", price: 120, opening: 28 },
      ]},
      { name: "Tulingan (Mackerel Tuna)", description: "Firm-fleshed mackerel tuna.", variants: [
        { name: "Whole 1kg", sku: "FISH-TULINGAN-W1", price: 220, opening: 18 },
      ]},
      { name: "Maya-Maya (Red Snapper)", description: "Premium red snapper.", variants: [
        { name: "Whole 1kg", sku: "FISH-SNAPPER-W1", price: 480, opening: 12 },
        { name: "Fillet 500g", sku: "FISH-SNAPPER-F500", price: 320, opening: 8 },
      ]},
      { name: "Lapu-Lapu (Grouper)", description: "Prized grouper, ideal for steaming.", variants: [
        { name: "Whole 1kg", sku: "FISH-GROUPER-W1", price: 550, opening: 9 },
      ]},
      { name: "Dilis (Anchovies)", description: "Tiny anchovies for frying.", variants: [
        { name: "500g", sku: "FISH-DILIS-500", price: 140, opening: 24 },
      ]},
      { name: "Salmon Belly", description: "Rich imported salmon belly.", variants: [
        { name: "500g", sku: "FISH-SALMON-B500", price: 380, opening: 15 },
      ]},
      { name: "Tanigue (Spanish Mackerel)", description: "Steak-cut Spanish mackerel.", variants: [
        { name: "Steak 1kg", sku: "FISH-TANIGUE-S1", price: 600, opening: 7 },
      ]},
    ],
  },
  {
    name: "Shellfish",
    slug: "shellfish",
    products: [
      { name: "Hipon (Suahe Shrimp)", description: "Sweet suahe shrimp.", variants: [
        { name: "1kg", sku: "SHELL-HIPON-1", price: 350, opening: 18 },
        { name: "500g", sku: "SHELL-HIPON-500", price: 185, opening: 20 },
      ]},
      { name: "Tahong (Mussels)", description: "Green mussels, cleaned.", variants: [
        { name: "500g", sku: "SHELL-TAHONG-500", price: 120, opening: 4 },
        { name: "1kg", sku: "SHELL-TAHONG-1", price: 220, opening: 6 },
      ]},
      { name: "Talaba (Oysters)", description: "Fresh oysters by the dozen.", variants: [
        { name: "Dozen", sku: "SHELL-TALABA-DOZ", price: 200, opening: 0 },
      ]},
      { name: "Halaan (Clams)", description: "Small clams for tinola.", variants: [
        { name: "1kg", sku: "SHELL-HALAAN-1", price: 160, opening: 22 },
      ]},
      { name: "Scallops", description: "Half-shell scallops.", variants: [
        { name: "500g", sku: "SHELL-SCALLOP-500", price: 300, opening: 10 },
      ]},
      { name: "Sugpo (Tiger Prawn)", description: "Large tiger prawns.", variants: [
        { name: "1kg", sku: "SHELL-SUGPO-1", price: 750, opening: 8 },
        { name: "500g", sku: "SHELL-SUGPO-500", price: 390, opening: 9 },
      ]},
      { name: "Curacha (Spanner Crab)", description: "Sweet spanner crab.", variants: [
        { name: "1kg", sku: "SHELL-CURACHA-1", price: 520, opening: 5 },
      ]},
    ],
  },
  {
    name: "Crab",
    slug: "crab",
    products: [
      { name: "Alimasag (Blue Crab)", description: "Meaty blue swimming crab.", variants: [
        { name: "1kg", sku: "CRAB-ALIMASAG-1", price: 420, opening: 9 },
      ]},
      { name: "Alimango (Mud Crab)", description: "Large mud crab, sold live.", variants: [
        { name: "1kg", sku: "CRAB-ALIMANGO-1", price: 650, opening: 12 },
        { name: "Jumbo 1.5kg", sku: "CRAB-ALIMANGO-J15", price: 980, opening: 4 },
      ]},
      { name: "Talangka (River Crab)", description: "Tiny river crabs for taba.", variants: [
        { name: "500g", sku: "CRAB-TALANGKA-500", price: 260, opening: 14 },
      ]},
    ],
  },
  {
    name: "Squid",
    slug: "squid",
    products: [
      { name: "Pusit (Squid)", description: "Fresh squid, cleaned on request.", variants: [
        { name: "1kg", sku: "SQUID-PUSIT-1", price: 280, opening: 25 },
        { name: "500g", sku: "SQUID-PUSIT-500", price: 150, opening: 18 },
      ]},
      { name: "Pusit Bisaya (Baby Squid)", description: "Small tender baby squid.", variants: [
        { name: "500g", sku: "SQUID-BISAYA-500", price: 190, opening: 11 },
      ]},
      { name: "Octopus (Pugita)", description: "Whole octopus, great for grilling.", variants: [
        { name: "1kg", sku: "SQUID-PUGITA-1", price: 420, opening: 6 },
      ]},
    ],
  },
  {
    name: "Prepared",
    slug: "prepared",
    products: [
      { name: "Daing na Bangus (Marinated)", description: "Butterflied marinated milkfish.", variants: [
        { name: "Pack (2 pcs)", sku: "PREP-DAING-2", price: 210, opening: 20 },
      ]},
      { name: "Tinapa (Smoked Fish)", description: "Traditional smoked fish.", variants: [
        { name: "Pack (5 pcs)", sku: "PREP-TINAPA-5", price: 180, opening: 16 },
      ]},
      { name: "Bangus Sisig", description: "Ready-to-cook milkfish sisig.", variants: [
        { name: "Tub 500g", sku: "PREP-SISIG-500", price: 250, opening: 12 },
      ]},
      { name: "Fish Tocino", description: "Sweet-cured fish tocino.", variants: [
        { name: "Pack 500g", sku: "PREP-TOCINO-500", price: 190, opening: 14 },
      ]},
    ],
  },
];

async function clearData() {
  // Order matters: children before parents.
  // These are intentional full-table resets: the seed rebuilds the demo DB from
  // scratch. The append-only-ledger and soft-delete rules apply to APP code, not
  // to a seed reset, so each destructive line is explicitly opted out below.
  await prisma.stockMovement.deleteMany(); // footgun-ok: seed reset, not app code
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany(); // footgun-ok: seed reset, not app code
  await prisma.product.deleteMany(); // footgun-ok: seed reset, not app code
  await prisma.category.deleteMany();
}

async function main() {
  console.log("Clearing existing catalog / order data...");
  await clearData();

  // --- Demo users -----------------------------------------------------------
  const adminPassword = "admin123";
  const customerPassword = "customer123";

  const admin = await prisma.user.upsert({
    where: { email: "admin@hookandbox.ph" },
    update: { role: Role.ADMIN, passwordHash: await bcrypt.hash(adminPassword, 10), name: "Hook & Box Admin" },
    create: {
      email: "admin@hookandbox.ph",
      name: "Hook & Box Admin",
      role: Role.ADMIN,
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "maria@example.com" },
    update: { role: Role.CUSTOMER, passwordHash: await bcrypt.hash(customerPassword, 10), name: "Maria Santos" },
    create: {
      email: "maria@example.com",
      name: "Maria Santos",
      role: Role.CUSTOMER,
      passwordHash: await bcrypt.hash(customerPassword, 10),
    },
  });

  // --- Catalog --------------------------------------------------------------
  // Keep a lookup of sku -> { variantId, priceCentavos } for order seeding.
  const variantBySku = new Map<string, { id: string; priceCentavos: number }>();
  let productCount = 0;
  let variantCount = 0;

  for (const cat of CATALOG) {
    const category = await prisma.category.create({
      data: { name: cat.name, slug: cat.slug },
    });

    for (const p of cat.products) {
      const product = await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          categoryId: category.id,
          active: true,
        },
      });
      productCount++;

      for (const v of p.variants) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            name: v.name,
            sku: v.sku,
            priceCentavos: peso(v.price),
          },
        });
        variantCount++;
        variantBySku.set(v.sku, { id: variant.id, priceCentavos: peso(v.price) });

        // Opening stock is a ledger entry, not a stored number.
        if (v.opening > 0) {
          await prisma.stockMovement.create({
            data: {
              variantId: variant.id,
              quantity: v.opening,
              reason: "Opening stock (seed)",
            },
          });
        }
      }
    }
  }

  // --- A few historical orders with matching stock movements ----------------
  // Each ordered line writes a negative StockMovement so the ledger and the
  // derived stock stay consistent.
  type Line = { sku: string; qty: number };
  const orderSeeds: { customerId: string; status: OrderStatus; lines: Line[] }[] = [
    { customerId: customer.id, status: OrderStatus.COMPLETED, lines: [
      { sku: "FISH-BANGUS-W1", qty: 2 }, { sku: "SHELL-HIPON-1", qty: 1 },
    ]},
    { customerId: customer.id, status: OrderStatus.CONFIRMED, lines: [
      { sku: "SQUID-PUSIT-1", qty: 1 }, { sku: "FISH-TILAPIA-W1", qty: 2 },
    ]},
    { customerId: customer.id, status: OrderStatus.PENDING, lines: [
      { sku: "CRAB-ALIMANGO-1", qty: 1 },
    ]},
  ];

  let orderCount = 0;
  for (const o of orderSeeds) {
    const items = o.lines.map((l) => {
      const v = variantBySku.get(l.sku);
      if (!v) throw new Error(`Seed order references unknown SKU ${l.sku}`);
      return { variantId: v.id, quantity: l.qty, priceAtTime: v.priceCentavos };
    });
    const total = items.reduce((s, i) => s + i.priceAtTime * i.quantity, 0);

    const order = await prisma.order.create({
      data: {
        customerId: o.customerId,
        status: o.status,
        totalCentavos: total,
        items: { create: items },
      },
    });
    orderCount++;

    // Only orders that consumed stock (confirmed/completed) reduce the ledger.
    if (o.status === OrderStatus.COMPLETED || o.status === OrderStatus.CONFIRMED) {
      for (const i of items) {
        await prisma.stockMovement.create({
          data: {
            variantId: i.variantId,
            quantity: -i.quantity,
            reason: `Sale — order ${order.id.slice(0, 8)}`,
          },
        });
      }
    }
  }

  console.log("\nSeed complete:");
  console.log(`  Categories: ${CATALOG.length}`);
  console.log(`  Products:   ${productCount}`);
  console.log(`  Variants:   ${variantCount}`);
  console.log(`  Orders:     ${orderCount}`);
  console.log("\nDemo accounts:");
  console.log(`  ADMIN     ${admin.email} / ${adminPassword}`);
  console.log(`  CUSTOMER  ${customer.email} / ${customerPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

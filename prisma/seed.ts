/**
 * Seed script for Hook & Box.
 *
 * Design rules (see docs/data-model.md):
 *  - Money is stored as INTEGER CENTAVOS. ₱180.00 => 18000.
 *  - Stock is NEVER a stored count. Every variant's stock is the sum of its
 *    StockMovement rows (append-only ledger). Opening stock, sales, restocks,
 *    spoilage and corrections are all movements.
 *  - Products/variants are archived (active=false), never hard-deleted.
 *
 * Builds a believable last week for the demo: dated opening stock (some of it
 * old enough to show in the FIFO "To sale" queue), a week of orders across
 * every status with their timelines, walk-in sales, spoilage, a morning-count
 * correction, an undo, and two price changes today.
 *
 * Idempotent: clears seedable tables first. Demo users are upserted.
 * Run with: npx prisma db seed
 */
import { PrismaClient, OrderStatus, Role, type PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATALOG } from "../lib/catalog-data";

const prisma = new PrismaClient();

const peso = (n: number) => Math.round(n * 100); // pesos -> centavos
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

// Start of today in Manila (UTC+8), as a UTC instant.
function startOfShopDay(): Date {
  const local = new Date(Date.now() + 8 * HOUR);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - 8 * HOUR);
}
const TODAY = startOfShopDay();
/** `days` ago at Manila clock time `hour` (fractional allowed). */
const at = (days: number, hour: number) => new Date(TODAY.getTime() - days * DAY + hour * HOUR);

// Deterministic RNG so every seed run produces the same demo.
let rngState = 20261010;
function rand() {
  rngState = (rngState * 1103515245 + 12345) % 2147483648;
  return rngState / 2147483648;
}
const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];

// Items whose opening stock arrived 9+ days ago and sells slowly: they land in
// the admin's FIFO "To sale" queue.
const SLOW_MOVERS = new Set(["FISH-TULINGAN-W1", "FISH-TAMBAN-1", "PREP-TINAPA-5", "PREP-TOCINO-500"]);

async function clearData() {
  // Order matters: children before parents. Intentional full-table resets: the
  // seed rebuilds the demo DB from scratch, so each destructive line is opted out.
  await prisma.orderStatusEvent.deleteMany(); // footgun-ok: seed reset, not app code
  await prisma.stockMovement.deleteMany(); // footgun-ok: seed reset, not app code
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany(); // footgun-ok: seed reset, not app code
  await prisma.product.deleteMany(); // footgun-ok: seed reset, not app code
  await prisma.category.deleteMany();
}

async function upsertUser(email: string, name: string, role: Role, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { role, passwordHash, name },
    create: { email, name, role, passwordHash },
  });
}

async function main() {
  console.log("Clearing existing catalog / order data...");
  await clearData();

  // --- Users ------------------------------------------------------------------
  const admin = await upsertUser("admin@hookandbox.ph", "Kiel (Admin)", Role.ADMIN, "admin123");
  const clerk = await upsertUser("clerk@hookandbox.ph", "Chels (Clerk)", Role.ADMIN, "clerk123");
  const maria = await upsertUser("maria@example.com", "Maria Santos", Role.CUSTOMER, "customer123");
  const others = await Promise.all([
    upsertUser("jose@example.com", "Jose Reyes", Role.CUSTOMER, "customer123"),
    upsertUser("ana@example.com", "Ana Cruz", Role.CUSTOMER, "customer123"),
    upsertUser("pedro@example.com", "Pedro Lim", Role.CUSTOMER, "customer123"),
    upsertUser("liza@example.com", "Liza Mendoza", Role.CUSTOMER, "customer123"),
  ]);
  const customers = [maria, ...others];
  const staff = [admin, clerk];

  // --- Catalog + opening stock -------------------------------------------------
  type V = { id: string; sku: string; price: number; productName: string; opening: number };
  const variants: V[] = [];
  const stock = new Map<string, number>();
  let productCount = 0;

  for (const cat of CATALOG) {
    const category = await prisma.category.create({ data: { name: cat.name, slug: cat.slug } });
    for (const p of cat.products) {
      const product = await prisma.product.create({
        data: { name: p.name, description: p.description, imageUrl: p.image, categoryId: category.id, active: true },
      });
      productCount++;
      for (const v of p.variants) {
        const variant = await prisma.productVariant.create({
          data: { productId: product.id, name: v.name, sku: v.sku, priceCentavos: peso(v.price) },
        });
        variants.push({ id: variant.id, sku: v.sku, price: peso(v.price), productName: p.name, opening: v.opening });
        if (v.opening > 0) {
          // Opening stock carries a buffer that the week's sales then consume.
          const qty = v.opening + (SLOW_MOVERS.has(v.sku) ? 3 : 8);
          await prisma.stockMovement.create({
            data: {
              variantId: variant.id,
              quantity: qty,
              reason: SLOW_MOVERS.has(v.sku) ? "Opening stock" : "Restock — morning catch",
              actorId: clerk.id,
              // Fast movers arrived 6 days ago (before the first order, under the
              // 7-day To-sale line); slow movers 10 days ago, so they're flagged.
              createdAt: SLOW_MOVERS.has(v.sku) ? at(10, 6) : at(6, 5),
            },
          });
          stock.set(variant.id, qty);
        } else {
          stock.set(variant.id, 0);
        }
      }
    }
  }
  const bySku = new Map(variants.map(v => [v.sku, v]));
  const sku = (s: string) => {
    const v = bySku.get(s);
    if (!v) throw new Error(`Unknown SKU ${s}`);
    return v;
  };

  async function move(v: V, quantity: number, reason: string, when: Date, extra: { orderId?: string; actorId?: string } = {}) {
    const next = (stock.get(v.id) ?? 0) + quantity;
    if (next < 0) throw new Error(`Seed would oversell ${v.sku}`);
    stock.set(v.id, next);
    return prisma.stockMovement.create({
      data: { variantId: v.id, quantity, reason, createdAt: when, orderId: extra.orderId, actorId: extra.actorId },
    });
  }

  // --- A week of orders ------------------------------------------------------
  const addresses = [
    ["Blk 5 Lot 12, Mabini St.", "Salawag"],
    ["14 Aguinaldo Hwy", "Sampaloc"],
    ["Phase 2, Blk 9 Lot 3", "Paliparan"],
    ["22 Rizal Ave.", "Zone I"],
    ["Villa Esperanza, Lot 7", "Langkaan"],
    ["88 Burol Main Rd.", "Burol"],
  ];
  const slots = ["6:00–8:00 AM", "8:00–10:00 AM", "10:00 AM–12:00 NN"];
  const sellableSkus = variants.filter(v => v.opening > 0 && !SLOW_MOVERS.has(v.sku)).map(v => v.sku);

  type Plan = { day: number; hour: number; status: OrderStatus; lines?: [string, number][]; cancelNote?: string };
  const plans: Plan[] = [
    { day: 6, hour: 7.2, status: OrderStatus.COMPLETED },
    { day: 6, hour: 9.5, status: OrderStatus.COMPLETED },
    { day: 5, hour: 8.1, status: OrderStatus.COMPLETED },
    { day: 5, hour: 15.4, status: OrderStatus.CANCELLED, cancelNote: "Customer cancelled" },
    { day: 4, hour: 7.6, status: OrderStatus.COMPLETED },
    { day: 4, hour: 11.3, status: OrderStatus.COMPLETED },
    { day: 3, hour: 6.8, status: OrderStatus.COMPLETED },
    { day: 3, hour: 13.9, status: OrderStatus.COMPLETED },
    { day: 2, hour: 8.4, status: OrderStatus.COMPLETED },
    { day: 2, hour: 10.2, status: OrderStatus.COMPLETED },
    { day: 1, hour: 7.1, status: OrderStatus.COMPLETED },
    { day: 1, hour: 16.5, status: OrderStatus.READY },
    { day: 0, hour: 6.3, status: OrderStatus.CONFIRMED, lines: [["SQUID-PUSIT-1", 1], ["FISH-TILAPIA-W1", 2]] },
    { day: 0, hour: 7.4, status: OrderStatus.PENDING, lines: [["CRAB-ALIMANGO-1", 1], ["SHELL-HIPON-500", 1]] },
    { day: 0, hour: 8.2, status: OrderStatus.PENDING, lines: [["FISH-BANGUS-W1", 2], ["SHELL-HALAAN-1", 1]] },
    { day: 0, hour: 8.9, status: OrderStatus.PENDING, lines: [["SHELL-SUGPO-500", 1], ["SQUID-BISAYA-500", 1]] },
  ];
  // Seeded orders begin in the past, so drop any that would land in the future.
  const nowMs = Date.now();
  const flow: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.READY, OrderStatus.COMPLETED];

  let orderCount = 0;
  for (const [i, plan] of plans.entries()) {
    const placed = at(plan.day, plan.hour);
    if (placed.getTime() > nowMs) continue;
    const customer = i < 3 || plan.status === OrderStatus.PENDING ? customers[i % customers.length] : pick(customers);
    const lines =
      plan.lines ??
      Array.from({ length: 1 + Math.floor(rand() * 3) }, () => [pick(sellableSkus), 1 + Math.floor(rand() * 2)] as [string, number]);
    const merged = new Map<string, number>();
    for (const [s, q] of lines) merged.set(s, (merged.get(s) ?? 0) + q);
    const items = [...merged.entries()]
      .map(([s, q]) => ({ v: sku(s), q: Math.min(q, stock.get(sku(s).id) ?? 0) }))
      .filter(x => x.q > 0);
    if (items.length === 0) continue;

    const subtotal = items.reduce((s, x) => s + x.v.price * x.q, 0);
    const fee = subtotal >= 50000 ? 0 : 5000;
    const [address, barangay] = addresses[i % addresses.length];
    const payment: PaymentMethod = i % 3 === 0 ? "COD" : "GCASH";

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        status: plan.status,
        paymentMethod: payment,
        deliveryName: customer.name ?? "Customer",
        deliveryPhone: `0917 ${String(200 + i * 37).padStart(3, "0")} ${String(1000 + i * 413).slice(0, 4)}`,
        deliveryAddress: address,
        deliveryBarangay: barangay,
        deliverySlot: slots[i % slots.length],
        deliveryFeeCentavos: fee,
        totalCentavos: subtotal + fee,
        createdAt: placed,
        items: { create: items.map(x => ({ variantId: x.v.id, quantity: x.q, priceAtTime: x.v.price })) },
      },
    });
    orderCount++;
    const code = `HB-${String(order.orderNumber).padStart(4, "0")}`;

    // Placing an order takes its stock off the shelf.
    for (const x of items) await move(x.v, -x.q, `Sale — ${code}`, placed, { orderId: order.id });

    // Timeline up to the order's current status.
    await prisma.orderStatusEvent.create({
      data: { orderId: order.id, toStatus: OrderStatus.PENDING, actorId: customer.id, note: "Placed online", createdAt: placed },
    });
    const target = plan.status === OrderStatus.CANCELLED ? OrderStatus.PENDING : plan.status;
    let t = placed.getTime();
    for (let s = 1; s <= flow.indexOf(target); s++) {
      t += (0.4 + rand() * 1.4) * HOUR;
      await prisma.orderStatusEvent.create({
        data: { orderId: order.id, fromStatus: flow[s - 1], toStatus: flow[s], actorId: pick(staff).id, createdAt: new Date(Math.min(t, nowMs - 60_000)) },
      });
    }
    if (plan.status === OrderStatus.CANCELLED) {
      const when = new Date(placed.getTime() + 0.6 * HOUR);
      for (const x of items) await move(x.v, x.q, `Cancelled — ${code} (back to stock)`, when, { orderId: order.id, actorId: admin.id });
      await prisma.orderStatusEvent.create({
        data: { orderId: order.id, fromStatus: OrderStatus.PENDING, toStatus: OrderStatus.CANCELLED, actorId: admin.id, note: plan.cancelNote, createdAt: when },
      });
    }
  }

  // --- Counter activity: walk-ins, spoilage, a recount, an undo -------------
  const ifPast = (d: Date) => d.getTime() < nowMs;
  const walkins: [string, number, number, number][] = [
    ["FISH-GG-1", 2, 4, 9.1],
    ["FISH-BANGUS-W1", 3, 3, 10.4],
    ["SQUID-PUSIT-500", 2, 2, 8.7],
    ["FISH-TAMBAN-1", 1, 2, 11.2],
    ["SHELL-HIPON-1", 1, 1, 9.6],
    ["FISH-TILAPIA-W1", 2, 0, 6.6],
  ];
  for (const [s, q, d, h] of walkins) {
    if (ifPast(at(d, h))) await move(sku(s), -q, "Walk-in sale", at(d, h), { actorId: clerk.id });
  }

  await move(sku("SHELL-TAHONG-500"), -2, "Spoilage — shells open, discarded", at(3, 17.2), { actorId: clerk.id });
  const damaged = await move(sku("FISH-SNAPPER-W1"), -3, "Damaged in transit", at(2, 7.0), { actorId: clerk.id });
  // That one was a mistake (only 1 was damaged): fixed with a compensating entry.
  await prisma.stockMovement.create({
    data: {
      variantId: damaged.variantId,
      quantity: 3,
      reason: `Undo of MV-${damaged.id.slice(-6).toUpperCase()}`,
      actorId: admin.id,
      createdAt: new Date(at(2, 7.0).getTime() + 20 * 60_000),
    },
  });
  stock.set(damaged.variantId, (stock.get(damaged.variantId) ?? 0) + 3);
  await move(sku("FISH-SNAPPER-W1"), -1, "Damaged in transit", new Date(at(2, 7.0).getTime() + 22 * 60_000), { actorId: admin.id });

  // Yesterday's morning count found two fewer squid than the system had.
  const squid = sku("SQUID-PUSIT-1");
  const sys = stock.get(squid.id) ?? 0;
  await move(squid, -2, `Morning count (counted ${sys - 2}, system had ${sys})`, at(1, 5.8), { actorId: clerk.id });

  // Today's dawn restock for a few fast movers.
  for (const [s, q] of [["FISH-BANGUS-W1", 12], ["SHELL-HIPON-1", 6], ["CRAB-ALIMASAG-1", 4]] as [string, number][]) {
    if (ifPast(at(0, 5.4))) await move(sku(s), q, "Restock — morning catch", at(0, 5.4), { actorId: clerk.id });
  }

  // --- Two market price changes this morning --------------------------------
  const changedAt = ifPast(at(0, 5.5)) ? at(0, 5.5) : new Date(nowMs - 60_000);
  await prisma.productVariant.update({ where: { id: sku("FISH-BANGUS-W1").id }, data: { priceCentavos: peso(175), priceUpdatedAt: changedAt } });
  await prisma.productVariant.update({ where: { id: sku("CRAB-ALIMANGO-1").id }, data: { priceCentavos: peso(680), priceUpdatedAt: changedAt } });

  console.log("\nSeed complete:");
  console.log(`  Categories: ${CATALOG.length}`);
  console.log(`  Products:   ${productCount}`);
  console.log(`  Variants:   ${variants.length}`);
  console.log(`  Orders:     ${orderCount}`);
  console.log("\nDemo accounts:");
  console.log("  ADMIN     admin@hookandbox.ph / admin123");
  console.log("  ADMIN     clerk@hookandbox.ph / clerk123");
  console.log("  CUSTOMER  maria@example.com / customer123");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

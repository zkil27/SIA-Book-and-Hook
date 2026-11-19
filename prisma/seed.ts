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
 * every status with their timelines, delivery trips on the store's own truck
 * (closed history, plus today's runs at every stage), walk-in sales, spoilage,
 * a morning-count correction, an undo, and two price changes today.
 *
 * Idempotent: clears seedable tables first. Demo users are upserted.
 * Run with: npx prisma db seed
 */
import { PrismaClient, OrderStatus, Role, type PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATALOG } from "../lib/catalog-data";
import { routeRank } from "../lib/meta";
import { peso as fmtPeso } from "../lib/money";
import { deliveryDateFor } from "../lib/time";

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
  await prisma.trip.deleteMany();
  await prisma.productVariant.deleteMany(); // footgun-ok: seed reset, not app code
  await prisma.product.deleteMany(); // footgun-ok: seed reset, not app code
  await prisma.category.deleteMany();
}

type SavedContact = { phone: string; address: string; barangay: string };

async function upsertUser(email: string, name: string, role: Role, password: string, contact?: SavedContact) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { role, passwordHash, name, ...contact },
    create: { email, name, role, passwordHash, ...contact },
  });
}

async function main() {
  console.log("Clearing existing catalog / order data...");
  await clearData();

  // --- Users ------------------------------------------------------------------
  const admin = await upsertUser("admin@hookandbox.ph", "Kiel (Admin)", Role.ADMIN, "admin123");
  const clerk = await upsertUser("clerk@hookandbox.ph", "Chels (Clerk)", Role.ADMIN, "clerk123");
  const maria = await upsertUser("maria@example.com", "Maria Santos", Role.CUSTOMER, "customer123", {
    phone: "0917 201 1001",
    address: "Blk 5 Lot 12, Mabini St.",
    barangay: "Salawag",
  });
  const others = await Promise.all([
    upsertUser("jose@example.com", "Jose Reyes", Role.CUSTOMER, "customer123", {
      phone: "0917 202 1002",
      address: "14 Rizal Ave.",
      barangay: "Paliparan",
    }),
    upsertUser("ana@example.com", "Ana Cruz", Role.CUSTOMER, "customer123", {
      phone: "0917 203 1003",
      address: "Blk 9 Lot 3, Sampaguita St.",
      barangay: "Sampaloc",
    }),
    upsertUser("pedro@example.com", "Pedro Lim", Role.CUSTOMER, "customer123", {
      phone: "0917 204 1004",
      address: "27 Bonifacio St.",
      barangay: "Burol",
    }),
    upsertUser("liza@example.com", "Liza Mendoza", Role.CUSTOMER, "customer123", {
      phone: "0917 205 1005",
      address: "Blk 2 Lot 18, Acacia Rd.",
      barangay: "Langkaan",
    }),
  ]);
  const packer = await upsertUser("packer@hookandbox.ph", "Nonoy (Packer)", Role.PACKER, "packer123");
  const driver1 = await upsertUser("driver@hookandbox.ph", "Ramon (Driver)", Role.DRIVER, "driver123");
  const driver2 = await upsertUser("driver2@hookandbox.ph", "Jun (Driver)", Role.DRIVER, "driver123");
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

  // --- A week of orders, packed and delivered on the store's own truck -------
  // Each order goes out the morning after it's placed (lib/time.ts
  // deliveryDateFor). Last week's orders rode trips that are closed and their
  // cash counted. Yesterday's orders make today's three truck runs:
  //   A (6–8 AM)   back at the stall, cash waiting for the office
  //   B (8–10 AM)  on the road: one stop done, three on the truck
  //   C (10–12 NN) being loaded, plus one packed order with no trip yet
  // Today's orders (for tomorrow) wait to be confirmed or packed.
  const SLOTS = ["6:00–8:00 AM", "8:00–10:00 AM", "10:00 AM–12:00 NN"];
  const SLOT_START = [6, 8, 10];
  const sellableSkus = variants.filter(v => v.opening > 0 && !SLOW_MOVERS.has(v.sku)).map(v => v.sku);
  /** Manila clock time `hour` on a delivery day (a UTC-midnight date). */
  const onDay = (day: Date, hour: number) => new Date(day.getTime() + (hour - 8) * HOUR);
  const nowMs = Date.now();
  /** Never in the future: the seed can run at any time of day. */
  const past = (d: Date, slackMin = 1) => new Date(Math.min(d.getTime(), nowMs - slackMin * 60_000));
  const pin = () => String(Math.floor(rand() * 10000)).padStart(4, "0");

  type TripKey = "A" | "B" | "C";
  type Plan = {
    day: number;
    hour: number;
    status: OrderStatus;
    lines?: [string, number][];
    cancelNote?: string;
    slot?: number;
    who?: number; // index into customers
    cod?: boolean;
    trip?: TripKey;
    noPin?: boolean; // delivered with a logged reason instead of the PIN
    loaded?: boolean; // trip C: already ticked onto the truck
  };
  const S = OrderStatus;
  const plans: Plan[] = [
    { day: 6, hour: 7.2, status: S.COMPLETED },
    { day: 6, hour: 9.5, status: S.COMPLETED },
    { day: 5, hour: 8.1, status: S.COMPLETED },
    { day: 5, hour: 15.4, status: S.CANCELLED, cancelNote: "Customer cancelled" },
    { day: 4, hour: 7.6, status: S.COMPLETED },
    { day: 4, hour: 11.3, status: S.COMPLETED, noPin: true },
    { day: 3, hour: 6.8, status: S.COMPLETED },
    { day: 3, hour: 13.9, status: S.COMPLETED },
    { day: 2, hour: 8.4, status: S.COMPLETED },
    { day: 2, hour: 10.2, status: S.COMPLETED },
    // Yesterday → today's runs.
    { day: 1, hour: 7.1, status: S.COMPLETED, slot: 0, trip: "A", cod: true, who: 1 },
    { day: 1, hour: 8.6, status: S.COMPLETED, slot: 0, trip: "A", who: 3 },
    { day: 1, hour: 10.4, status: S.COMPLETED, slot: 0, trip: "A", cod: true, noPin: true, who: 4 },
    { day: 1, hour: 11.2, status: S.COMPLETED, slot: 1, trip: "B", who: 2 },
    { day: 1, hour: 12.8, status: S.READY, slot: 1, trip: "B", cod: true, who: 0 },
    { day: 1, hour: 14.1, status: S.READY, slot: 1, trip: "B", who: 4 },
    { day: 1, hour: 16.5, status: S.READY, slot: 1, trip: "B", cod: true, who: 3 },
    { day: 1, hour: 17.3, status: S.PACKED, slot: 2, trip: "C", loaded: true, who: 1 },
    { day: 1, hour: 18.2, status: S.PACKED, slot: 2, trip: "C", who: 2 },
    { day: 1, hour: 19.0, status: S.PACKED, slot: 2, trip: "C", cod: true, who: 0 },
    { day: 1, hour: 20.1, status: S.PACKED, slot: 2, who: 4 },
    // Today → tomorrow morning.
    { day: 0, hour: 6.3, status: S.CONFIRMED, slot: 0, lines: [["SQUID-PUSIT-1", 1], ["FISH-TILAPIA-W1", 2]] },
    { day: 0, hour: 6.9, status: S.CONFIRMED, slot: 1, lines: [["FISH-BANGUS-W1", 1], ["SHELL-TAHONG-500", 2]] },
    { day: 0, hour: 7.4, status: S.PENDING, lines: [["CRAB-ALIMANGO-1", 1], ["SHELL-HIPON-500", 1]] },
    { day: 0, hour: 8.2, status: S.PENDING, lines: [["FISH-BANGUS-W1", 2], ["SHELL-HALAAN-1", 1]] },
    { day: 0, hour: 8.9, status: S.PENDING, lines: [["SHELL-SUGPO-500", 1], ["SQUID-BISAYA-500", 1]] },
  ];

  type Placed = {
    id: string;
    code: string;
    plan: Plan;
    placed: Date;
    day: Date;
    slot: number;
    barangay: string;
    total: number;
    cod: boolean;
  };
  const placedOrders: Placed[] = [];

  let orderCount = 0;
  for (const [i, plan] of plans.entries()) {
    const placed = at(plan.day, plan.hour);
    if (placed.getTime() > nowMs) continue;
    const customer =
      plan.who !== undefined
        ? customers[plan.who]
        : i < 3 || plan.status === S.PENDING
          ? customers[i % customers.length]
          : pick(customers);
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
    const cod = plan.cod ?? i % 3 === 0;
    const slot = plan.slot ?? i % SLOTS.length;
    const day = deliveryDateFor(placed);

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        status: plan.status,
        paymentMethod: (cod ? "COD" : "GCASH") as PaymentMethod,
        deliveryName: customer.name ?? "Customer",
        deliveryPhone: customer.phone ?? "0917 200 0000",
        deliveryAddress: customer.address ?? "Blk 1 Lot 1",
        deliveryBarangay: customer.barangay ?? "Zone I",
        deliverySlot: SLOTS[slot],
        deliveryDate: day,
        handoffPin: pin(),
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

    await prisma.orderStatusEvent.create({
      data: { orderId: order.id, toStatus: S.PENDING, actorId: customer.id, note: "Placed online", createdAt: placed },
    });
    if (plan.status === S.CANCELLED) {
      const when = new Date(placed.getTime() + 0.6 * HOUR);
      for (const x of items) await move(x.v, x.q, `Cancelled — ${code} (back to stock)`, when, { orderId: order.id, actorId: admin.id });
      await prisma.orderStatusEvent.create({
        data: { orderId: order.id, fromStatus: S.PENDING, toStatus: S.CANCELLED, actorId: admin.id, note: plan.cancelNote, createdAt: when },
      });
      continue;
    }
    if (plan.status !== S.PENDING) {
      await prisma.orderStatusEvent.create({
        data: {
          orderId: order.id,
          fromStatus: S.PENDING,
          toStatus: S.CONFIRMED,
          actorId: pick(staff).id,
          createdAt: past(new Date(placed.getTime() + (0.3 + rand()) * HOUR), 30),
        },
      });
    }
    placedOrders.push({
      id: order.id,
      code,
      plan,
      placed,
      day,
      slot,
      barangay: order.deliveryBarangay,
      total: order.totalCentavos,
      cod,
    });
  }

  // Packing: everything at Packed or beyond was packed at 5 AM on its day.
  const beyondConfirmed = new Set<OrderStatus>([S.PACKED, S.READY, S.COMPLETED]);
  for (const o of placedOrders.filter(p => beyondConfirmed.has(p.plan.status))) {
    await prisma.orderStatusEvent.create({
      data: { orderId: o.id, fromStatus: S.CONFIRMED, toStatus: S.PACKED, actorId: packer.id, createdAt: past(onDay(o.day, 5 + rand() * 0.5), 20) },
    });
  }

  // Trips: last week's deliveries grouped by day and slot, then today's A/B/C.
  type TripPlan = { key: string; day: Date; slot: number; stops: Placed[]; status: "PLANNED" | "OUT" | "RETURNED" | "REMITTED" };
  const tripPlans = new Map<string, TripPlan>();
  for (const o of placedOrders) {
    if (o.plan.trip) {
      const status = o.plan.trip === "A" ? "RETURNED" : o.plan.trip === "B" ? "OUT" : "PLANNED";
      const key = `demo-${o.plan.trip}`;
      if (!tripPlans.has(key)) tripPlans.set(key, { key, day: o.day, slot: o.slot, stops: [], status });
      tripPlans.get(key)!.stops.push(o);
    } else if (o.plan.status === S.COMPLETED) {
      const key = `${o.day.toISOString()}|${o.slot}`;
      if (!tripPlans.has(key)) tripPlans.set(key, { key, day: o.day, slot: o.slot, stops: [], status: "REMITTED" });
      tripPlans.get(key)!.stops.push(o);
    }
  }
  const sortedTrips = [...tripPlans.values()].sort((a, b) => a.day.getTime() - b.day.getTime() || a.slot - b.slot);
  let tripCount = 0;
  for (const [n, tp] of sortedTrips.entries()) {
    const driver = tp.key === "demo-C" ? driver2 : n % 3 === 2 ? driver2 : driver1;
    const vehicle = driver === driver2 ? "Motorbike 1" : "Truck 1";
    const leave = onDay(tp.day, SLOT_START[tp.slot] - 0.25);
    const stops = tp.stops.sort((a, b) => routeRank(a.barangay) - routeRank(b.barangay) || a.placed.getTime() - b.placed.getTime());
    const doneAt = (i: number) => new Date(leave.getTime() + (i + 1) * 0.35 * HOUR);
    const left = tp.status !== "PLANNED";
    const back = tp.status === "RETURNED" || tp.status === "REMITTED" ? past(doneAt(stops.length), 15) : null;
    const cash = stops.filter(s => s.cod && s.plan.status === S.COMPLETED).reduce((sum, s) => sum + s.total, 0);
    const trip = await prisma.trip.create({
      data: {
        date: tp.day,
        slot: SLOTS[tp.slot],
        vehicle,
        driverId: driver.id,
        status: tp.status,
        departedAt: left ? past(leave, 40) : null,
        returnedAt: back,
        ...(tp.status === "REMITTED" && back
          ? { cashRemittedCentavos: cash, remitConfirmedById: admin.id, remittedAt: past(new Date(back.getTime() + 0.25 * HOUR), 10) }
          : {}),
      },
    });
    tripCount++;
    const tripCode = `T-${String(trip.tripNumber).padStart(3, "0")}`;
    for (const [i, s] of stops.entries()) {
      const loaded = left || s.plan.loaded;
      await prisma.order.update({
        where: { id: s.id },
        data: { tripId: trip.id, stopIndex: i + 1, loadedAt: loaded ? past(new Date(leave.getTime() - 0.3 * HOUR), 30) : null },
      });
      if (!left) continue;
      await prisma.orderStatusEvent.create({
        data: {
          orderId: s.id,
          fromStatus: S.PACKED,
          toStatus: S.READY,
          actorId: driver.id,
          note: `On the truck · ${tripCode} stop ${i + 1} of ${stops.length}`,
          createdAt: past(leave, 40),
        },
      });
      if (s.plan.status === S.COMPLETED) {
        const how = s.plan.noPin ? `No PIN: ${pick(["Received by a household member", "Customer couldn't open their PIN"])} · received by ${pick(["Lola Nena (grandmother)", "Ate Joy (sister)", "Kuya Ben (husband)"])}` : "PIN verified";
        await prisma.orderStatusEvent.create({
          data: {
            orderId: s.id,
            fromStatus: S.READY,
            toStatus: S.COMPLETED,
            actorId: driver.id,
            note: `${how}${s.cod ? ` · COD ${fmtPeso(s.total)} collected` : ""}`,
            createdAt: past(doneAt(i), 20),
          },
        });
      }
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
  console.log(`  Trips:      ${tripCount}`);
  console.log("\nDemo accounts:");
  console.log("  ADMIN     admin@hookandbox.ph / admin123");
  console.log("  ADMIN     clerk@hookandbox.ph / clerk123");
  console.log("  PACKER    packer@hookandbox.ph / packer123");
  console.log("  DRIVER    driver@hookandbox.ph / driver123 (also driver2@)");
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

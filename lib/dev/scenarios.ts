import "server-only";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { stockByVariant } from "@/lib/stock-sql";
import { DELIVERY_SLOTS, LOW_STOCK_AT, orderCode, splitName } from "@/lib/meta";
import type { PlaceOrderData } from "@/lib/orders-core";

/**
 * Test-data policy for the dev scenarios (see docs/dev-tools.md):
 * - Add-only. Test orders go through the real checkout code and are cleaned
 *   up by cancelling them, which writes compensating ledger movements. Nothing
 *   is edited or deleted, so test runs leave a visible, explained trace.
 * - Every test order belongs to one dedicated customer whose password is
 *   random and never stored anywhere, so nobody can sign in as it.
 * - Orders only draw from variants that stay ABOVE the low-stock threshold,
 *   so testing never makes the storefront show "low" or "sold out".
 */

export const DEV_TEST_EMAIL = "dev-test@hookandbox.test";
export const DEV_TEST_NAME = "Dev test";
export const DEV_REASON_SUFFIX = " · dev test";
export const DEV_ORDER_NOTE = "Placed by dev test";
export const DEV_CLEANUP_NOTE = "Dev test cleanup";

export const MAX_TEST_ORDERS = 10;
export const MAX_RUSH_ORDERS = 20;

const OPEN = ["PENDING", "CONFIRMED", "READY"] as const;

export async function ensureTestCustomer(): Promise<string> {
  const existing = await prisma.user.findUnique({ where: { email: DEV_TEST_EMAIL }, select: { id: true } });
  if (existing) return existing.id;
  const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
  const user = await prisma.user.upsert({
    where: { email: DEV_TEST_EMAIL },
    update: {},
    create: { email: DEV_TEST_EMAIL, name: DEV_TEST_NAME, passwordHash, role: "CUSTOMER" },
    select: { id: true },
  });
  return user.id;
}

export function testDelivery(): PlaceOrderData["delivery"] {
  return {
    name: DEV_TEST_NAME,
    phone: "0917 000 0000",
    address: "Dev test street",
    barangay: "Dev test",
    slot: DELIVERY_SLOTS[0],
  };
}

export type SafeVariant = { id: string; label: string; stock: number; spare: number };

/**
 * Sellable variants with stock to spare: `spare` is how many units can be
 * sold while staying above LOW_STOCK_AT. Most spare first.
 */
export async function safeVariants(): Promise<SafeVariant[]> {
  const rows = await prisma.productVariant.findMany({
    where: { active: true, product: { active: true } },
    select: { id: true, name: true, product: { select: { name: true } } },
  });
  const stock = await stockByVariant(
    prisma,
    rows.map(r => r.id)
  );
  return rows
    .map(r => {
      const s = stock.get(r.id) ?? 0;
      return { id: r.id, label: `${splitName(r.product.name).local} ${r.name}`, stock: s, spare: s - (LOW_STOCK_AT + 1) };
    })
    .filter(v => v.spare > 0)
    .sort((a, b) => b.spare - a.spare);
}

/** Open (cancellable) test orders and the units they hold. */
export async function openTestOrders() {
  const rows = await prisma.order.findMany({
    where: { customer: { email: DEV_TEST_EMAIL }, status: { in: [...OPEN] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      createdAt: true,
      totalCentavos: true,
      stockMovements: { select: { quantity: true } },
    },
  });
  const orders = rows.map(o => ({
    id: o.id,
    code: orderCode(o.orderNumber),
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    total: o.totalCentavos,
    held: -o.stockMovements.reduce((s, m) => s + m.quantity, 0),
  }));
  const [completed, cancelled] = await Promise.all([
    prisma.order.count({ where: { customer: { email: DEV_TEST_EMAIL }, status: "COMPLETED" } }),
    prisma.order.count({ where: { customer: { email: DEV_TEST_EMAIL }, status: "CANCELLED" } }),
  ]);
  return { orders, held: orders.reduce((s, o) => s + o.held, 0), completed, cancelled };
}

export const OPEN_STATUSES = OPEN;

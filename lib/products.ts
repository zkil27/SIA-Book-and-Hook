import "server-only";
import prisma from "@/lib/prisma";
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from "./fallback-catalog";

/**
 * Storefront product shape consumed by the client UI (app/StoreApp.tsx).
 * Prices are in PESOS (converted from stored centavos) for display.
 * Stock is derived from the append-only StockMovement ledger, never a stored
 * count (see docs/data-model.md).
 */
export type StorefrontProduct = {
  id: string;
  sku?: string;
  productId: string;
  variantId: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number; // pesos
  unit: string; // e.g. "/kg", derived from variant name
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  oldestStockAt?: string;
};

export type StorefrontCategory = { name: string; slug: string };

const LOW_STOCK_THRESHOLD = 10;
const FALLBACK_RECEIVED_AT = "2026-10-01T08:00:00.000Z";

function statusFor(stock: number): StorefrontProduct["status"] {
  if (stock <= 0) return "Out of Stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "Low Stock";
  return "In Stock";
}

/**
 * Turn a variant name like "Whole 1kg" / "500g" / "Dozen" into a compact unit
 * suffix for the price line. Falls back to the full variant name.
 */
function unitFor(variantName: string): string {
  const n = variantName.toLowerCase();
  if (n.includes("1.5kg")) return "/1.5kg";
  if (n.includes("kg")) return "/kg";
  if (n.includes("500g")) return "/500g";
  if (n.includes("g")) return "/" + (variantName.match(/\d+\s*g/i)?.[0].replace(/\s+/g, "") ?? "pack");
  if (n.includes("doz")) return "/doz";
  if (n.includes("pcs") || n.includes("pc")) return "/pack";
  return `/${variantName}`;
}

function oldestRemainingStockAt(
  movements: Array<{ quantity: number; createdAt: Date }>
): string | undefined {
  const lots: Array<{ quantity: number; createdAt: Date }> = [];

  for (const movement of [...movements].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  )) {
    if (movement.quantity > 0) {
      lots.push({ quantity: movement.quantity, createdAt: movement.createdAt });
      continue;
    }

    let toConsume = Math.abs(movement.quantity);
    while (toConsume > 0 && lots.length > 0) {
      const lot = lots[0];
      const consumed = Math.min(lot.quantity, toConsume);
      lot.quantity -= consumed;
      toConsume -= consumed;
      if (lot.quantity === 0) lots.shift();
    }
  }

  return lots[0]?.createdAt.toISOString();
}

/**
 * Active products, one card per variant, with ledger-derived stock.
 */
export async function getStorefrontProducts(): Promise<StorefrontProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: {
        category: true,
        variants: {
          include: {
            stockMovements: { select: { quantity: true, createdAt: true } },
          },
        },
      },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    });

    const rows: StorefrontProduct[] = [];
    for (const p of products) {
      for (const v of p.variants) {
        const stock = v.stockMovements.reduce((sum, m) => sum + m.quantity, 0);
        const multiVariant = p.variants.length > 1;
        rows.push({
          id: v.id,
          sku: v.sku,
          productId: p.id,
          variantId: v.id,
          name: multiVariant ? `${p.name} — ${v.name}` : p.name,
          category: p.category.name,
          categorySlug: p.category.slug,
          price: Math.round(v.priceCentavos) / 100,
          unit: unitFor(v.name),
          stock,
          status: statusFor(stock),
          oldestStockAt: oldestRemainingStockAt(v.stockMovements),
        });
      }
    }
    return rows;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(
      `[lib/products] Database query failed (${message.slice(0, 80)}...). Using fallback catalog.`
    );
    return FALLBACK_PRODUCTS.map(product => ({
      ...product,
      oldestStockAt: FALLBACK_RECEIVED_AT,
    }));
  }
}

/**
 * Distinct categories that have at least one active product, for the filter row.
 */
export async function getStorefrontCategories(): Promise<StorefrontCategory[]> {
  try {
    const cats = await prisma.category.findMany({
      where: { products: { some: { active: true } } },
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    });
    if (cats.length > 0) return cats;
    return FALLBACK_CATEGORIES;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(
      `[lib/products] Database query failed (${message.slice(0, 80)}...). Using fallback categories.`
    );
    return FALLBACK_CATEGORIES;
  }
}

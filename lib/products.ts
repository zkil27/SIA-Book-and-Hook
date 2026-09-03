import "server-only";
import prisma from "@/lib/prisma";

/**
 * Storefront product shape consumed by the client UI (app/StoreApp.tsx).
 * Prices are in PESOS (converted from stored centavos) for display.
 * Stock is derived from the append-only StockMovement ledger, never a stored
 * count (see docs/data-model.md).
 */
export type StorefrontProduct = {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number; // pesos
  unit: string; // e.g. "/kg", derived from variant name
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
};

export type StorefrontCategory = { name: string; slug: string };

const LOW_STOCK_THRESHOLD = 10;

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

/**
 * Active products, one card per variant, with ledger-derived stock.
 */
export async function getStorefrontProducts(): Promise<StorefrontProduct[]> {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      category: true,
      variants: {
        include: {
          stockMovements: { select: { quantity: true } },
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
        productId: p.id,
        variantId: v.id,
        name: multiVariant ? `${p.name} — ${v.name}` : p.name,
        category: p.category.name,
        categorySlug: p.category.slug,
        price: Math.round(v.priceCentavos) / 100,
        unit: unitFor(v.name),
        stock,
        status: statusFor(stock),
      });
    }
  }
  return rows;
}

/**
 * Distinct categories that have at least one active product, for the filter row.
 */
export async function getStorefrontCategories(): Promise<StorefrontCategory[]> {
  const cats = await prisma.category.findMany({
    where: { products: { some: { active: true } } },
    orderBy: { name: "asc" },
    select: { name: true, slug: true },
  });
  return cats;
}

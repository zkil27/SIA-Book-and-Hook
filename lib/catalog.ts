import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { CATALOG, dishesForName, imageForName, type Dish } from "@/lib/catalog-data";
import { categoriesOf, staticCatalogProducts } from "@/lib/catalog-fixture";
import { stockByVariant } from "@/lib/stock-sql";
import { startOfShopDay } from "@/lib/time";

/**
 * Storefront catalog reads. Stock comes from the StockMovement ledger,
 * summed in SQL. When the database is unreachable (e.g. a paused Supabase
 * project) the storefront falls back to the static catalog so the site still
 * renders; ordering is disabled in that mode (`offline: true`).
 */

export type ShopVariant = {
  id: string;
  name: string;
  sku: string;
  price: number; // centavos
  stock: number;
  priceChangedToday: boolean;
};

export type ShopProduct = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  category: { name: string; slug: string };
  dishes: Dish[];
  variants: ShopVariant[];
};

export type ShopCategory = { name: string; slug: string; count: number };

export type ShopCatalog = {
  products: ShopProduct[];
  categories: ShopCategory[];
  offline: boolean;
};

function fallbackCatalog(): ShopCatalog {
  const products = staticCatalogProducts();
  return { products, categories: categoriesOf(products), offline: true };
}

const shopProductSelect = {
  id: true,
  name: true,
  description: true,
  imageUrl: true,
  category: { select: { name: true, slug: true } },
  variants: {
    where: { active: true },
    orderBy: { priceCentavos: "desc" as const },
    select: { id: true, name: true, sku: true, priceCentavos: true, priceUpdatedAt: true },
  },
} satisfies Prisma.ProductSelect;

type ShopRow = Prisma.ProductGetPayload<{ select: typeof shopProductSelect }>;

function shapeShopProduct(p: ShopRow, stock: Map<string, number>, today: Date): ShopProduct {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    image: p.imageUrl ?? imageForName(p.name),
    category: p.category,
    dishes: dishesForName(p.name),
    variants: p.variants.map(v => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.priceCentavos,
      stock: stock.get(v.id) ?? 0,
      priceChangedToday: !!v.priceUpdatedAt && v.priceUpdatedAt >= today,
    })),
  };
}

const sellableWhere = { active: true, variants: { some: { active: true } } } satisfies Prisma.ProductWhereInput;

/**
 * Database read of the sellable catalog. Throws when the database is down.
 * Uncached: the dev timing probes call this directly.
 */
export async function loadCatalogFromDb(): Promise<ShopProduct[]> {
  const [rows, sums] = await Promise.all([
    prisma.product.findMany({
      where: sellableWhere,
      select: shopProductSelect,
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    }),
    // Only movements of sellable variants, not the whole ledger.
    prisma.stockMovement.groupBy({
      by: ["variantId"],
      where: { variant: { active: true, product: { active: true } } },
      _sum: { quantity: true },
    }),
  ]);
  const stock = new Map(sums.map(s => [s.variantId, s._sum.quantity ?? 0]));
  const today = startOfShopDay();
  const products = rows.map(p => shapeShopProduct(p, stock, today));

  // Category order follows the catalog definition (Fish first), then name.
  const rank = new Map(CATALOG.map((c, i) => [c.slug, i]));
  products.sort((a, b) => (rank.get(a.category.slug) ?? 99) - (rank.get(b.category.slug) ?? 99));
  return products;
}

function warnOffline(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.warn(`[catalog] Database unavailable (${message.slice(0, 100)}). Using offline catalog.`);
}

/** Per-request cached: the layout (price crawl) and the page share one read. */
export const getShopCatalog = cache(async (): Promise<ShopCatalog> => {
  await connection(); // live stock: always render at request time
  try {
    const products = await loadCatalogFromDb();
    return { products, categories: categoriesOf(products), offline: false };
  } catch (err) {
    warnOffline(err);
    return fallbackCatalog();
  }
});

/** One sellable product (product page): a single-product query, not the whole catalog. */
export const getShopProduct = cache(
  async (id: string): Promise<{ product: ShopProduct | null; offline: boolean }> => {
    await connection();
    try {
      const row = await prisma.product.findFirst({ where: { id, ...sellableWhere }, select: shopProductSelect });
      if (!row) return { product: null, offline: false };
      const stock = await stockByVariant(
        prisma,
        row.variants.map(v => v.id)
      );
      return { product: shapeShopProduct(row, stock, startOfShopDay()), offline: false };
    } catch (err) {
      warnOffline(err);
      return { product: fallbackCatalog().products.find(p => p.id === id) ?? null, offline: true };
    }
  }
);

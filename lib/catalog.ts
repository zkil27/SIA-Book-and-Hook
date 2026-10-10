import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import prisma from "@/lib/prisma";
import { CATALOG, dishesForName, imageForName, type Dish } from "@/lib/catalog-data";
import { startOfShopDay } from "@/lib/time";

/**
 * Storefront catalog reads. Stock comes from the StockMovement ledger.
 * When the database is unreachable (e.g. a paused Supabase project) the
 * storefront falls back to the static catalog so the site still renders;
 * ordering is disabled in that mode (`offline: true`).
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

function categoriesOf(products: ShopProduct[]): ShopCategory[] {
  const map = new Map<string, ShopCategory>();
  for (const p of products) {
    const c = map.get(p.category.slug) ?? { ...p.category, count: 0 };
    c.count++;
    map.set(p.category.slug, c);
  }
  return [...map.values()];
}

function fallbackCatalog(): ShopCatalog {
  const products: ShopProduct[] = CATALOG.flatMap(cat =>
    cat.products.map(p => ({
      id: `offline-${p.variants[0].sku}`,
      name: p.name,
      description: p.description,
      image: p.image,
      category: { name: cat.name, slug: cat.slug },
      dishes: p.dishes,
      variants: p.variants.map(v => ({
        id: `offline-${v.sku}`,
        name: v.name,
        sku: v.sku,
        price: v.price * 100,
        stock: v.opening,
        priceChangedToday: false,
      })),
    }))
  );
  return { products, categories: categoriesOf(products), offline: true };
}

/** Per-request cached: the layout (price crawl) and the page share one read. */
export const getShopCatalog = cache(async (): Promise<ShopCatalog> => {
  await connection(); // live stock: always render at request time
  try {
    const [rows, sums] = await Promise.all([
      prisma.product.findMany({
        where: { active: true, variants: { some: { active: true } } },
        include: {
          category: true,
          variants: { where: { active: true }, orderBy: { priceCentavos: "desc" } },
        },
        orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
      }),
      prisma.stockMovement.groupBy({ by: ["variantId"], _sum: { quantity: true } }),
    ]);
    const stockOf = new Map(sums.map(s => [s.variantId, s._sum.quantity ?? 0]));
    const today = startOfShopDay();

    const products: ShopProduct[] = rows.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      image: p.imageUrl ?? imageForName(p.name),
      category: { name: p.category.name, slug: p.category.slug },
      dishes: dishesForName(p.name),
      variants: p.variants.map(v => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: v.priceCentavos,
        stock: stockOf.get(v.id) ?? 0,
        priceChangedToday: !!v.priceUpdatedAt && v.priceUpdatedAt >= today,
      })),
    }));

    // Category order follows the catalog definition (Fish first), then name.
    const order = CATALOG.map(c => c.slug);
    products.sort((a, b) => {
      const ai = order.indexOf(a.category.slug);
      const bi = order.indexOf(b.category.slug);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    return { products, categories: categoriesOf(products), offline: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[catalog] Database unavailable (${message.slice(0, 100)}). Using offline catalog.`);
    return fallbackCatalog();
  }
});

export async function getShopProduct(id: string): Promise<{ product: ShopProduct | null; offline: boolean }> {
  const catalog = await getShopCatalog();
  return { product: catalog.products.find(p => p.id === id) ?? null, offline: catalog.offline };
}

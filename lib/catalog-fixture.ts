import { CATALOG } from "@/lib/catalog-data";
import type { ShopCategory, ShopProduct } from "@/lib/catalog";

/**
 * The static catalog (lib/catalog-data.ts) shaped as storefront products.
 * Used by the offline fallback and by the dev UI gallery, so it stays
 * client-safe (no database, no `server-only`). Stock is each variant's
 * opening count; ids are prefixed `offline-` so they never match real rows.
 */
export function staticCatalogProducts(): ShopProduct[] {
  return CATALOG.flatMap(cat =>
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
        price: v.price * 100, // catalog-data prices are whole pesos
        stock: v.opening,
        priceChangedToday: false,
      })),
    }))
  );
}

export function categoriesOf(products: ShopProduct[]): ShopCategory[] {
  const map = new Map<string, ShopCategory>();
  for (const p of products) {
    const c = map.get(p.category.slug) ?? { ...p.category, count: 0 };
    c.count++;
    map.set(p.category.slug, c);
  }
  return [...map.values()];
}

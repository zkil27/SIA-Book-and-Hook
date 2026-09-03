import StoreApp from "./StoreApp";
import { getStorefrontProducts, getStorefrontCategories } from "@/lib/products";

// Product stock is derived from the live ledger, so render per request rather
// than statically prerendering stale data.
export const dynamic = "force-dynamic";

export default async function Page() {
  const [products, categories] = await Promise.all([
    getStorefrontProducts(),
    getStorefrontCategories(),
  ]);

  return <StoreApp products={products} categories={categories} />;
}

import { loadInventory } from "@/lib/admin-data";
import { PageHeader } from "@/components/admin/kit";
import { ProductsTable } from "@/components/admin/ProductsTable";

export const metadata = { title: "Products" };

const FILTERS = ["all", "low", "out", "tosale", "archived"] as const;

export default async function ProductsPage(props: PageProps<"/admin/products">) {
  const sp = await props.searchParams;
  const s = FILTERS.find(f => f === sp.s) ?? "all";
  const products = await loadInventory();
  return (
    <>
      <PageHeader title="Products" sub="Prices and stock live on each variant. Archived products stay on past orders." />
      <ProductsTable products={products} initialFilter={s} />
    </>
  );
}

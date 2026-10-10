import { loadInventory, sellable } from "@/lib/admin-data";
import { PageHeader } from "@/components/admin/kit";
import { PricesBoard } from "@/components/admin/PricesBoard";

export const metadata = { title: "Today's prices" };

export default async function PricesPage() {
  const rows = sellable(await loadInventory()).map(v => ({
    id: v.id,
    name: v.name,
    product: v.product.name,
    image: v.product.image,
    category: { name: v.product.category.name, slug: v.product.category.slug },
    price: v.price,
    changedToday: v.priceChangedToday,
  }));
  return (
    <>
      <PageHeader
        title="Today's prices"
        sub="Set this morning's market prices in one pass. Changed prices flash on the storefront's price crawl."
      />
      <PricesBoard rows={rows} />
    </>
  );
}

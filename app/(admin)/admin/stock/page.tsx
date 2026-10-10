import { loadInventory, sellable } from "@/lib/admin-data";
import { PageHeader } from "@/components/admin/kit";
import { StockDesk, type DeskVariant } from "@/components/admin/StockDesk";

export const metadata = { title: "Stock" };

export default async function StockPage(props: PageProps<"/admin/stock">) {
  const sp = await props.searchParams;
  const mode = sp.mode === "walkin" || sp.mode === "count" ? sp.mode : "adjust";
  const v = typeof sp.v === "string" ? sp.v : null;
  const reason = typeof sp.reason === "string" ? sp.reason : null;

  const variants: DeskVariant[] = sellable(await loadInventory()).map(x => ({
    id: x.id,
    name: x.name,
    sku: x.sku,
    price: x.price,
    stock: x.stock,
    oldestDays: x.oldestDays,
    product: { id: x.product.id, name: x.product.name, image: x.product.image, category: x.product.category },
  }));

  return (
    <>
      <PageHeader title="Stock" sub="Every change here is a new ledger entry with a reason. Nothing is overwritten." />
      <StockDesk key={`${mode}-${v ?? ""}`} variants={variants} mode={mode} variantId={v} reason={reason} />
    </>
  );
}

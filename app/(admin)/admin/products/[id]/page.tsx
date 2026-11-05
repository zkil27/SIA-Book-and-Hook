import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { loadProduct } from "@/lib/admin-data";
import { PRODUCT_IMAGES } from "@/lib/catalog-data";
import { PageHeader } from "@/components/admin/kit";
import { ProductEditor } from "@/components/admin/ProductEditor";

export const metadata = { title: "Edit product" };

export default async function EditProductPage(props: PageProps<"/admin/products/[id]">) {
  const { id } = await props.params;
  const [p, categories] = await Promise.all([
    loadProduct(id),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } }),
  ]);
  if (!p) notFound();

  return (
    <>
      <PageHeader title={p.name} sub={p.active ? "On the storefront" : "Archived: hidden from the storefront"} />
      <ProductEditor
        product={{
          id: p.id,
          name: p.name,
          description: p.description ?? "",
          imageUrl: p.image ?? "",
          categoryId: p.category.id,
          variants: p.variants.map(v => ({ id: v.id, name: v.name, sku: v.sku, price: v.price, active: v.active, stock: v.stock })),
        }}
        categories={categories}
        images={PRODUCT_IMAGES}
      />
    </>
  );
}

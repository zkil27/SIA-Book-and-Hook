import prisma from "@/lib/prisma";
import { PRODUCT_IMAGES } from "@/lib/catalog-data";
import { PageHeader } from "@/components/admin/kit";
import { ProductEditor } from "@/components/admin/ProductEditor";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } });
  return (
    <>
      <PageHeader title="New product" />
      <ProductEditor product={null} categories={categories} images={PRODUCT_IMAGES} />
    </>
  );
}

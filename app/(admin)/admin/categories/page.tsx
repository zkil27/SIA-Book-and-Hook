import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/admin/kit";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: { where: { active: true } } } } },
  });
  return (
    <>
      <PageHeader title="Categories" sub="Each category keeps one colour everywhere, from storefront tags to admin tables." />
      <CategoriesManager categories={rows.map(c => ({ id: c.id, name: c.name, slug: c.slug, products: c._count.products }))} />
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getShopProduct } from "@/lib/catalog";
import { ProductBuy } from "@/components/shop/ProductBuy";

export async function generateMetadata(props: PageProps<"/p/[id]">) {
  const { id } = await props.params;
  const { product } = await getShopProduct(id);
  return { title: product?.name ?? "Not found" };
}

export default async function ProductPage(props: PageProps<"/p/[id]">) {
  const { id } = await props.params;
  const { product, offline } = await getShopProduct(id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-sm text-ink-3">
        <Link href="/#catch" className="hover:text-ink hover:underline">
          Today&apos;s catch
        </Link>
        <ChevronRight className="size-4" aria-hidden />
        <Link href={`/?c=${product.category.slug}#catch`} className="hover:text-ink hover:underline">
          {product.category.name}
        </Link>
      </nav>
      <ProductBuy product={product} offline={offline} />
    </div>
  );
}

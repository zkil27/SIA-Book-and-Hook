import { ShopPageSkeleton } from "@/components/shop/ShopSkeleton";

/**
 * Instant feedback on storefront navigation. A loading boundary also lets
 * Next prefetch these dynamic routes (it skips dynamic routes without one).
 */
export default function ShopLoading() {
  return <ShopPageSkeleton />;
}

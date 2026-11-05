import { AdminPageSkeleton } from "@/components/admin/skeletons";

/**
 * Instant feedback for admin navigation. A loading boundary also lets Next
 * prefetch these dynamic routes (it skips dynamic routes without one).
 */
export default function AdminLoading() {
  return <AdminPageSkeleton />;
}

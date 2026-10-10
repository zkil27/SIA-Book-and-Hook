import type { Metadata } from "next";
import { getShopCatalog } from "@/lib/catalog";
import { requireUser } from "@/lib/session";
import { CheckoutFlow } from "@/components/shop/CheckoutFlow";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const { offline } = await getShopCatalog();
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
      <h1 className="sign mb-8 text-[clamp(44px,6vw,72px)] text-ink">Checkout</h1>
      <CheckoutFlow defaultName={user.name ?? ""} offline={offline} />
    </div>
  );
}

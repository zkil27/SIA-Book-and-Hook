import type { Metadata } from "next";
import { getDeliveryProfile } from "@/lib/account";
import { slotAvailability } from "@/lib/orders";
import { requireUser } from "@/lib/session";
import { CheckoutFlow } from "@/components/shop/CheckoutFlow";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  // Both reads report an outage themselves, so the page needs no catalog read
  // just to learn whether the database is up.
  const [profile, availability] = await Promise.all([getDeliveryProfile(user.id), slotAvailability()]);
  const offline = profile === "offline" || availability === null;
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
      <h1 className="sign mb-8 text-[clamp(44px,6vw,72px)] text-ink">Checkout</h1>
      <CheckoutFlow
        defaultName={user.name ?? ""}
        saved={profile === "offline" ? null : profile}
        offline={offline}
        availability={availability}
      />
    </div>
  );
}

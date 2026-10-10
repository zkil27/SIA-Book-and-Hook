import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { CloudOff } from "lucide-react";
import { getShopCatalog } from "@/lib/catalog";
import { getUser } from "@/lib/session";
import { splitName, unitFor } from "@/lib/meta";
import { Logo } from "@/components/brand/Logo";
import { BasketProvider } from "@/components/shop/basket";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { TarpCrawl } from "@/components/shop/TarpCrawl";
import { ToastProvider } from "@/components/ui/toast";

export default async function ShopLayout({ children }: { children: ReactNode }) {
  const [catalog, user] = await Promise.all([getShopCatalog(), getUser()]);

  const crawl = catalog.products
    .filter(p => p.variants.some(v => v.stock > 0))
    .map(p => {
      const v = p.variants.find(x => x.stock > 0) ?? p.variants[0];
      return {
        id: p.id,
        label: splitName(p.name).local,
        price: v.price,
        unit: unitFor(v.name),
        changed: p.variants.some(x => x.priceChangedToday),
      };
    })
    // Fresh price changes lead the crawl.
    .sort((a, b) => Number(b.changed) - Number(a.changed));

  return (
    <ToastProvider>
      <BasketProvider>
        <TarpCrawl entries={crawl} />
        <Suspense fallback={<div className="h-16 border-b border-ice-3" />}>
          <ShopHeader user={user ? { name: user.name, role: user.role } : null} />
        </Suspense>
        {catalog.offline && (
          <div className="border-b border-tarp-deep/40 bg-tarp-soft">
            <p className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5 text-sm text-[#5c4300] sm:px-6">
              <CloudOff className="size-4 shrink-0" aria-hidden />
              Our stock system is offline for a moment. You can browse today&apos;s catch, but ordering is paused.
            </p>
          </div>
        )}
        <main id="main">{children}</main>
        <ShopFooter />
      </BasketProvider>
    </ToastProvider>
  );
}

function ShopFooter() {
  return (
    <footer className="mt-24 border-t border-ice-3 bg-ice-2">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo size="md" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-2">
            Fresh seafood from the Cavite fish port, cleaned free and delivered on crushed ice across Dasmariñas City.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-bold text-ink">Store hours</p>
          <p className="mt-2 text-ink-2">Monday to Saturday</p>
          <p className="text-ink-2">6:00 AM – 6:00 PM</p>
          <p className="mt-4 font-bold text-ink">Delivery</p>
          <p className="mt-2 text-ink-2">Dasmariñas City, Cavite · free over ₱500</p>
        </div>
        <nav className="text-sm" aria-label="Footer">
          <p className="font-bold text-ink">Shop</p>
          <ul className="mt-2 flex flex-col gap-1.5 text-ink-2">
            <li><Link href="/" className="hover:text-ink hover:underline">Today&apos;s catch</Link></li>
            <li><Link href="/track" className="hover:text-ink hover:underline">Track an order</Link></li>
            <li><Link href="/account" className="hover:text-ink hover:underline">My orders</Link></li>
            <li><Link href="/about" className="hover:text-ink hover:underline">About &amp; contact</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-ice-3">
        <p className="mx-auto max-w-7xl px-4 py-4 text-[13px] text-ink-3 sm:px-6">
          Academic capstone project (SIA). Hook &amp; Box is a fictional store: no real orders, payments or deliveries.
          Photos from Unsplash, credited in the project docs.
        </p>
      </div>
    </footer>
  );
}

import type { ReactNode } from "react";
import type { ShopProduct } from "@/lib/catalog";
import { staticCatalogProducts } from "@/lib/catalog-fixture";
import { LOW_STOCK_AT, STATUS_FLOW, TO_SALE_AFTER_DAYS, type OrderStatusKey } from "@/lib/meta";
import { AgeBadge, DbOffline, PageHeader, Panel, StockCount } from "@/components/admin/kit";
import { AdminPageSkeleton } from "@/components/admin/skeletons";
import { EmptyBasketPreview, MotionNote, ToastTriggers } from "@/components/dev/GalleryInteractive";
import { BasketProvider } from "@/components/shop/basket";
import { OfflineBanner } from "@/components/shop/OfflineBanner";
import { OrderTracker } from "@/components/shop/OrderTracker";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopPageSkeleton } from "@/components/shop/ShopSkeleton";
import { TarpCrawl } from "@/components/shop/TarpCrawl";
import { PriceTag } from "@/components/ui/PriceTag";
import { Stamp } from "@/components/ui/motion";
import { Button, Chip, StatusChip } from "@/components/ui/primitives";

export const metadata = { title: "UI gallery" };

/**
 * Every important visual state, rendered with the real components and the
 * static catalog (lib/catalog-data.ts) as fixture data. Nothing here reads
 * or writes the database.
 */

function fixtures() {
  const all = staticCatalogProducts();
  const byName = (n: string) => all.find(p => p.name.startsWith(n)) ?? all[0];
  // Unique ids per card: ProductCard names its view transition after the id.
  const cardOf = (p: ShopProduct, tag: string, patch: (p: ShopProduct) => ShopProduct = x => x): ShopProduct =>
    patch({ ...p, id: `${p.id}-${tag}`, variants: p.variants.map(v => ({ ...v, id: `${v.id}-${tag}` })) });

  const multi = all.find(p => p.variants.length > 1) ?? all[0];
  return [
    { label: "In stock", product: cardOf(byName("Bangus"), "in", p => ({ ...p, variants: p.variants.map(v => ({ ...v, stock: 40 })) })), offline: false },
    { label: `Low (≤ ${LOW_STOCK_AT} left)`, product: cardOf(byName("Tahong"), "low"), offline: false },
    {
      label: "One size sold out",
      product: cardOf(multi, "partial", p => ({ ...p, variants: p.variants.map((v, i) => ({ ...v, stock: i === 0 ? 0 : 25 })) })),
      offline: false,
    },
    { label: "All sold out", product: cardOf(byName("Talaba"), "out"), offline: false },
    { label: "Ordering paused (offline)", product: cardOf(byName("Tilapia"), "offline"), offline: true },
  ];
}

const ALL_STATUSES: OrderStatusKey[] = [...STATUS_FLOW, "CANCELLED"];

function timelineFor(status: OrderStatusKey) {
  const base = Date.now() - 6 * 60 * 60 * 1000;
  const steps = status === "CANCELLED" ? (["PENDING", "CONFIRMED"] as OrderStatusKey[]) : STATUS_FLOW.slice(0, STATUS_FLOW.indexOf(status) + 1);
  const events: { to: OrderStatusKey; at: string; note: string | null }[] = steps.map((to, i) => ({
    to,
    at: new Date(base + i * 45 * 60 * 1000).toISOString(),
    note: null,
  }));
  if (status === "CANCELLED") {
    events.push({ to: "CANCELLED", at: new Date(base + 2 * 45 * 60 * 1000).toISOString(), note: "Need to change delivery slot" });
  }
  return events;
}

export default function DevGalleryPage() {
  const cards = fixtures();
  return (
    <>
      <PageHeader
        title="UI gallery"
        sub="Real components with fixture data, in every state that matters. Nothing on this page touches the database."
      />
      <div className="mb-6">
        <MotionNote />
      </div>

      <div className="flex flex-col gap-6">
        <Panel title="Product cards">
          {/* In-memory basket: adding here never touches the real saved basket. */}
          <BasketProvider persist={false}>
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 min-[440px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {cards.map(c => (
                <div key={c.label}>
                  <Label>{c.label}</Label>
                  <ProductCard product={c.product} offline={c.offline} />
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-ice-3 pt-5">
              <Label>Basket sheet, empty</Label>
              <EmptyBasketPreview />
            </div>
          </BasketProvider>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Price tags">
            <div className="flex flex-wrap items-end gap-8 pb-4 pl-2 pt-2">
              <PriceTag name="Bangus" price={18000} unit="kg" size="sm" />
              <PriceTag name="Hipon" price={18550} unit="500g" size="md" tilt={2} />
              <PriceTag name="Alimango" price={68000} unit="kg" size="lg" tilt={-4} />
              <PriceTag name="Talaba" price={20000} unit="doz" size="md" soldOut />
            </div>
          </Panel>

          <Panel title="Stock and age">
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              {[0, 4, LOW_STOCK_AT, LOW_STOCK_AT + 1, 42].map(n => (
                <div key={n} className="flex items-center justify-between rounded-lg bg-ice px-3 py-2">
                  <span className="text-ink-3">stock {n}</span>
                  <StockCount stock={n} />
                </div>
              ))}
              {[1, TO_SALE_AFTER_DAYS - 1, TO_SALE_AFTER_DAYS, 12].map(d => (
                <div key={`age-${d}`} className="flex items-center justify-between rounded-lg bg-ice px-3 py-2">
                  <span className="text-ink-3">{d} days</span>
                  <AgeBadge days={d} />
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Order statuses">
          <div className="flex flex-wrap gap-2">
            {ALL_STATUSES.map(s => (
              <StatusChip key={s} status={s} />
            ))}
          </div>
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            {ALL_STATUSES.map(s => (
              <div key={s}>
                <Label>{s === "CANCELLED" ? "Cancelled, with the customer's reason" : `Tracker at ${s.toLowerCase()}`}</Label>
                <OrderTracker status={s} events={timelineFor(s)} />
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Buttons">
            <div className="flex flex-wrap gap-2">
              {(["primary", "tarp", "marker", "ink", "outline", "ghost", "danger"] as const).map(v => (
                <Button key={v} variant={v}>
                  {v}
                </Button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button>Medium</Button>
              <Button size="lg">Large</Button>
              <Button loading>Saving</Button>
              <Button disabled>Disabled</Button>
            </div>
          </Panel>

          <Panel title="Chips and stamps">
            <div className="flex flex-wrap gap-2">
              {(["yellow", "teal", "violet", "green", "gray", "red"] as const).map(t => (
                <Chip key={t} tone={t}>
                  {t}
                </Chip>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-6">
              {(["marker", "teal", "leaf", "ink"] as const).map((t, i) => (
                <Stamp key={t} tone={t} rotate={-8 + i * 4} className="text-[22px]">
                  {t === "leaf" ? "All clear" : t === "marker" ? "Sold out" : t === "teal" ? "Confirmed" : "Paid"}
                </Stamp>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Toasts">
          <ToastTriggers />
        </Panel>

        <Panel title="Storefront banners" pad={false}>
          <TarpCrawl
            entries={[
              { id: "g1", label: "Bangus", price: 18000, unit: "kg", changed: true },
              { id: "g2", label: "Hipon", price: 18500, unit: "500g", changed: false },
              { id: "g3", label: "Pusit", price: 32000, unit: "kg", changed: true },
              { id: "g4", label: "Tilapia", price: 15000, unit: "kg", changed: false },
            ]}
          />
          <OfflineBanner />
        </Panel>

        <Panel title="Offline and loading">
          <Label>Admin page when the database is down</Label>
          <DbOffline />
          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <Frame label="Admin loading skeleton">
              <AdminPageSkeleton />
            </Frame>
            <Frame label="Storefront loading skeleton">
              <ShopPageSkeleton />
            </Frame>
          </div>
        </Panel>
      </div>
    </>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-ink-3">{children}</p>;
}

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="max-h-[420px] overflow-hidden rounded-lg bg-ice p-4 ring-1 ring-inset ring-ice-3">{children}</div>
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, KeyRound, PackagePlus, ScrollText } from "lucide-react";
import { getDashboard } from "@/lib/admin-data";
import { splitName, STATUS_META, type OrderStatusKey } from "@/lib/meta";
import { peso } from "@/lib/money";
import { ago, fmtLongDate, shopIsOpen } from "@/lib/time";
import { AgeBadge, PageHeader, Panel, StockCount, Thumb } from "@/components/admin/kit";
import { ConfirmButton, ReleaseStaleButton, SalesBars, TopSellers } from "@/components/admin/TodayParts";
import { ButtonLink, Chip } from "@/components/ui/primitives";
import { Stamp } from "@/components/ui/motion";

export const metadata = { title: "Today" };

export default async function TodayPage() {
  const d = await getDashboard();
  const alerts = d.outOfStock.length + d.lowStock.length;
  const nothingToDo =
    d.pendingCount === 0 &&
    alerts === 0 &&
    d.toSale.length === 0 &&
    d.noPinDeliveries.length === 0;

  const stats: { k: string; v: string; href: string; hot?: boolean; sub?: ReactNode }[] = [
    { k: "Orders today", v: String(d.todayCount), href: "/admin/orders" },
    {
      k: "Sales today",
      v: peso(d.todayRevenue),
      href: "/admin/orders",
      sub:
        d.onHoldRevenue > 0 || d.onDeliveryRevenue > 0 ? (
          <span className="mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[12px] font-medium text-ink-3">
            {d.onHoldRevenue > 0 && <span className="tabular text-[#6b4e00]">{peso(d.onHoldRevenue)} on hold</span>}
            {d.onDeliveryRevenue > 0 && <span className="tabular text-teal-deep">{peso(d.onDeliveryRevenue)} on delivery</span>}
          </span>
        ) : (
          <span className="mt-1 block text-[12px] font-medium text-ink-3">Collected</span>
        ),
    },
    { k: "Waiting to confirm", v: String(d.pendingCount), href: "/admin/orders?status=PENDING", hot: d.pendingCount > 0 },
    { k: "Stock alerts", v: String(alerts), href: "/admin/stock", hot: alerts > 0 },
  ];

  return (
    <>
      <PageHeader
        title="Today"
        sub={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {fmtLongDate(new Date())}
            <span className="flex items-center gap-1.5 text-ink-3">
              <span className={`size-2 rounded-full ${shopIsOpen() ? "bg-leaf" : "bg-ink-3"}`} aria-hidden />
              {shopIsOpen() ? "Store open until 6 PM" : "Store closed"}
            </span>
          </span>
        }
        actions={
          <>
            <ButtonLink href="/admin/stock?mode=walkin" variant="tarp">
              Walk-in sale
            </ButtonLink>
            <ButtonLink href="/admin/stock?mode=count" variant="outline">
              Morning count
            </ButtonLink>
          </>
        }
      />

      {/* Stat strip */}
      <dl className="grid grid-cols-2 overflow-hidden rounded-[var(--radius-card)] bg-paper ring-1 ring-inset ring-ice-3 md:grid-cols-4">
        {stats.map((s, i) => (
          <Link
            key={s.k}
            href={s.href}
            className={`group px-5 py-4 transition-colors hover:bg-ice ${i % 2 ? "border-l border-ice-3" : ""} ${i >= 2 ? "border-t border-ice-3 md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}
          >
            <dt className="text-[13px] font-semibold text-ink-3">{s.k}</dt>
            <dd className={`tabular mt-1 text-[26px] font-bold ${s.hot ? "text-marker-deep" : "text-ink"}`}>{s.v}</dd>
            {s.sub}
          </Link>
        ))}
      </dl>

      <OrderFlow pipeline={d.pipeline} packedNoTrip={d.packedNoTrip} />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        {/* Inbox */}
        <Panel title="Needs you now" pad={false}>
          {nothingToDo ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <Stamp tone="leaf" rotate={-6} className="text-[30px]">
                All clear
              </Stamp>
              <p className="mt-4 text-sm text-ink-3">No orders waiting and nothing running low.</p>
            </div>
          ) : (
            <div className="divide-y divide-ice-3">
              {d.pendingOrders.length > 0 && (
                <InboxGroup label={`${d.pendingCount} order${d.pendingCount === 1 ? "" : "s"} to confirm`} href="/admin/orders?status=PENDING">
                  {d.staleGcashIds.length > 0 && (
                    <li className="flex flex-wrap items-center justify-between gap-2 bg-marker-soft/60 px-5 py-2.5">
                      <span className="text-[13px] font-semibold text-marker-deep">
                        {d.staleGcashIds.length} GCash order{d.staleGcashIds.length === 1 ? " has" : "s have"} been on hold 2+ hours, holding stock
                      </span>
                      <ReleaseStaleButton ids={d.staleGcashIds} />
                    </li>
                  )}
                  {d.pendingOrders.map(o => (
                    <li key={o.id} className="flex items-center gap-3 px-5 py-3">
                      <Link href={`/admin/orders?open=${o.code}`} className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[13px] font-bold text-ink">{o.code}</span>
                          <span className="truncate font-semibold text-ink">{o.customer}</span>
                          <Chip tone={o.stale ? "red" : "yellow"}>
                            {o.stale ? "Stale · holding stock" : o.payment === "GCASH" ? "GCash · On hold" : "COD"}
                          </Chip>
                        </p>
                        <p className="text-[13px] text-ink-3">
                          {o.items} item{o.items === 1 ? "" : "s"} · {peso(o.total)} · {o.slot || "no slot"} · {ago(o.createdAt)}
                        </p>
                      </Link>
                      <ConfirmButton orderId={o.id} code={o.code} label={o.label} />
                    </li>
                  ))}
                </InboxGroup>
              )}
              {d.noPinDeliveries.length > 0 && (
                <InboxGroup label="Delivered without a customer PIN (last 3 days)" href="/admin/orders?status=COMPLETED">
                  {d.noPinDeliveries.map(e => (
                    <li key={e.id} className="flex items-center gap-3 px-5 py-3">
                      <KeyRound className="size-5 shrink-0 text-[#8a6100]" aria-hidden />
                      <Link href={`/admin/orders?open=${e.code}`} className="min-w-0 flex-1">
                        <p className="flex items-center gap-2">
                          <span className="font-mono text-[13px] font-bold text-ink">{e.code}</span>
                          <span className="truncate font-semibold text-ink">{e.customer}</span>
                        </p>
                        <p className="truncate text-[13px] text-ink-3">
                          {e.note} · {e.by} · {ago(e.at)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </InboxGroup>
              )}
              {d.outOfStock.length > 0 && (
                <InboxGroup label={`${d.outOfStock.length} sold out`} href="/admin/stock">
                  {d.outOfStock.map(v => (
                    <StockRow key={v.id} v={v} action="Restock" href={`/admin/stock?v=${v.id}&reason=Restock`} />
                  ))}
                </InboxGroup>
              )}
              {d.lowStock.length > 0 && (
                <InboxGroup label={`${d.lowStock.length} running low`} href="/admin/stock">
                  {d.lowStock.map(v => (
                    <StockRow key={v.id} v={v} action="Restock" href={`/admin/stock?v=${v.id}&reason=Restock`} />
                  ))}
                </InboxGroup>
              )}
              {d.toSale.length > 0 && (
                <InboxGroup label={`${d.toSale.length} to sell first (7+ days on hand)`} href="/admin/products?s=tosale">
                  {d.toSale.map(v => (
                    <StockRow key={v.id} v={v} action="Ledger" href={`/admin/ledger?v=${v.id}`} age />
                  ))}
                </InboxGroup>
              )}
            </div>
          )}
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="Sales, last 7 days">
            <SalesBars days={d.days.map(x => ({ start: x.start.toISOString(), revenue: x.revenue, orders: x.orders }))} />
          </Panel>
          <Panel title="Top sellers this week">
            <TopSellers rows={d.topSellers.map(r => ({ ...r, name: splitName(r.name).local }))} />
          </Panel>
        </div>
      </div>
    </>
  );
}

function InboxGroup({ label, href, children }: { label: string; href: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between bg-ice/60 px-5 py-2">
        <p className="text-[12px] font-bold uppercase tracking-wider text-ink-2">{label}</p>
        <Link href={href} className="inline-flex items-center gap-1 text-[13px] font-semibold text-teal-deep hover:underline">
          See all <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
      <ul className="divide-y divide-ice-2">{children}</ul>
    </div>
  );
}

function StockRow({
  v,
  action,
  href,
  age = false,
}: {
  v: { id: string; name: string; stock: number; oldestDays: number | null; product: { name: string; image: string | null } };
  action: string;
  href: string;
  age?: boolean;
}) {
  return (
    <li className="flex items-center gap-3 px-5 py-2.5">
      <Thumb src={v.product.image} size="size-9" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">
          {splitName(v.product.name).local} <span className="font-normal text-ink-3">{v.name}</span>
        </p>
        <div className="flex items-center gap-2 text-[13px]">
          <StockCount stock={v.stock} />
          {age && <AgeBadge days={v.oldestDays} />}
        </div>
      </div>
      <Link
        href={href}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold text-teal-deep ring-1 ring-inset ring-ice-3 hover:bg-mint-soft"
      >
        {action === "Restock" ? <PackagePlus className="size-4" aria-hidden /> : <ScrollText className="size-4" aria-hidden />}
        {action}
      </Link>
    </li>
  );
}

/**
 * Where every open order is right now, left to right, and who moves it on.
 * Each step links to the screen where that work happens, so the flow is on
 * the page instead of in someone's head.
 */
function OrderFlow({ pipeline, packedNoTrip }: { pipeline: Record<OrderStatusKey | "ALL", number>; packedNoTrip: number }) {
  const steps: { key: OrderStatusKey; who: string; href: string; hint: string }[] = [
    { key: "PENDING", who: "Office", href: "/admin/orders?status=PENDING", hint: "Verify GCash & confirm" },
    { key: "CONFIRMED", who: "Packer", href: "/staff/pack", hint: "Pack the bag" },
    {
      key: "PACKED",
      who: packedNoTrip > 0 ? "Office" : "Staff",
      href: "/admin/dispatch",
      hint: packedNoTrip > 0 ? `${packedNoTrip} need${packedNoTrip === 1 ? "s" : ""} a trip` : "Auto-tripped · load truck",
    },
    { key: "READY", who: "Driver", href: "/admin/orders?status=READY", hint: "Deliver with the PIN" },
  ];
  return (
    <nav aria-label="Order flow" className="mt-4">
      <ol className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {steps.map((s, i) => {
          const n = pipeline[s.key];
          const hot = n > 0 && (s.key !== "PACKED" || packedNoTrip > 0);
          return (
            <li key={s.key} className="relative">
              <Link
                href={s.href}
                className={`flex h-full flex-col rounded-[var(--radius-card)] px-4 py-3 ring-1 ring-inset transition-colors duration-150 ${
                  hot ? "bg-paper ring-teal/50 hover:bg-mint-soft" : "bg-paper/60 ring-ice-3 hover:bg-paper"
                }`}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-[14px] font-bold text-ink">{STATUS_META[s.key].label}</span>
                  <span className={`tabular text-[22px] font-bold leading-none ${hot ? "text-teal-deep" : "text-ink-3"}`}>{n}</span>
                </span>
                <span className="mt-1 text-[12px] text-ink-3">
                  {s.who} · {s.hint}
                </span>
              </Link>
              {i < steps.length - 1 && (
                <ArrowRight className="absolute -right-2 top-1/2 z-10 hidden size-4 -translate-y-1/2 rounded-full bg-ice text-ink-3 md:block" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

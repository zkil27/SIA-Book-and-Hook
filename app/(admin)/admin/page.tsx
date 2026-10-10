import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, PackagePlus, ScrollText } from "lucide-react";
import { getDashboard } from "@/lib/admin-data";
import { splitName } from "@/lib/meta";
import { peso } from "@/lib/money";
import { ago, fmtLongDate, shopIsOpen } from "@/lib/time";
import { AgeBadge, PageHeader, Panel, StockCount, Thumb } from "@/components/admin/kit";
import { ConfirmButton, SalesBars, TopSellers } from "@/components/admin/TodayParts";
import { ButtonLink } from "@/components/ui/primitives";
import { Stamp } from "@/components/ui/motion";

export const metadata = { title: "Today" };

export default async function TodayPage() {
  const d = await getDashboard();
  const alerts = d.outOfStock.length + d.lowStock.length;
  const nothingToDo = d.pendingOrders.length === 0 && alerts === 0 && d.toSale.length === 0;

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
        {[
          { k: "Orders today", v: String(d.todayCount), href: "/admin/orders" },
          { k: "Sales today", v: peso(d.todayRevenue), href: "/admin/orders" },
          { k: "Waiting to confirm", v: String(d.pendingOrders.length), href: "/admin/orders?status=PENDING", hot: d.pendingOrders.length > 0 },
          { k: "Stock alerts", v: String(alerts), href: "/admin/stock", hot: alerts > 0 },
        ].map((s, i) => (
          <Link
            key={s.k}
            href={s.href}
            className={`group px-5 py-4 transition-colors hover:bg-ice ${i % 2 ? "border-l border-ice-3" : ""} ${i >= 2 ? "border-t border-ice-3 md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}
          >
            <dt className="text-[13px] font-semibold text-ink-3">{s.k}</dt>
            <dd className={`tabular mt-1 text-[26px] font-bold ${s.hot ? "text-marker-deep" : "text-ink"}`}>{s.v}</dd>
          </Link>
        ))}
      </dl>

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
                <InboxGroup label={`${d.pendingOrders.length} order${d.pendingOrders.length === 1 ? "" : "s"} to confirm`} href="/admin/orders?status=PENDING">
                  {d.pendingOrders.map(o => (
                    <li key={o.id} className="flex items-center gap-3 px-5 py-3">
                      <Link href={`/admin/orders?open=${o.code}`} className="min-w-0 flex-1">
                        <p className="flex items-center gap-2">
                          <span className="font-mono text-[13px] font-bold text-ink">{o.code}</span>
                          <span className="truncate font-semibold text-ink">{o.customer}</span>
                        </p>
                        <p className="text-[13px] text-ink-3">
                          {o.items} item{o.items === 1 ? "" : "s"} · {peso(o.total)} · {o.slot || "no slot"} · {ago(o.createdAt)}
                        </p>
                      </Link>
                      <ConfirmButton orderId={o.id} code={o.code} />
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

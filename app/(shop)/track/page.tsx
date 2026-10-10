import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { findOrderByNumber } from "@/lib/orders";
import { orderCode, parseOrderCode, PAYMENT_LABEL, splitName } from "@/lib/meta";
import { peso } from "@/lib/money";
import { fmtDateTime } from "@/lib/time";
import { OrderTracker } from "@/components/shop/OrderTracker";
import { Button, StatusChip } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Track an order" };

export default async function TrackPage(props: PageProps<"/track">) {
  const sp = await props.searchParams;
  const raw = typeof sp.code === "string" ? sp.code : "";
  const n = raw ? parseOrderCode(raw) : null;
  const result = n ? await findOrderByNumber(n) : undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-12">
      <h1 className="sign text-[clamp(44px,6vw,72px)] text-ink">Track an order</h1>
      <p className="mt-2 text-ink-2">Enter the code from your receipt, like HB-0003.</p>

      <form action="/track" className="mt-6 flex max-w-lg gap-2" role="search">
        <label htmlFor="code" className="sr-only">
          Order code
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <input
            id="code"
            name="code"
            defaultValue={raw}
            placeholder="HB-0003"
            autoCapitalize="characters"
            className="h-12 w-full rounded-xl bg-paper pl-10 pr-3 font-mono text-[17px] uppercase tracking-wide text-ink ring-1 ring-inset ring-ice-3 outline-none focus:ring-2 focus:ring-teal-deep"
          />
        </div>
        <Button type="submit" size="lg">
          Track
        </Button>
      </form>

      <div className="mt-10">
        {raw && !n && <Notice>That doesn&apos;t look like an order code. Codes look like HB-0003.</Notice>}
        {result === "offline" && <Notice>Our order system is offline for a moment. Try again in a minute.</Notice>}
        {result === null && n && (
          <Notice>
            We couldn&apos;t find order <strong>{orderCode(n)}</strong>. Check the code on your receipt, or see{" "}
            <Link href="/account" className="font-semibold text-teal-deep underline">
              your orders
            </Link>
            .
          </Notice>
        )}
        {result && result !== "offline" && (
          <div className="rounded-[var(--radius-card)] bg-paper p-5 ring-1 ring-inset ring-ice-3 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[13px] text-ink-3">Order</p>
                <p className="font-marker text-[38px] leading-tight text-marker-deep">{result.code}</p>
                <p className="text-sm text-ink-3">Placed {fmtDateTime(result.createdAt)}</p>
              </div>
              <StatusChip status={result.status} />
            </div>
            <div className="mt-8">
              <OrderTracker
                status={result.status}
                events={result.events.map(e => ({ to: e.to, at: e.at.toISOString(), note: e.note }))}
              />
            </div>
            <div className="mt-8 grid gap-6 border-t border-ice-3 pt-6 sm:grid-cols-[1fr_auto]">
              <ul className="flex flex-col gap-2 text-sm">
                {result.items.map((i, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="tabular w-8 font-bold text-ink">{i.qty}×</span>
                    <span className="text-ink">{splitName(i.name).local}</span>
                    <span className="text-ink-3">{i.variant}</span>
                    <span className="tabular ml-auto text-ink-2">{peso(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <dl className="grid grid-cols-[auto_auto] content-start gap-x-6 gap-y-1 text-sm">
                <dt className="text-ink-3">Payment</dt>
                <dd className="text-right font-semibold">{PAYMENT_LABEL[result.payment]}</dd>
                <dt className="text-ink-3">Slot</dt>
                <dd className="text-right font-semibold">{result.slot || "—"}</dd>
                <dt className="text-ink-3">Total</dt>
                <dd className="tabular text-right text-lg font-bold">{peso(result.total)}</dd>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-paper p-5 text-ink-2 ring-1 ring-inset ring-ice-3">{children}</p>;
}

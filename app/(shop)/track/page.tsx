import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { lookupOrder } from "@/lib/orders";
import { getUser } from "@/lib/session";
import { orderCode, parseOrderCode, PAYMENT_LABEL, splitName } from "@/lib/meta";
import { peso } from "@/lib/money";
import { fmtDateTime, fmtDay } from "@/lib/time";
import { OrderTracker } from "@/components/shop/OrderTracker";
import { CancelOrderDialog } from "@/components/shop/CancelOrderDialog";
import { CopyLinkButton } from "@/components/shop/CopyLinkButton";
import { HandoffCard } from "@/components/shop/HandoffCard";
import { TrackLookup } from "@/components/shop/TrackLookup";
import { StatusChip } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Track an order" };

/**
 * Order tracking. A code alone isn't enough (codes are sequential): the
 * order opens for its signed-in owner, staff, or a tracking link (`t`) handed
 * out after the last 4 phone digits match (lib/track-access.ts).
 */
export default async function TrackPage(props: PageProps<"/track">) {
  const sp = await props.searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const raw = str("code");
  const n = raw ? parseOrderCode(raw) : null;
  const user = await getUser();
  const result = n ? await lookupOrder(n, user, str("t") || null) : null;
  const dest = str("dest") === "receipt" ? "receipt" : undefined;
  const miss = sp.miss === "1";
  const offline = sp.offline === "1" || result?.kind === "offline";

  const showForm = !result || result.kind === "locked" || result.kind === "missing" || result.kind === "offline";

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-12">
      <h1 className="sign text-[clamp(44px,6vw,72px)] text-ink">Track an order</h1>
      <p className="mt-2 max-w-xl text-ink-2">
        Enter the code from your receipt, like HB-0003, and the last 4 digits of the phone number you ordered with.
      </p>

      {showForm && <TrackLookup code={n ? orderCode(n) : raw} miss={miss} dest={dest} signedIn={!!user} />}

      <div className="mt-10">
        {(sp.bad === "1" || (raw && !n)) && <Notice>That doesn&apos;t look like an order code. Codes look like HB-0003.</Notice>}
        {offline && <Notice>Our order system is offline for a moment. Try again in a minute.</Notice>}
        {miss && !offline && (
          <Notice>
            We couldn&apos;t find an order with that code and phone number. Check both on your receipt
            {user ? (
              <>
                , or see{" "}
                <Link href="/account" className="font-semibold text-teal-deep underline">
                  your orders
                </Link>
              </>
            ) : null}
            .
          </Notice>
        )}
        {result?.kind === "missing" && n && <Notice>There&apos;s no order {orderCode(n)}.</Notice>}
        {result?.kind === "ok" && <TrackedOrderView r={result} signedIn={!!user} />}
      </div>
    </div>
  );
}

function TrackedOrderView({
  r,
  signedIn,
}: {
  r: Extract<Awaited<ReturnType<typeof lookupOrder>>, { kind: "ok" }>;
  signedIn: boolean;
}) {
  const o = r.order;
  const subtotal = o.items.reduce((s, i) => s + i.price * i.qty, 0);
  const shareLink = `/track?code=${o.code}&t=${r.token}`;
  return (
    <div className="flex flex-col gap-5">
      {r.extras && <HandoffCard extras={r.extras} onTruck={o.status === "READY"} />}
      <div className="rounded-[var(--radius-card)] bg-paper p-5 ring-1 ring-inset ring-ice-3 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[13px] text-ink-3">Order</p>
            <p className="font-marker text-[38px] leading-tight text-marker-deep">{o.code}</p>
            <p className="text-sm text-ink-3">Placed {fmtDateTime(o.createdAt)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <StatusChip status={o.status} forCustomer />
            <Link href={`/receipt/${o.code}${r.owner ? "" : `?t=${r.token}`}`} className="text-sm font-semibold text-teal-deep underline">
              View receipt
            </Link>
            {r.owner && <CopyLinkButton path={shareLink} />}
            {r.canCancel && <CancelOrderDialog code={o.code} />}
            {!signedIn && (o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "PACKED") && (
              <Link
                href={`/login?next=${encodeURIComponent(`/track?code=${o.code}`)}`}
                className="text-sm font-semibold text-teal-deep underline"
              >
                Sign in to cancel
              </Link>
            )}
          </div>
        </div>
        <div className="mt-8">
          <OrderTracker
            status={o.status}
            events={o.events.map(e => ({ to: e.to, at: e.at.toISOString(), note: e.note }))}
            stop={r.extras?.stop ?? null}
          />
        </div>
        <div className="mt-8 grid gap-6 border-t border-ice-3 pt-6 sm:grid-cols-[1fr_auto]">
          <ul className="flex flex-col gap-2 text-sm">
            {o.items.map((i, idx) => (
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
            <dd className="text-right font-semibold">{PAYMENT_LABEL[o.payment]}</dd>
            <dt className="text-ink-3">Delivery</dt>
            <dd className="text-right font-semibold">
              {o.day ? `${fmtDay(o.day)}, ` : ""}
              {o.slot || "—"}
            </dd>
            <dt className="text-ink-3">Subtotal</dt>
            <dd className="tabular text-right font-semibold">{peso(subtotal)}</dd>
            <dt className="text-ink-3">Delivery fee</dt>
            <dd className="tabular text-right font-semibold">{o.fee === 0 ? "Free" : peso(o.fee)}</dd>
            <dt className="text-ink-3">Total</dt>
            <dd className="tabular text-right text-lg font-bold">{peso(o.total)}</dd>
          </dl>
        </div>
        {r.canCancel && (
          <p className="mt-6 border-t border-ice-3 pt-4 text-xs text-ink-3">
            Orders can be cancelled any time before they go on the truck. All reserved items go straight back to available
            stock.
          </p>
        )}
      </div>
    </div>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-paper p-5 text-ink-2 ring-1 ring-inset ring-ice-3">{children}</p>;
}

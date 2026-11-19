import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lookupOrder } from "@/lib/orders";
import { getUser } from "@/lib/session";
import { orderCode, parseOrderCode, splitName } from "@/lib/meta";
import { fmtDateTime } from "@/lib/time";
import { PrintButton } from "@/components/shop/PrintButton";
import { ReceiptSlip } from "@/components/shop/ReceiptSlip";
import { TrackLookup } from "@/components/shop/TrackLookup";
import { ButtonLink } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Order receipt" };

/**
 * Same access rule as /track: the owner, staff, or a tracking link. Shows no
 * delivery details and never the handoff PIN, since receipts get printed.
 */
export default async function ReceiptPage(props: PageProps<"/receipt/[code]">) {
  const [{ code }, sp] = await Promise.all([props.params, props.searchParams]);
  const n = parseOrderCode(code);
  if (!n) notFound();

  const user = await getUser();
  const r = await lookupOrder(n, user, typeof sp.t === "string" ? sp.t : null);
  if (r.kind === "missing") notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-12">
      <h1 className="sign text-[clamp(44px,6vw,72px)] text-ink">Your receipt</h1>
      {r.kind === "offline" ? (
        <p className="mt-6 rounded-xl bg-paper p-5 text-ink-2 ring-1 ring-inset ring-ice-3">
          Our order system is offline for a moment. Try again in a minute.
        </p>
      ) : r.kind === "locked" ? (
        <>
          <p className="mt-2 max-w-xl text-ink-2">
            To open this receipt, confirm the last 4 digits of the phone number the order was placed with.
          </p>
          <TrackLookup code={orderCode(n)} dest="receipt" signedIn={!!user} />
        </>
      ) : (
        <>
          <div className="mt-8">
            <ReceiptSlip
              code={r.order.code}
              lines={r.order.items.map((i, idx) => ({
                key: String(idx),
                label: `${splitName(i.name).local} ${i.variant}`,
                qty: i.qty,
                price: i.price,
              }))}
              fee={r.order.fee}
              total={r.order.total}
              payment={r.order.payment}
              slot={r.order.slot}
              day={r.order.day}
              status={r.order.status}
              placedAt={fmtDateTime(r.order.createdAt)}
            />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <PrintButton />
            <ButtonLink href={`/track?code=${r.order.code}${r.owner ? "" : `&t=${r.token}`}`} variant="outline">
              Track this order
            </ButtonLink>
          </div>
        </>
      )}
    </div>
  );
}

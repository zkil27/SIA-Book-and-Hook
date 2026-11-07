import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findOrderByNumber } from "@/lib/orders";
import { parseOrderCode, splitName } from "@/lib/meta";
import { fmtDateTime } from "@/lib/time";
import { PrintButton } from "@/components/shop/PrintButton";
import { ReceiptSlip } from "@/components/shop/ReceiptSlip";
import { ButtonLink } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Order receipt" };

/** Same public access as /track, so it shows the same fields: no delivery details. */
export default async function ReceiptPage(props: PageProps<"/receipt/[code]">) {
  const { code } = await props.params;
  const n = parseOrderCode(code);
  if (!n) notFound();

  const order = await findOrderByNumber(n);
  if (order === null) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-12">
      <h1 className="sign text-[clamp(44px,6vw,72px)] text-ink">Your receipt</h1>
      {order === "offline" ? (
        <p className="mt-6 rounded-xl bg-paper p-5 text-ink-2 ring-1 ring-inset ring-ice-3">
          Our order system is offline for a moment. Try again in a minute.
        </p>
      ) : (
        <>
          <div className="mt-8">
            <ReceiptSlip
              code={order.code}
              lines={order.items.map((i, idx) => ({
                key: String(idx),
                label: `${splitName(i.name).local} ${i.variant}`,
                qty: i.qty,
                price: i.price,
              }))}
              fee={order.fee}
              total={order.total}
              payment={order.payment}
              slot={order.slot}
              status={order.status}
              placedAt={fmtDateTime(order.createdAt)}
            />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <PrintButton />
            <ButtonLink href={`/track?code=${order.code}`} variant="outline">
              Track this order
            </ButtonLink>
          </div>
        </>
      )}
    </div>
  );
}

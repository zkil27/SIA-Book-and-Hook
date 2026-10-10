"use client";

import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { advanceOrder, revertOrder } from "@/lib/actions/admin-orders";
import { peso } from "@/lib/money";
import { fmtWeekday } from "@/lib/time";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";

/** One-tap confirm from the Today inbox, with Undo. */
export function ConfirmButton({ orderId, code }: { orderId: string; code: string }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  return (
    <Button
      size="sm"
      variant={done ? "outline" : "primary"}
      loading={pending}
      disabled={done}
      onClick={() =>
        start(async () => {
          const res = await advanceOrder(orderId, "PENDING");
          if (!res.ok) return toast({ title: "Couldn't confirm", description: res.error, tone: "error" });
          setDone(true);
          toast({
            title: `${code} confirmed`,
            description: "Moved to packing.",
            undo: async () => {
              const r = await revertOrder(orderId, "CONFIRMED", "PENDING");
              if (!r.ok) toast({ title: "Couldn't undo", description: r.error, tone: "error" });
              else setDone(false);
            },
          });
        })
      }
    >
      {done ? <Check className="size-4" aria-hidden /> : null}
      {done ? "Confirmed" : "Confirm"}
    </Button>
  );
}

/** Hand-built daily sales bars (single series, one hue, hover tooltip). */
export function SalesBars({ days }: { days: { start: string; revenue: number; orders: number }[] }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...days.map(d => d.revenue));
  const total = days.reduce((s, d) => s + d.revenue, 0);
  return (
    <div>
      <p className="tabular text-2xl font-bold text-ink">{peso(total)}</p>
      <p className="text-[13px] text-ink-3">Sales from orders over the last 7 days (cancelled excluded)</p>
      <div className="relative mt-5">
        <div className="flex h-40 items-end gap-2 border-b border-ice-3">
          {days.map((d, i) => {
            const h = (d.revenue / max) * 100;
            const today = i === days.length - 1;
            return (
              <div
                key={d.start}
                className="relative flex h-full flex-1 items-end justify-center"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${fmtWeekday(d.start)}: ${peso(d.revenue)} from ${d.orders} orders`}
              >
                <motion.div
                  className={`w-full max-w-10 rounded-t-[4px] ${today ? "bg-teal-deep" : "bg-teal"} ${hover === i ? "brightness-90" : ""}`}
                  initial={reduce ? false : { height: 0 }}
                  animate={{ height: `${Math.max(d.revenue > 0 ? 2 : 0, h)}%` }}
                  transition={{ type: "spring", stiffness: 160, damping: 22, delay: reduce ? 0 : i * 0.05 }}
                />
                {hover === i && (
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-[12px] text-white shadow-lg">
                    <p className="font-semibold">{fmtWeekday(d.start)}</p>
                    <p className="tabular">{peso(d.revenue)} · {d.orders} order{d.orders === 1 ? "" : "s"}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2">
          {days.map((d, i) => (
            <span key={d.start} className={`flex-1 text-center text-[12px] ${i === days.length - 1 ? "font-bold text-ink" : "text-ink-3"}`}>
              {i === days.length - 1 ? "Today" : fmtWeekday(d.start)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Top sellers as horizontal bars, labelled directly. */
export function TopSellers({ rows }: { rows: { name: string; qty: number; revenue: number }[] }) {
  const reduce = useReducedMotion();
  const max = Math.max(1, ...rows.map(r => r.revenue));
  if (rows.length === 0) return <p className="text-sm text-ink-3">No sales in the last 7 days yet.</p>;
  return (
    <ol className="flex flex-col gap-3.5">
      {rows.map((r, i) => (
        <li key={r.name}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-semibold text-ink">{r.name}</span>
            <span className="tabular shrink-0 text-ink-2">
              {peso(r.revenue)} <span className="text-ink-3">· {r.qty} sold</span>
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-ice-2">
            <motion.div
              className="h-full rounded-full bg-teal"
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${(r.revenue / max) * 100}%` }}
              transition={{ type: "spring", stiffness: 140, damping: 24, delay: reduce ? 0 : 0.1 + i * 0.06 }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

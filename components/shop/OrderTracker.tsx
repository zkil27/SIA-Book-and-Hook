"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check, ClipboardList, Home, Package, PackageCheck, Truck } from "lucide-react";
import { STATUS_FLOW, type OrderStatusKey } from "@/lib/meta";
import { fmtDateTime } from "@/lib/time";
import { Stamp } from "@/components/ui/motion";

const STAGES: { status: OrderStatusKey; label: string; icon: typeof Check }[] = [
  { status: "PENDING", label: "Order placed", icon: ClipboardList },
  { status: "CONFIRMED", label: "Confirmed", icon: PackageCheck },
  { status: "PACKED", label: "Packed on ice", icon: Package },
  { status: "READY", label: "On the truck", icon: Truck },
  { status: "COMPLETED", label: "Delivered", icon: Home },
];
const LAST = STAGES.length - 1;
// Desktop columns: the route line runs between the first and last column centres.
const COL = 100 / STAGES.length;

/**
 * Stall → ice → truck → door. Each reached stage is stamped in turn and the
 * route line fills up to the current one. On the truck, the customer also
 * sees their place on the trip ("stop 3 of 7"), never other stops' details.
 */
export function OrderTracker({
  status,
  events,
  stop = null,
}: {
  status: OrderStatusKey;
  events: { to: OrderStatusKey; at: string; note: string | null }[];
  stop?: { stop: number; total: number; before: number } | null;
}) {
  const reduce = useReducedMotion();
  const cancelled = status === "CANCELLED";
  const reachedIndex = cancelled
    ? Math.max(0, ...events.filter(e => e.to !== "CANCELLED").map(e => STATUS_FLOW.indexOf(e.to)))
    : STATUS_FLOW.indexOf(status);
  const timeOf = (s: OrderStatusKey) => {
    const hit = [...events].reverse().find(e => e.to === s);
    return hit ? fmtDateTime(hit.at) : null;
  };
  const cancelEvent = [...events].reverse().find(e => e.to === "CANCELLED");

  return (
    <div className="relative">
      <ol className="relative grid grid-cols-1 gap-6 sm:grid-cols-5 sm:gap-3">
        {/* route line */}
        <div aria-hidden className="absolute left-[21px] top-2 bottom-2 w-1 rounded-full bg-ice-3 sm:hidden" />
        <div aria-hidden className="absolute top-[21px] hidden h-1 rounded-full bg-ice-3 sm:block" style={{ left: `${COL / 2}%`, right: `${COL / 2}%` }} />
        <motion.div
          aria-hidden
          className="absolute left-[21px] top-2 w-1 origin-top rounded-full bg-teal-deep sm:hidden"
          initial={reduce ? false : { scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: `calc(${(reachedIndex / LAST) * 100}% - 8px)` }}
        />
        <motion.div
          aria-hidden
          className="absolute top-[21px] hidden h-1 origin-left rounded-full bg-teal-deep sm:block"
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ left: `${COL / 2}%`, width: `${(reachedIndex / LAST) * (100 - COL)}%` }}
        />
        {STAGES.map((s, i) => {
          const reached = i <= reachedIndex;
          const current = !cancelled && i === reachedIndex;
          const at = timeOf(s.status);
          return (
            <li key={s.status} className="relative flex items-center gap-4 sm:flex-col sm:text-center">
              <motion.span
                initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 18, delay: reduce ? 0 : 0.15 + i * 0.2 }}
                className={`relative z-10 grid size-11 shrink-0 place-items-center rounded-full ring-4 ring-ice ${
                  reached ? (current ? "bg-marker text-white" : "bg-teal-deep text-white") : "bg-paper text-ink-3 ring-ice"
                }`}
              >
                {reached && !current ? <Check className="size-5" aria-hidden /> : <s.icon className="size-5" aria-hidden />}
                {current && !reduce && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-marker/40 [animation-iteration-count:3]" aria-hidden />
                )}
              </motion.span>
              <div>
                <p className={`font-bold ${reached ? "text-ink" : "text-ink-3"}`}>{s.label}</p>
                <p className="text-[13px] text-ink-3">{at ?? (reached ? "" : "Not yet")}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {status === "READY" && stop && (
        <p className="mt-6 flex flex-wrap items-baseline gap-x-2 rounded-xl bg-violet-soft px-4 py-3 text-[#3b2a78]">
          <span className="font-bold">
            You&apos;re stop {stop.stop} of {stop.total}.
          </span>
          <span>
            {stop.before === 0
              ? "You're next. Have your PIN ready."
              : `${stop.before} stop${stop.before === 1 ? "" : "s"} before yours.`}
          </span>
        </p>
      )}
      {cancelled && (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-xl bg-marker-soft p-4 sm:flex-row sm:items-center">
          <Stamp rotate={-5} className="text-[22px]">
            Cancelled
          </Stamp>
          <p className="text-sm text-marker-deep">
            {cancelEvent?.note ? `Reason: ${cancelEvent.note}. ` : ""}Any stock for this order went back on the shelf.
          </p>
        </div>
      )}
    </div>
  );
}

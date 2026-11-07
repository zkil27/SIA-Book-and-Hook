"use client";

import { motion, useReducedMotion } from "motion/react";
import { PAYMENT_LABEL, STATUS_META, type OrderStatusKey } from "@/lib/meta";
import { peso } from "@/lib/money";
import { Stamp } from "@/components/ui/motion";

export type ReceiptLine = { key: string; label: string; qty: number; price: number };

/**
 * The paper slip for one order. At checkout it prints out of a slot and gets
 * stamped (`animated`); reopened from /receipt it renders still. `.print-area`
 * is what the print stylesheet keeps. Records a payment method only, so it
 * never claims the order is paid.
 */
export function ReceiptSlip({
  code,
  lines,
  fee,
  total,
  payment,
  slot,
  status,
  placedAt,
  animated = false,
}: {
  code: string;
  lines: ReceiptLine[];
  fee: number;
  total: number;
  payment: keyof typeof PAYMENT_LABEL;
  slot: string;
  status: OrderStatusKey;
  placedAt?: string;
  animated?: boolean;
}) {
  const reduce = useReducedMotion();
  const moving = animated && !reduce;
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const cancelled = status === "CANCELLED";

  return (
    <div className="flex w-full flex-col items-center">
      <div className="h-3 w-full max-w-md rounded-full bg-ink shadow-[inset_0_-3px_0_#000]" aria-hidden />
      <div className="print-area w-full max-w-[400px] overflow-hidden">
        <motion.div
          initial={moving ? { y: "-100%" } : false}
          animate={{ y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto bg-paper px-6 pb-10 pt-6"
        >
          <svg aria-hidden viewBox="0 0 120 6" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-2.5 w-full">
            <path d={`M0 6 ${Array.from({ length: 20 }, (_, i) => `L${i * 6 + 3} 0 L${i * 6 + 6} 6`).join(" ")} Z`} fill="var(--color-ice)" />
          </svg>
          <p className="sign text-center text-[22px] text-ink">Hook &amp; Box</p>
          <p className="text-center text-[12px] text-ink-3">Fresh seafood · Dasmariñas City</p>
          <div className="my-4 border-t-2 border-dashed border-ice-3" />
          <p className="text-center text-[13px] text-ink-3">Order code</p>
          <p className="font-marker text-center text-[44px] leading-tight text-marker-deep">{code}</p>
          <div className="my-4 border-t-2 border-dashed border-ice-3" />
          <ul className="flex flex-col gap-1.5 font-mono text-[13px]">
            {lines.map(l => (
              <li key={l.key} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">
                  {l.qty} × {l.label}
                </span>
                <span className="tabular">{peso(l.price * l.qty)}</span>
              </li>
            ))}
            <li className="mt-2 flex justify-between border-t border-dashed border-ice-3 pt-2">
              <span>Subtotal</span>
              <span className="tabular">{peso(subtotal)}</span>
            </li>
            <li className="flex justify-between">
              <span>Delivery</span>
              <span className="tabular">{fee === 0 ? "FREE" : peso(fee)}</span>
            </li>
            <li className="flex justify-between text-[15px] font-bold">
              <span>TOTAL</span>
              <span className="tabular">{peso(total)}</span>
            </li>
          </ul>
          <div className="my-4 border-t-2 border-dashed border-ice-3" />
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
            {placedAt && (
              <>
                <dt className="text-ink-3">Placed</dt>
                <dd className="text-right font-semibold">{placedAt}</dd>
              </>
            )}
            <dt className="text-ink-3">Payment</dt>
            <dd className="text-right font-semibold">{PAYMENT_LABEL[payment]}</dd>
            <dt className="text-ink-3">Delivery slot</dt>
            <dd className="text-right font-semibold">{slot || "—"}</dd>
            <dt className="text-ink-3">Status</dt>
            <dd className="text-right font-semibold">{STATUS_META[status].label}</dd>
          </dl>
          <div className="pointer-events-none mt-7 flex justify-center pb-2">
            <Stamp tone={cancelled ? "ink" : "marker"} rotate={-8} delay={moving ? 1.15 : 0} still={!animated} className="text-[28px]">
              {cancelled ? "Cancelled" : "Thank you!"}
            </Stamp>
          </div>
          <p className="pb-2 text-center text-[11px] leading-snug text-ink-3">
            Order receipt for a fictional store. Not an official receipt or sales invoice.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

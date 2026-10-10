"use client";

import Link from "next/link";
import { motion, useAnimate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { ArrowRight, Minus, Plus, Snowflake, Trash2 } from "lucide-react";
import { useBasket } from "./basket";
import { Odometer, Sheet, Stamp } from "@/components/ui/motion";
import { buttonClass } from "@/components/ui/primitives";
import { DELIVERY_FEE, FREE_DELIVERY_MIN, peso, deliveryFeeFor } from "@/lib/money";

/** The teal plastic basin every palengke stall uses. Drawn geometry. */
export function BasinIcon({ className = "", fill = 0 }: { className?: string; fill?: number }) {
  const level = Math.max(0, Math.min(1, fill));
  return (
    <svg viewBox="0 0 48 36" className={className} aria-hidden>
      <defs>
        <clipPath id="basin-body">
          <path d="M5 11 L43 11 L38.5 32 Q38 34 36 34 L12 34 Q10 34 9.5 32 Z" />
        </clipPath>
      </defs>
      <path d="M5 11 L43 11 L38.5 32 Q38 34 36 34 L12 34 Q10 34 9.5 32 Z" fill="#3cb3ca" />
      {level > 0 && (
        <g clipPath="url(#basin-body)">
          <rect x="0" y={34 - 23 * level} width="48" height="36" fill="#9ff0e3" opacity="0.9" />
        </g>
      )}
      <path d="M9.4 19 H38.6 M10.9 26 H37.1" stroke="#137a8f" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
      <rect x="2" y="7.5" width="44" height="5" rx="2.5" fill="#137a8f" />
      <rect x="2" y="7.5" width="44" height="2" rx="1" fill="#5fc6d9" />
    </svg>
  );
}

const noopSubscribe = () => () => {};
/** False during server render and hydration, true afterwards. */
function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function BasketButton() {
  const { count: liveCount, setOpen, targetRef, bump, ready } = useBasket();
  // The header can hydrate after the basket has loaded from storage, so the
  // first client render must match the server's empty basket.
  const hydrated = useHydrated();
  const count = hydrated && ready ? liveCount : 0;
  const [scope, animateEl] = useAnimate();
  const reduce = useReducedMotion();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduce || !scope.current) return;
    animateEl(
      scope.current,
      { rotate: [0, -12, 10, -6, 3, 0], y: [0, 3, -4, 0], scale: [1, 1.12, 0.96, 1] },
      { duration: 0.6, ease: "easeOut" }
    );
  }, [bump, animateEl, reduce, scope]);

  return (
    <button
      ref={targetRef}
      onClick={() => setOpen(true)}
      className="group relative inline-flex h-11 items-center gap-2 rounded-xl bg-paper pl-2 pr-3.5 ring-1 ring-inset ring-ice-3 transition-colors hover:ring-teal"
      aria-label={`Basket, ${count} item${count === 1 ? "" : "s"}`}
    >
      <span ref={scope} className="inline-block origin-bottom">
        <BasinIcon className="h-7 w-9" fill={Math.min(1, count / 8)} />
      </span>
      <span className="hidden text-sm font-semibold text-ink sm:inline">Basket</span>
      <span
        className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[13px] font-bold transition-colors ${
          count > 0 ? "bg-marker text-white" : "bg-ice-2 text-ink-3"
        }`}
      >
        <Odometer value={count} />
      </span>
    </button>
  );
}

export function FreeDeliveryMeter({ subtotal }: { subtotal: number }) {
  const pct = Math.min(1, subtotal / FREE_DELIVERY_MIN);
  const free = subtotal >= FREE_DELIVERY_MIN;
  const reduce = useReducedMotion();
  return (
    <div className="relative rounded-xl bg-paper p-3.5 ring-1 ring-inset ring-ice-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        {free ? (
          <span className="font-semibold text-teal-ink">Delivery is on us.</span>
        ) : (
          <span className="text-ink-2">
            Add <strong className="text-ink">{peso(FREE_DELIVERY_MIN - subtotal)}</strong> more for free delivery
          </span>
        )}
        <span className="tabular text-[13px] text-ink-3">{peso(FREE_DELIVERY_MIN)}</span>
      </div>
      <div className="relative mt-2.5 h-3 overflow-hidden rounded-full bg-ice-2">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#9ff0e3,#3cb3ca)]"
          initial={false}
          animate={{ width: `${pct * 100}%` }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 22 }}
        />
      </div>
      {free && (
        <div className="pointer-events-none absolute -right-1 -top-4">
          <Stamp tone="teal" rotate={8} className="bg-paper/80 text-[15px]">
            Free delivery!
          </Stamp>
        </div>
      )}
    </div>
  );
}

export function BasketSheet() {
  const { items, open, setOpen, setQty, remove, subtotal, count } = useBasket();
  const fee = deliveryFeeFor(subtotal);

  return (
    <Sheet
      open={open}
      onClose={() => setOpen(false)}
      title="Your basket"
      description={count > 0 ? `${count} item${count === 1 ? "" : "s"} on ice` : undefined}
      footer={
        items.length > 0 ? (
          <div className="flex flex-col gap-3">
            <dl className="grid grid-cols-[1fr_auto] gap-y-1 text-sm">
              <dt className="text-ink-3">Subtotal</dt>
              <dd className="tabular text-right text-ink">{peso(subtotal)}</dd>
              <dt className="text-ink-3">Delivery</dt>
              <dd className="tabular text-right text-ink">{fee === 0 ? "Free" : peso(DELIVERY_FEE)}</dd>
              <dt className="pt-1.5 font-semibold text-ink">Total</dt>
              <dd className="tabular pt-1.5 text-right text-lg font-bold text-ink">{peso(subtotal + fee)}</dd>
            </dl>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className={buttonClass("primary", "lg", "w-full")}
            >
              Checkout <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-10 text-center">
          <BasinIcon className="h-16 w-20 opacity-90" />
          <p className="sign mt-5 text-[28px] text-ink">Nothing on ice yet</p>
          <p className="mt-2 max-w-xs text-sm text-ink-3">
            Tap Add on anything from today&apos;s catch and it lands here.
          </p>
          <button onClick={() => setOpen(false)} className={buttonClass("tarp", "md", "mt-6")}>
            See today&apos;s catch
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <FreeDeliveryMeter subtotal={subtotal} />
          <ul className="flex flex-col divide-y divide-ice-3">
            {items.map(item => (
              <motion.li
                key={item.variantId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 py-3.5 first:pt-1"
              >
                <Link
                  href={`/p/${item.productId}`}
                  onClick={() => setOpen(false)}
                  className="size-16 shrink-0 overflow-hidden rounded-lg bg-ice-2"
                >
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" className="size-full object-cover" />
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{item.name}</p>
                      <p className="text-[13px] text-ink-3">
                        {item.variantName} · {peso(item.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => remove(item.variantId)}
                      className="-mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-marker-soft hover:text-marker-deep"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <QtyStepper
                      value={item.qty}
                      max={item.stock}
                      onChange={q => setQty(item.variantId, q)}
                      label={item.name}
                    />
                    <span className="tabular font-semibold text-ink">{peso(item.price * item.qty)}</span>
                  </div>
                  {item.qty >= item.stock && (
                    <p className="mt-1 text-[12px] font-medium text-[#8a6100]">That&apos;s all we have on hand.</p>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
          <p className="flex items-center gap-2 rounded-lg bg-mint-soft px-3 py-2.5 text-[13px] text-teal-ink">
            <Snowflake className="size-4 shrink-0" aria-hidden />
            Packed on crushed ice in an insulated box. Cleaning and scaling are free.
          </p>
        </div>
      )}
    </Sheet>
  );
}

export function QtyStepper({
  value,
  max,
  onChange,
  label,
  size = "md",
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
  size?: "md" | "lg";
}) {
  const btn = size === "lg" ? "size-12" : "size-9";
  return (
    <div className="inline-flex items-center rounded-xl bg-paper ring-1 ring-inset ring-ice-3">
      <button
        onClick={() => onChange(value - 1)}
        className={`${btn} grid place-items-center rounded-l-xl text-ink-2 transition-colors hover:bg-ice-2 active:scale-90`}
        aria-label={`One less ${label}`}
      >
        <Minus className="size-4" />
      </button>
      <span className={`tabular min-w-8 text-center font-bold text-ink ${size === "lg" ? "text-lg" : ""}`}>
        <Odometer value={value} />
      </span>
      <button
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className={`${btn} grid place-items-center rounded-r-xl text-ink-2 transition-colors hover:bg-ice-2 active:scale-90 disabled:opacity-35`}
        aria-label={`One more ${label}`}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

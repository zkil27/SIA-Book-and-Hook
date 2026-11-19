"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight, PackageCheck } from "lucide-react";
import type { PackedBag, PackOrder, PullRow } from "@/lib/trips-data";
import { shortSlot } from "@/lib/meta";
import { fmtDayRelative } from "@/lib/time";
import { Stamp } from "@/components/ui/motion";
import { StaffEmpty } from "./StaffShell";

const dayLabel = (day: string | null) => (day ? fmtDayRelative(day) : "No date");

/**
 * The packer's one screen: what to take off the ice, then the orders to pack
 * in delivery order, then the bags already packed. Each order row opens its
 * checklist; nothing here needs an order code to be typed or remembered.
 */
export function PackBoard({ queue, pull, packed }: { queue: PackOrder[]; pull: PullRow[]; packed: PackedBag[] }) {
  const groups: { key: string; label: string; orders: PackOrder[] }[] = [];
  for (const o of queue) {
    const key = `${o.day}|${o.slot}`;
    let g = groups.find(x => x.key === key);
    if (!g) {
      g = { key, label: `${dayLabel(o.day)} · ${shortSlot(o.slot)} delivery`, orders: [] };
      groups.push(g);
    }
    g.orders.push(o);
  }
  // The take-out summary covers the earliest delivery day still to pack.
  const firstDay = queue[0]?.day ?? null;
  const pullRows = pull.filter(p => p.day === firstDay);
  const waitingForTrip = packed.filter(b => !b.trip).length;

  return (
    <div>
      <h1 className="sign text-[40px] leading-none text-ink">Pack</h1>
      <p className="mt-2 text-[15px] text-ink-2">
        {queue.length === 0
          ? "No orders to pack right now."
          : `${queue.length} order${queue.length === 1 ? "" : "s"} to pack. Start at the top: it goes out first.`}
      </p>

      {pullRows.length > 0 && (
        <details className="group mt-4 overflow-hidden rounded-[var(--radius-card)] bg-paper ring-1 ring-inset ring-ice-3">
          <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-3 px-4 text-[16px] font-bold text-ink [&::-webkit-details-marker]:hidden">
            <span className="flex-1">What to take out for {dayLabel(firstDay)}</span>
            <span className="text-[13px] font-semibold text-ink-3 group-open:hidden">Show</span>
            <ChevronDown className="size-5 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-180" aria-hidden />
          </summary>
          <p className="border-t border-ice-2 px-4 pt-3 text-[13px] text-ink-3">Totals across every order, so each fish comes off the ice once.</p>
          <ul className="px-4 pb-2">
            {pullRows.map(p => (
              <li key={`${p.product}-${p.variant}`} className="flex items-center gap-4 border-b border-ice-2 py-3 last:border-b-0">
                <span className="tabular w-14 shrink-0 text-[22px] font-black text-ink">{p.qty} ×</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[16px] font-bold text-ink">{p.product}</span>
                  <span className="block text-[14px] text-ink-3">{p.variant}</span>
                </span>
                <span className="shrink-0 text-[13px] text-ink-3">
                  for {p.orders} order{p.orders === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {queue.length === 0 ? (
        <StaffEmpty
          title={
            <Stamp tone="leaf" rotate={-6} className="text-[34px]">
              All packed
            </Stamp>
          }
        >
          New orders show up here as soon as the office confirms them (their labels print then, too).
        </StaffEmpty>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {groups.map(g => (
            <section key={g.key} aria-label={g.label}>
              <h2 className="mb-2 text-[14px] font-bold text-ink-2">{g.label}</h2>
              <ul className="flex flex-col gap-2">
                {g.orders.map(o => (
                  <li key={o.id}>
                    <Link
                      href={`/staff/pack/${o.code}`}
                      className="flex min-h-[76px] items-center gap-4 rounded-[var(--radius-card)] bg-paper px-4 py-3 ring-1 ring-inset ring-ice-3 transition-colors duration-150 active:bg-ice"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[18px] font-bold text-ink">{o.firstName}</span>
                        <span className="block truncate text-[14px] text-ink-3">
                          {o.barangay} · {o.units} item{o.units === 1 ? "" : "s"} · <span className="font-mono">{o.code}</span>
                        </span>
                      </span>
                      <span className="hidden text-[14px] font-semibold text-teal-deep min-[380px]:block">Pack</span>
                      <ChevronRight className="size-6 shrink-0 text-ink-3" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {packed.length > 0 && (
        <details className="group mt-8 rounded-[var(--radius-card)] bg-paper/60 ring-1 ring-inset ring-ice-3">
          <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-3 px-4 text-[15px] font-semibold text-ink-2 [&::-webkit-details-marker]:hidden">
            <PackageCheck className="size-5 shrink-0 text-teal-deep" aria-hidden />
            <span className="flex-1">
              {packed.length} packed bag{packed.length === 1 ? "" : "s"} at the stall
              {waitingForTrip > 0 && <span className="text-ink-3"> · {waitingForTrip} waiting for a trip</span>}
            </span>
            <ChevronDown className="size-5 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-180" aria-hidden />
          </summary>
          <ul className="border-t border-ice-2 px-4 pb-2">
            {packed.map(b => (
              <li key={b.code}>
                <Link href={`/staff/pack/${b.code}`} className="flex min-h-[52px] items-center gap-3 border-b border-ice-2 py-2 last:border-b-0">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">{b.firstName}</span>
                    <span className="block truncate text-[13px] text-ink-3">
                      {b.barangay} · {dayLabel(b.day)}, {shortSlot(b.slot)} · <span className="font-mono">{b.code}</span>
                    </span>
                  </span>
                  <span className={`shrink-0 text-[13px] font-semibold ${b.trip ? "text-teal-deep" : "text-ink-3"}`}>
                    {b.trip ? `On ${b.trip}` : "Waiting for a trip"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="px-4 pb-3 text-[13px] text-ink-3">
            The office puts packed bags on a trip. Bags on a trip are loaded from the <Link href="/staff/load" className="font-semibold text-teal-deep underline underline-offset-2">Load truck</Link> screen.
          </p>
        </details>
      )}
    </div>
  );
}

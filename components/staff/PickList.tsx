"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Printer } from "lucide-react";
import { markPacked, undoPacked } from "@/lib/actions/trips";
import type { PackOrder } from "@/lib/trips-data";
import { shortSlot } from "@/lib/meta";
import { peso } from "@/lib/money";
import { fmtDayRelative } from "@/lib/time";
import { Button, ButtonLink } from "@/components/ui/primitives";
import { Stamp } from "@/components/ui/motion";
import { useToast } from "@/components/ui/toast";
import { labelFromPack } from "./BagLabel";
import { usePrintLabels } from "./PrintLabels";
import { ActionBar } from "./StaffShell";

// ── Ticks: survive a refresh, a sleeping phone or a quick look elsewhere ─────

const tickKey = (code: string) => `hb:pick:${code}`;
const tickListeners = new Set<() => void>();
/** Fallback when storage is blocked (private mode): lasts until reload. */
const tickMemory = new Map<string, string>();

function subscribeTicks(cb: () => void) {
  tickListeners.add(cb);
  return () => {
    tickListeners.delete(cb);
  };
}

function readTicks(code: string): string {
  try {
    return window.localStorage.getItem(tickKey(code)) ?? "";
  } catch {
    return tickMemory.get(code) ?? "";
  }
}

function saveTicks(code: string, ticks: Set<number> | null) {
  const raw = ticks && ticks.size ? JSON.stringify([...ticks]) : "";
  try {
    if (raw) window.localStorage.setItem(tickKey(code), raw);
    else window.localStorage.removeItem(tickKey(code));
  } catch {
    if (raw) tickMemory.set(code, raw);
    else tickMemory.delete(code);
  }
  tickListeners.forEach(l => l());
}

function parseTicks(raw: string, count: number): Set<number> {
  try {
    const list = raw ? (JSON.parse(raw) as unknown[]) : [];
    return new Set(list.filter((i): i is number => Number.isInteger(i) && (i as number) >= 0 && (i as number) < count));
  } catch {
    return new Set();
  }
}

/**
 * One order: tick each line as it goes in the bag, then "Mark packed". The
 * bag label (printed when the office confirmed) can be reprinted here.
 */
export function PickList({ order }: { order: PackOrder }) {
  const router = useRouter();
  const toast = useToast();
  const reduce = useReducedMotion();
  const [done, setDone] = useState(order.status === "PACKED");
  // Saved ticks live in browser storage (read after hydration; empty on the server).
  const raw = useSyncExternalStore(subscribeTicks, () => readTicks(order.code), () => "");
  const saved = useMemo(() => parseTicks(raw, order.lines.length), [raw, order.lines.length]);
  const ticked = done ? new Set(order.lines.map((_, i) => i)) : saved;
  const [next, setNext] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const { print, sheet } = usePrintLabels();
  const allTicked = ticked.size === order.lines.length;
  const left = order.lines.length - ticked.size;

  function toggle(i: number) {
    if (done) return;
    const n = new Set(saved);
    if (n.has(i)) n.delete(i);
    else n.add(i);
    saveTicks(order.code, n);
  }

  function pack() {
    start(async () => {
      const res = await markPacked(order.id);
      if (!res.ok) {
        toast({ title: `Couldn't pack ${order.code}`, description: res.error, tone: "error" });
        router.refresh();
        return;
      }
      saveTicks(order.code, null);
      setDone(true);
      setNext(res.data.next);
      toast({
        title: `${order.code} packed`,
        description: res.data.tripCode
          ? `Added to ${res.data.tripCode} for loading.`
          : "The bag waits at the stall for its truck.",
        undo: async () => {
          const r = await undoPacked(order.id);
          if (!r.ok) return toast({ title: "Couldn't undo", description: r.error, tone: "error" });
          setDone(false);
          setNext(null);
          toast({ title: `Undone: ${order.code} is back in To pack` });
        },
      });
    });
  }

  return (
    <div>
      <Link href="/staff/pack" className="-ml-1 inline-flex h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-ink-2">
        <ArrowLeft className="size-4" aria-hidden /> All orders to pack
      </Link>

      {/* The bag: who it's for and when it goes. Matches the printed label. */}
      <div className="cardboard relative mt-2 rounded-[var(--radius-card)] px-5 py-4">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <p className="sign text-[34px] leading-none text-ink">{order.firstName}</p>
          <p className="font-mono text-[20px] font-bold leading-none text-ink">{order.code}</p>
        </div>
        <p className="mt-2 text-[16px] font-semibold text-[#3d2a0e]">
          {order.barangay} · {order.day ? fmtDayRelative(order.day) : "No date"}, {shortSlot(order.slot)} delivery
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[14px] font-bold text-[#3d2a0e]">
            {order.payment === "COD" ? `Cash on delivery: ${peso(order.total)}` : "Paid by GCash"}
          </p>
          <button
            type="button"
            onClick={() => print([labelFromPack(order)])}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-paper/80 px-3 text-[14px] font-semibold text-ink ring-1 ring-inset ring-[#b48d58] active:bg-paper"
          >
            <Printer className="size-4" aria-hidden /> Print label
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink">Put these in the bag</h1>
        <p className="tabular text-sm font-semibold text-ink-2" aria-live="polite">
          {ticked.size} of {order.lines.length} in
        </p>
      </div>
      {!done && ticked.size === 0 && <p className="mt-1 text-[14px] text-ink-3">Tap each line as it goes in.</p>}

      <ul className="mt-3 flex flex-col gap-2">
        {order.lines.map((l, i) => {
          const on = ticked.has(i);
          return (
            <li key={i}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(i)}
                disabled={done}
                className={`flex min-h-[72px] w-full items-center gap-4 rounded-[var(--radius-card)] px-4 py-3 text-left ring-inset transition-[background-color,box-shadow] duration-150 ${
                  on ? "bg-leaf-soft ring-2 ring-leaf" : "bg-paper ring-1 ring-ice-3 active:bg-ice"
                }`}
              >
                <span className={`tabular w-14 shrink-0 text-[26px] font-black leading-none ${on ? "text-leaf" : "text-ink"}`}>{l.qty} ×</span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[18px] font-bold ${on ? "text-[#14532f] line-through decoration-2" : "text-ink"}`}>{l.name}</span>
                  <span className="block text-[15px] text-ink-3">{l.variant}</span>
                </span>
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full transition-colors ${on ? "bg-leaf text-white" : "bg-ice ring-2 ring-inset ring-ice-3"}`}
                  aria-hidden
                >
                  <AnimatePresence>
                    {on && (
                      <motion.span initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 600, damping: 26 }}>
                        <Check className="size-6 stroke-[3]" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {done && (
        <div className="pointer-events-none mt-6 flex justify-center">
          <Stamp tone="teal" rotate={-7} className="text-[40px]" still={order.status === "PACKED"}>
            Packed
          </Stamp>
        </div>
      )}

      <ActionBar>
        {done ? (
          next ? (
            <>
              <ButtonLink href="/staff/pack" size="lg" variant="outline" className="h-14 text-[16px]">
                List
              </ButtonLink>
              <ButtonLink href={`/staff/pack/${next}`} size="lg" className="h-14 flex-1 text-[17px]">
                Next order <ArrowRight className="size-5" aria-hidden />
              </ButtonLink>
            </>
          ) : (
            <ButtonLink href="/staff/pack" size="lg" className="h-14 flex-1 text-[17px]">
              Back to the list
            </ButtonLink>
          )
        ) : (
          <Button size="lg" className="h-14 flex-1 text-[17px]" disabled={!allTicked} loading={pending} onClick={pack}>
            {allTicked ? "Mark packed" : `Tick every line first (${left} left)`}
          </Button>
        )}
      </ActionBar>
      {sheet}
    </div>
  );
}

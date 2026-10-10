"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Lock, RotateCcw, X } from "lucide-react";
import type { LedgerRow } from "@/lib/admin-data";
import { counterMovement } from "@/lib/actions/admin-stock";
import { movementRef, splitName } from "@/lib/meta";
import { fmtDateTime } from "@/lib/time";
import { Button, Select } from "@/components/ui/primitives";
import { Sheet } from "@/components/ui/motion";
import { useToast } from "@/components/ui/toast";

const KINDS: { id: LedgerRow["kind"] | "all"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "sale", label: "Sales" },
  { id: "restock", label: "Restocks" },
  { id: "count", label: "Counts" },
  { id: "correction", label: "Corrections" },
  { id: "loss", label: "Losses" },
  { id: "cancel", label: "Cancellations" },
];

const KIND_TONE: Record<LedgerRow["kind"], string> = {
  sale: "bg-ice-2 text-ink-2",
  restock: "bg-mint-soft text-teal-ink",
  count: "bg-violet-soft text-[#3b2a78]",
  correction: "bg-tarp-soft text-[#5c4300]",
  loss: "bg-marker-soft text-marker-deep",
  cancel: "bg-leaf-soft text-[#14532f]",
  other: "bg-ice-2 text-ink-2",
};

const PERIODS = [
  { id: "1", label: "Today" },
  { id: "7", label: "7 days" },
  { id: "30", label: "30 days" },
  { id: "all", label: "All time" },
];

export function LedgerView({
  rows,
  variants,
  variantId,
  period,
}: {
  rows: LedgerRow[];
  variants: { id: string; label: string; stock: number }[];
  variantId: string | null;
  period: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const toast = useToast();
  const reduce = useReducedMotion();
  const [kind, setKind] = useState<LedgerRow["kind"] | "all">("all");
  const [isolated, setIsolated] = useState<string | null>(null);
  const [countering, setCountering] = useState<LedgerRow | null>(null);
  const [pending, start] = useTransition();
  const [now] = useState(() => Date.now());

  const shown = useMemo(() => (kind === "all" ? rows : rows.filter(r => r.kind === kind)), [rows, kind]);
  const totals = useMemo(() => {
    let inn = 0;
    let out = 0;
    for (const r of shown) (r.quantity > 0 ? (inn += r.quantity) : (out += r.quantity));
    return { inn, out };
  }, [shown]);
  const selected = variants.find(v => v.id === variantId);

  function setParam(k: string, v: string | null) {
    const next = new URLSearchParams(params.toString());
    if (v) next.set(k, v);
    else next.delete(k);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function counter(r: LedgerRow) {
    start(async () => {
      const res = await counterMovement(r.id, "Correction");
      if (!res.ok) return toast({ title: "Not recorded", description: res.error, tone: "error" });
      toast({ title: `Countered ${movementRef(r.id)}`, description: `New entry of ${r.quantity > 0 ? "−" : "+"}${Math.abs(r.quantity)}. The original stays.` });
      setCountering(null);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full max-w-xs">
          <label htmlFor="ledger-variant" className="text-[13px] font-semibold text-ink-2">
            Item
          </label>
          <Select id="ledger-variant" className="mt-1.5 h-10 text-sm" value={variantId ?? ""} onChange={e => setParam("v", e.target.value || null)}>
            <option value="">All items</option>
            {variants.map(v => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex gap-1 rounded-lg bg-paper p-1 ring-1 ring-inset ring-ice-3">
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setParam("p", p.id)}
              aria-pressed={period === p.id}
              className={`h-8 rounded-md px-3 text-[13px] font-semibold ${period === p.id ? "bg-ink text-white" : "text-ink-2 hover:bg-ice"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {KINDS.map(k => (
          <button
            key={k.id}
            onClick={() => setKind(k.id)}
            aria-pressed={kind === k.id}
            className={`h-8 rounded-full px-3 text-[13px] font-semibold ring-1 ring-inset ${kind === k.id ? "bg-ink text-white ring-ink" : "bg-paper text-ink-2 ring-ice-3 hover:ring-ink-3"}`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-[var(--radius-card)] bg-paper ring-1 ring-inset ring-ice-3">
        <div className="px-5 py-4">
          <p className="text-[13px] font-semibold text-ink-3">{selected ? "On hand now" : "Entries shown"}</p>
          <p className="tabular mt-1 text-[26px] font-bold text-ink">{selected ? selected.stock : shown.length}</p>
        </div>
        <div className="border-l border-ice-3 px-5 py-4">
          <p className="text-[13px] font-semibold text-ink-3">In</p>
          <p className="tabular mt-1 text-[26px] font-bold text-teal-deep">+{totals.inn}</p>
        </div>
        <div className="border-l border-ice-3 px-5 py-4">
          <p className="text-[13px] font-semibold text-ink-3">Out</p>
          <p className="tabular mt-1 text-[26px] font-bold text-marker-deep">{totals.out}</p>
        </div>
      </div>

      {isolated && (
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-mint-soft px-4 py-2.5 text-sm text-teal-ink">
          Highlighting <strong>{rows.find(r => r.variantId === isolated)?.product}</strong>
          <Link href={`/admin/ledger?v=${isolated}&p=${period}`} className="font-semibold underline">
            Show only this item
          </Link>
          <button onClick={() => setIsolated(null)} className="ml-auto grid size-7 place-items-center rounded-md hover:bg-white/60" aria-label="Stop highlighting">
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-[var(--radius-card)] bg-paper ring-1 ring-inset ring-ice-3">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-ice-3 bg-ice/60 text-left text-[12px] font-bold uppercase tracking-wider text-ink-3">
              <th className="px-4 py-2.5">Entry</th>
              <th className="px-4 py-2.5">Item</th>
              <th className="px-4 py-2.5">Reason</th>
              <th className="px-4 py-2.5">By</th>
              <th className="px-4 py-2.5 text-right">Change</th>
              <th className="px-4 py-2.5 text-right">Balance</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-ink-3">
                  No entries for this filter.
                </td>
              </tr>
            )}
            {shown.map((r, i) => {
              const dim = isolated && r.variantId !== isolated;
              const fresh = now - new Date(r.at).getTime() < 90_000;
              return (
                <motion.tr
                  key={r.id}
                  initial={fresh && !reduce ? { backgroundColor: "#fff4c7" } : false}
                  animate={{ backgroundColor: "rgba(255,255,255,0)", opacity: dim ? 0.3 : 1 }}
                  transition={{ backgroundColor: { duration: 2.4 }, opacity: { duration: 0.2 } }}
                  className={`border-b border-ice-2 last:border-b-0 ${isolated && !dim ? "bg-mint-soft/40" : ""}`}
                >
                  <td className="px-4 py-2.5 align-top">
                    <p className="font-mono text-[12px] font-bold text-ink">{movementRef(r.id)}</p>
                    <p className="whitespace-nowrap text-[12px] text-ink-3">{fmtDateTime(r.at)}</p>
                  </td>
                  <td className="px-4 py-2.5 align-top">
                    <button onClick={() => setIsolated(isolated === r.variantId ? null : r.variantId)} className="text-left hover:underline" title="Highlight this item's entries">
                      <span className="font-semibold text-ink">{splitName(r.product).local}</span> <span className="text-ink-3">{r.variant}</span>
                    </button>
                    <p className="font-mono text-[11px] text-ink-3">{r.sku}</p>
                  </td>
                  <td className="px-4 py-2.5 align-top">
                    <span className={`mr-2 inline-block rounded px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${KIND_TONE[r.kind]}`}>{r.kind}</span>
                    <span className="text-ink-2">{r.reason}</span>
                    {r.orderCode && (
                      <Link href={`/admin/orders?open=${r.orderCode}`} className="ml-1.5 font-mono text-[12px] font-semibold text-teal-deep hover:underline">
                        {r.orderCode}
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-2.5 align-top text-ink-3">{r.actor}</td>
                  <td className={`tabular px-4 py-2.5 text-right align-top text-[15px] font-bold ${r.quantity > 0 ? "text-teal-deep" : "text-marker-deep"}`}>
                    {r.quantity > 0 ? `+${r.quantity}` : r.quantity}
                  </td>
                  <td className="tabular px-4 py-2.5 text-right align-top font-semibold text-ink">{r.balance}</td>
                  <td className="px-2 py-1.5 text-right align-top">
                    <button
                      onClick={() => setCountering(r)}
                      className="inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-[12px] font-semibold text-ink-3 hover:bg-ice hover:text-ink"
                      title="Write the opposite entry"
                    >
                      <RotateCcw className="size-3.5" aria-hidden /> Counter
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 flex items-center gap-2 text-[13px] text-ink-3">
        <Lock className="size-4" aria-hidden /> Append-only. Entries are never edited or deleted; a mistake is fixed by a new
        entry that cancels it out.
      </p>

      <Sheet
        open={!!countering}
        onClose={() => setCountering(null)}
        title={countering ? `Counter ${movementRef(countering.id)}?` : ""}
        description="Writes the opposite amount as a new correction entry."
        footer={
          countering ? (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setCountering(null)}>
                Keep as is
              </Button>
              <Button loading={pending} onClick={() => counter(countering)}>
                Add correction entry
              </Button>
            </div>
          ) : undefined
        }
      >
        {countering && (
          <div className="flex flex-col gap-4 text-sm">
            <div className="rounded-xl bg-ice p-4">
              <p className="text-[12px] font-bold uppercase tracking-wider text-ink-3">Original entry (stays)</p>
              <p className="mt-1 font-semibold text-ink">
                {countering.product} · {countering.variant}
              </p>
              <p className="text-ink-2">
                {countering.reason} · <strong>{countering.quantity > 0 ? `+${countering.quantity}` : countering.quantity}</strong>
              </p>
            </div>
            <div className="rounded-xl bg-tarp-soft p-4">
              <p className="text-[12px] font-bold uppercase tracking-wider text-[#5c4300]">New entry</p>
              <p className="mt-1 font-semibold text-ink">Correction of {movementRef(countering.id)}</p>
              <p className="text-ink-2">
                Change <strong>{countering.quantity > 0 ? `−${countering.quantity}` : `+${-countering.quantity}`}</strong>
              </p>
            </div>
            <p className="text-ink-3">
              Use this when an entry was a mistake. To record a different amount, add a new adjustment from Stock instead.
            </p>
          </div>
        )}
      </Sheet>
    </div>
  );
}

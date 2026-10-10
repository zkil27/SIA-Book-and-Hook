"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { RotateCcw, Search, TrendingDown, TrendingUp } from "lucide-react";
import { savePrices } from "@/lib/actions/admin-catalog";
import { categoryHue, splitName } from "@/lib/meta";
import { parsePesoInput, peso, pesoNumber } from "@/lib/money";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { Thumb } from "./kit";

export type PriceRow = {
  id: string;
  name: string;
  product: string;
  image: string | null;
  category: { name: string; slug: string };
  price: number;
  changedToday: boolean;
};

export function PricesBoard({ rows }: { rows: PriceRow[] }) {
  const toast = useToast();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const [pending, start] = useTransition();
  const inputs = useRef<Map<string, HTMLInputElement>>(new Map());

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? rows.filter(r => `${r.product} ${r.name}`.toLowerCase().includes(s)) : rows;
  }, [rows, q]);

  const changes = rows
    .map(r => {
      const raw = draft[r.id];
      if (raw === undefined) return null;
      const next = parsePesoInput(raw);
      if (next === null || next === r.price) return null;
      return { variantId: r.id, price: next, from: r.price };
    })
    .filter(Boolean) as { variantId: string; price: number; from: number }[];
  const invalid = Object.entries(draft).filter(([, raw]) => raw.trim() !== "" && parsePesoInput(raw) === null).length;

  function save() {
    start(async () => {
      const res = await savePrices(changes.map(c => ({ variantId: c.variantId, price: c.price })));
      if (!res.ok) return toast({ title: "Prices not saved", description: res.error, tone: "error" });
      const changed = res.data.changed;
      setDraft({});
      toast({
        title: `${changed.length} price${changed.length === 1 ? "" : "s"} updated`,
        description: "The storefront tags and price crawl show them now.",
        undo: async () => {
          const r = await savePrices(changed.map(c => ({ variantId: c.variantId, price: c.from })));
          if (!r.ok) toast({ title: "Couldn't undo", description: r.error, tone: "error" });
        },
      });
    });
  }

  function focusNext(id: string, dir: 1 | -1) {
    const i = shown.findIndex(r => r.id === id);
    const next = shown[i + dir];
    if (next) inputs.current.get(next.id)?.select();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <input
            data-page-search
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Find an item"
            aria-label="Find an item"
            className="h-10 w-full rounded-lg bg-paper pl-9 pr-3 text-sm ring-1 ring-inset ring-ice-3 outline-none focus:ring-2 focus:ring-teal-deep"
          />
        </div>
        <p className="text-[13px] text-ink-3">Type a new price, then Enter or ↓ for the next one.</p>
      </div>

      <div className="mt-4 overflow-hidden rounded-[var(--radius-card)] bg-paper ring-1 ring-inset ring-ice-3">
        <div className="hidden grid-cols-[1fr_120px_150px_110px] gap-4 border-b border-ice-3 bg-ice/60 px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-ink-3 sm:grid">
          <span>Item</span>
          <span className="text-right">Now</span>
          <span>New price (₱)</span>
          <span className="text-right">Change</span>
        </div>
        <ul className="divide-y divide-ice-2">
          {shown.map(r => {
            const raw = draft[r.id];
            const next = raw === undefined ? null : parsePesoInput(raw);
            const bad = raw !== undefined && raw.trim() !== "" && next === null;
            const diff = next !== null ? next - r.price : 0;
            const pct = r.price ? Math.round((diff / r.price) * 100) : 0;
            const hue = categoryHue(r.category.slug);
            return (
              <li
                key={r.id}
                className={`grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:grid-cols-[1fr_120px_150px_110px] ${diff !== 0 ? "bg-tarp-soft/50" : ""}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: hue.bg }} aria-hidden />
                  <Thumb src={r.image} size="size-9" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{splitName(r.product).local}</p>
                    <p className="text-[13px] text-ink-3">
                      {r.name}
                      {r.changedToday && <span className="ml-2 rounded bg-marker px-1 text-[11px] font-bold text-white">changed today</span>}
                    </p>
                  </div>
                </div>
                <p className="tabular text-right text-ink-2 sm:block">{peso(r.price)}</p>
                <input
                  ref={el => {
                    if (el) inputs.current.set(r.id, el);
                    else inputs.current.delete(r.id);
                  }}
                  inputMode="decimal"
                  aria-label={`New price for ${r.product} ${r.name}`}
                  aria-invalid={bad}
                  placeholder={pesoNumber(r.price).replace(/,/g, "")}
                  value={raw ?? ""}
                  onChange={e => setDraft(d => ({ ...d, [r.id]: e.target.value }))}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === "ArrowDown") {
                      e.preventDefault();
                      focusNext(r.id, 1);
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      focusNext(r.id, -1);
                    } else if (e.key === "Escape") {
                      setDraft(d => {
                        const n = { ...d };
                        delete n[r.id];
                        return n;
                      });
                    }
                  }}
                  className="tabular col-span-2 h-10 w-full rounded-lg bg-ice px-3 text-right font-semibold text-ink ring-1 ring-inset ring-ice-3 outline-none placeholder:font-normal placeholder:text-ink-3/60 focus:bg-paper focus:ring-2 focus:ring-teal-deep aria-invalid:ring-2 aria-invalid:ring-marker sm:col-span-1"
                />
                <p className="col-span-2 text-right text-sm font-bold sm:col-span-1">
                  {bad ? (
                    <span className="text-marker-deep">Invalid</span>
                  ) : diff > 0 ? (
                    <span className="inline-flex items-center gap-1 text-marker-deep">
                      <TrendingUp className="size-4" aria-hidden /> +{peso(diff)} ({pct}%)
                    </span>
                  ) : diff < 0 ? (
                    <span className="inline-flex items-center gap-1 text-leaf">
                      <TrendingDown className="size-4" aria-hidden /> −{peso(-diff)} ({pct}%)
                    </span>
                  ) : (
                    <span className="text-ink-3/50">—</span>
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sticky bottom-20 z-20 mt-4 flex items-center gap-3 rounded-2xl bg-ink p-3 pl-5 text-white shadow-[var(--shadow-sheet)] lg:bottom-6">
        <p className="text-sm">
          {changes.length ? (
            <>
              <strong>{changes.length}</strong> price{changes.length === 1 ? "" : "s"} ready to update
            </>
          ) : (
            "No changes yet"
          )}
          {invalid > 0 && <span className="text-[#ff8a98]"> · {invalid} invalid</span>}
        </p>
        {Object.keys(draft).length > 0 && (
          <button onClick={() => setDraft({})} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-white/75 hover:bg-white/10">
            <RotateCcw className="size-4" aria-hidden /> Reset
          </button>
        )}
        <Button variant="tarp" className={Object.keys(draft).length ? "" : "ml-auto"} disabled={!changes.length || invalid > 0} loading={pending} onClick={save}>
          Update prices
        </Button>
      </div>
    </div>
  );
}

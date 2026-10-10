"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, ClipboardCheck, HandCoins, Minus, Plus, Scale, Search, SlidersHorizontal } from "lucide-react";
import { adjustStock, counterMovement, saveMorningCount, walkInSale } from "@/lib/actions/admin-stock";
import { ADJUST_REASONS, categoryHue, splitName } from "@/lib/meta";
import { peso } from "@/lib/money";
import { Button, Input } from "@/components/ui/primitives";
import { Odometer, Sheet, Stamp } from "@/components/ui/motion";
import { useToast } from "@/components/ui/toast";
import { AgeBadge, StockCount, Thumb } from "./kit";

export type DeskVariant = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  oldestDays: number | null;
  product: { id: string; name: string; image: string | null; category: { name: string; slug: string } };
};

type Mode = "adjust" | "walkin" | "count";

const MODES: { id: Mode; label: string; icon: typeof Scale; hint: string }[] = [
  { id: "walkin", label: "Walk-in sale", icon: HandCoins, hint: "Counter sales, two taps" },
  { id: "adjust", label: "Adjust", icon: SlidersHorizontal, hint: "Restock, spoilage, returns" },
  { id: "count", label: "Morning count", icon: ClipboardCheck, hint: "Enter what's physically there" },
];

function label(v: DeskVariant) {
  return `${splitName(v.product.name).local} ${v.name}`;
}

function useFilter(variants: DeskVariant[], q: string) {
  return useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return variants;
    return variants.filter(v => `${v.product.name} ${v.name} ${v.sku}`.toLowerCase().includes(s));
  }, [variants, q]);
}

export function StockDesk({
  variants,
  mode,
  variantId,
  reason,
}: {
  variants: DeskVariant[];
  mode: Mode;
  variantId: string | null;
  reason: string | null;
}) {
  return (
    <div>
      <nav className="grid grid-cols-3 gap-2" aria-label="Stock tasks">
        {MODES.map(m => {
          const on = m.id === mode;
          return (
            <Link
              key={m.id}
              href={`/admin/stock?mode=${m.id}`}
              scroll={false}
              aria-current={on ? "page" : undefined}
              className={`relative flex flex-col gap-1 rounded-xl p-3 ring-inset transition-[box-shadow,background-color] sm:flex-row sm:items-center sm:gap-3 sm:p-4 ${
                on ? "bg-ink text-white" : "bg-paper text-ink ring-1 ring-ice-3 hover:ring-ink-3"
              }`}
            >
              <m.icon className={`size-5 shrink-0 ${on ? "text-tarp" : "text-ink-2"}`} aria-hidden />
              <span>
                <span className="block text-[14px] font-bold sm:text-[15px]">{m.label}</span>
                <span className={`hidden text-[12px] sm:block ${on ? "text-white/70" : "text-ink-3"}`}>{m.hint}</span>
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-6">
        {mode === "adjust" && <AdjustMode variants={variants} initialId={variantId} initialReason={reason} />}
        {mode === "walkin" && <WalkInMode variants={variants} initialId={variantId} />}
        {mode === "count" && <CountMode variants={variants} />}
      </div>
    </div>
  );
}

// ── Adjust ──────────────────────────────────────────────────────────────────

function AdjustMode({ variants, initialId, initialReason }: { variants: DeskVariant[]; initialId: string | null; initialReason: string | null }) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [id, setId] = useState<string | null>(initialId ?? null);
  const preset = ADJUST_REASONS.find(r => r.id === initialReason);
  const [dir, setDir] = useState<1 | -1>(preset ? (preset.sign === -1 ? -1 : 1) : 1);
  const [amount, setAmount] = useState(1);
  const [why, setWhy] = useState<string>(preset?.id ?? (dir === 1 ? "Restock" : "Spoilage"));
  const [note, setNote] = useState("");
  const [logged, setLogged] = useState(0);
  const [pending, start] = useTransition();
  const list = useFilter(variants, q);
  const v = variants.find(x => x.id === id) ?? null;
  const delta = dir * amount;
  const after = v ? v.stock + delta : 0;
  const reasons = ADJUST_REASONS.filter(r => r.sign === 0 || r.sign === dir);

  function flip(d: 1 | -1) {
    setDir(d);
    const keep = ADJUST_REASONS.find(r => r.id === why && (r.sign === 0 || r.sign === d));
    if (!keep) setWhy(d === 1 ? "Restock" : "Spoilage");
  }

  function submit() {
    if (!v) return;
    start(async () => {
      const res = await adjustStock({ variantId: v.id, quantity: delta, reason: why, note: note || undefined });
      if (!res.ok) return toast({ title: "Not recorded", description: res.error, tone: "error" });
      setLogged(n => n + 1);
      setNote("");
      setAmount(1);
      toast({
        title: `${label(v)}: ${res.data.before} → ${res.data.after}`,
        description: `${delta > 0 ? "+" : ""}${delta} · ${why}. Logged in the ledger.`,
        undo: async () => {
          const r = await counterMovement(res.data.movementId, "Undo");
          if (!r.ok) toast({ title: "Couldn't undo", description: r.error, tone: "error" });
        },
      });
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className={`rounded-[var(--radius-card)] bg-paper ring-1 ring-inset ring-ice-3 ${v ? "hidden lg:block" : ""}`}>
        <div className="border-b border-ice-3 p-3">
          <PickerSearch q={q} setQ={setQ} />
        </div>
        <ul className="max-h-[60vh] overflow-y-auto p-1.5">
          {list.map(x => (
            <li key={x.id}>
              <button
                onClick={() => setId(x.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left ${x.id === id ? "bg-mint-soft" : "hover:bg-ice"}`}
              >
                <Thumb src={x.product.image} size="size-9" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink">{splitName(x.product.name).local}</span>
                  <span className="block text-[13px] text-ink-3">{x.name}</span>
                </span>
                <StockCount stock={x.stock} className="text-sm" />
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="p-6 text-center text-sm text-ink-3">No match.</li>}
        </ul>
      </div>

      {v ? (
        <motion.div
          key={v.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[var(--radius-card)] bg-paper p-5 ring-1 ring-inset ring-ice-3 sm:p-6"
        >
          <button onClick={() => setId(null)} className="mb-3 text-sm font-semibold text-teal-deep hover:underline lg:hidden">
            ← Pick another item
          </button>
          <div className="flex items-center gap-4">
            <Thumb src={v.product.image} size="size-16" />
            <div className="min-w-0">
              <p className="sign text-[30px] text-ink">{splitName(v.product.name).local}</p>
              <p className="text-sm text-ink-3">
                {v.name} · <span className="font-mono">{v.sku}</span>
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-ice p-1">
            {([1, -1] as const).map(d => (
              <button
                key={d}
                onClick={() => flip(d)}
                className={`relative h-11 rounded-lg text-[15px] font-bold ${dir === d ? "text-white" : "text-ink-2"}`}
              >
                {dir === d && (
                  <motion.span layoutId="dir" className={`absolute inset-0 rounded-lg ${d === 1 ? "bg-teal-deep" : "bg-marker"}`} transition={{ type: "spring", stiffness: 500, damping: 38 }} />
                )}
                <span className="relative inline-flex items-center gap-1.5">
                  {d === 1 ? <Plus className="size-4" aria-hidden /> : <Minus className="size-4" aria-hidden />}
                  {d === 1 ? "Add stock" : "Take out"}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              onClick={() => setAmount(a => Math.max(1, a - 1))}
              className="grid size-14 place-items-center rounded-2xl bg-ice text-ink ring-1 ring-inset ring-ice-3 active:scale-90"
              aria-label="Less"
            >
              <Minus className="size-6" />
            </button>
            <input
              value={amount}
              onChange={e => setAmount(Math.max(1, Math.min(9999, parseInt(e.target.value || "1", 10) || 1)))}
              inputMode="numeric"
              aria-label="Quantity"
              className="tabular h-16 w-28 rounded-2xl bg-paper text-center text-[34px] font-bold text-ink ring-2 ring-inset ring-ice-3 outline-none focus:ring-teal-deep"
            />
            <button
              onClick={() => setAmount(a => a + 1)}
              className="grid size-14 place-items-center rounded-2xl bg-ice text-ink ring-1 ring-inset ring-ice-3 active:scale-90"
              aria-label="More"
            >
              <Plus className="size-6" />
            </button>
          </div>
          <div className="mt-3 flex justify-center gap-1.5">
            {[5, 10, 20].map(n => (
              <button key={n} onClick={() => setAmount(a => a + n)} className="h-8 rounded-full bg-ice px-3 text-[13px] font-semibold text-ink-2 ring-1 ring-inset ring-ice-3 hover:ring-ink-3">
                +{n}
              </button>
            ))}
          </div>

          <fieldset className="mt-6">
            <legend className="text-[13px] font-semibold text-ink-2">Reason</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {reasons.map(r => (
                <button
                  key={r.id}
                  onClick={() => setWhy(r.id)}
                  aria-pressed={why === r.id}
                  className={`h-9 rounded-full px-3.5 text-[14px] font-semibold ring-1 ring-inset transition-colors ${
                    why === r.id ? "bg-ink text-white ring-ink" : "text-ink-2 ring-ice-3 hover:ring-ink-3"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <Input className="mt-3" placeholder="Note (optional), e.g. supplier or batch" value={note} onChange={e => setNote(e.target.value)} maxLength={140} />
          </fieldset>

          <div className="mt-6 flex items-center justify-center gap-4 rounded-xl bg-ice py-4">
            <span className="tabular text-[28px] font-bold text-ink-3">{v.stock}</span>
            <ArrowRight className="size-6 text-ink-3" aria-hidden />
            <span className={`text-[40px] font-bold ${after < 0 ? "text-marker-deep" : "text-ink"}`}>
              <Odometer value={Math.max(0, after)} />
            </span>
            <span className="text-sm text-ink-3">on hand after</span>
          </div>
          {after < 0 && <p className="mt-2 text-center text-sm font-semibold text-marker-deep">Only {v.stock} on hand. Lower the amount.</p>}

          <Button size="lg" className="mt-5 w-full" variant={dir === 1 ? "primary" : "marker"} loading={pending} disabled={after < 0} onClick={submit}>
            Record {delta > 0 ? "+" : ""}
            {delta} · {why}
          </Button>
          <AnimatePresence>
            {logged > 0 && (
              <motion.span key={logged} className="pointer-events-none absolute right-5 top-5" exit={{ opacity: 0 }}>
                <Stamp tone="teal" rotate={10} className="bg-paper/80 text-[20px]">
                  Logged
                </Stamp>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="hidden place-items-center rounded-[var(--radius-card)] border-2 border-dashed border-ice-3 p-10 text-center text-ink-3 lg:grid">
          <div>
            <Scale className="mx-auto size-10" aria-hidden />
            <p className="mt-3 font-semibold text-ink-2">Pick an item on the left</p>
            <p className="mt-1 text-sm">Every adjustment is added to the stock ledger with its reason.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function PickerSearch({ q, setQ }: { q: string; setQ: (s: string) => void }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
      <input
        data-page-search
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Find item or SKU"
        aria-label="Find item"
        className="h-10 w-full rounded-lg bg-ice pl-9 pr-3 text-sm ring-1 ring-inset ring-ice-3 outline-none focus:ring-2 focus:ring-teal-deep"
      />
    </div>
  );
}

// ── Walk-in sale ────────────────────────────────────────────────────────────

function WalkInMode({ variants, initialId }: { variants: DeskVariant[]; initialId: string | null }) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [id, setId] = useState<string | null>(initialId);
  const [qty, setQty] = useState(1);
  const [pending, start] = useTransition();
  const list = useFilter(variants, q);
  const v = variants.find(x => x.id === id) ?? null;

  function sell() {
    if (!v) return;
    start(async () => {
      const res = await walkInSale(v.id, qty);
      if (!res.ok) return toast({ title: "Sale not recorded", description: res.error, tone: "error" });
      toast({
        title: `Sold ${qty} × ${label(v)}`,
        description: `${peso(v.price * qty)} · ${res.data.after} left`,
        undo: async () => {
          const r = await counterMovement(res.data.movementId, "Undo");
          if (!r.ok) toast({ title: "Couldn't undo", description: r.error, tone: "error" });
        },
      });
      setId(null);
      setQty(1);
    });
  }

  return (
    <div>
      <div className="max-w-md">
        <PickerSearch q={q} setQ={setQ} />
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {list.map(x => {
          const out = x.stock <= 0;
          const hue = categoryHue(x.product.category.slug);
          return (
            <li key={x.id}>
              <button
                disabled={out}
                onClick={() => {
                  setId(x.id);
                  setQty(1);
                }}
                className="group flex w-full flex-col overflow-hidden rounded-xl bg-paper text-left ring-1 ring-inset ring-ice-3 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] active:scale-[0.98] disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                <span className="relative block aspect-[4/3] bg-ice-2">
                  {x.product.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={x.product.image} alt="" className="size-full object-cover" />
                  )}
                  <span className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: hue.bg }} aria-hidden />
                </span>
                <span className="flex flex-col gap-0.5 p-2.5">
                  <span className="truncate font-bold text-ink">{splitName(x.product.name).local}</span>
                  <span className="flex items-center justify-between gap-2 text-[13px]">
                    <span className="truncate text-ink-3">{x.name}</span>
                    <span className="tabular font-semibold text-ink">{peso(x.price)}</span>
                  </span>
                  <StockCount stock={x.stock} className="text-[13px]" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Sheet
        open={!!v}
        onClose={() => setId(null)}
        title={v ? `Sell ${label(v)}` : ""}
        description={v ? `${v.stock} on hand · ${peso(v.price)} each` : undefined}
        footer={
          v ? (
            <Button size="lg" className="w-full" loading={pending} onClick={sell} variant="tarp">
              Record sale · {peso(v.price * qty)}
            </Button>
          ) : undefined
        }
      >
        {v && (
          <div className="flex flex-col items-center py-4">
            <Thumb src={v.product.image} size="size-28" />
            <div className="mt-6 flex items-center gap-4">
              <button onClick={() => setQty(n => Math.max(1, n - 1))} className="grid size-16 place-items-center rounded-2xl bg-paper ring-1 ring-inset ring-ice-3 active:scale-90" aria-label="One less">
                <Minus className="size-7" />
              </button>
              <span className="tabular w-20 text-center text-[52px] font-bold text-ink">
                <Odometer value={qty} />
              </span>
              <button
                onClick={() => setQty(n => Math.min(v.stock, n + 1))}
                disabled={qty >= v.stock}
                className="grid size-16 place-items-center rounded-2xl bg-paper ring-1 ring-inset ring-ice-3 active:scale-90 disabled:opacity-35"
                aria-label="One more"
              >
                <Plus className="size-7" />
              </button>
            </div>
            <p className="mt-4 text-sm text-ink-3">Written to the ledger as &ldquo;Walk-in sale&rdquo;.</p>
          </div>
        )}
      </Sheet>
    </div>
  );
}

// ── Morning count ───────────────────────────────────────────────────────────

function CountMode({ variants }: { variants: DeskVariant[] }) {
  const toast = useToast();
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const entered = Object.entries(counts).filter(([, s]) => s.trim() !== "");
  const diffs = entered.filter(([id, s]) => (variants.find(v => v.id === id)?.stock ?? 0) !== parseInt(s, 10));

  const groups = useMemo(() => {
    const m = new Map<string, DeskVariant[]>();
    for (const v of variants) {
      const k = v.product.category.name;
      m.set(k, [...(m.get(k) ?? []), v]);
    }
    return [...m.entries()];
  }, [variants]);

  function save() {
    start(async () => {
      const res = await saveMorningCount(entered.map(([variantId, s]) => ({ variantId, counted: parseInt(s, 10) })));
      if (!res.ok) return toast({ title: "Count not saved", description: res.error, tone: "error" });
      toast({
        title: `Count saved: ${res.data.checked} checked`,
        description: res.data.adjusted ? `${res.data.adjusted} corrected in the ledger.` : "Everything matched the system.",
      });
      setCounts({});
      router.refresh();
    });
  }

  let idx = -1;
  return (
    <div>
      <p className="max-w-2xl text-[15px] text-ink-2">
        Count what&apos;s physically on ice and type it in. Matching counts write nothing; any difference is logged as a
        &ldquo;Morning count&rdquo; correction. Press <strong>Enter</strong> to jump to the next item.
      </p>
      <div className="mt-5 overflow-hidden rounded-[var(--radius-card)] bg-paper ring-1 ring-inset ring-ice-3">
        {groups.map(([cat, list]) => (
          <div key={cat}>
            <p className="bg-ice/70 px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-ink-2">{cat}</p>
            <ul className="divide-y divide-ice-2">
              {list.map(v => {
                idx++;
                const i = idx;
                const raw = counts[v.id] ?? "";
                const n = raw.trim() === "" ? null : parseInt(raw, 10);
                const diff = n === null || Number.isNaN(n) ? null : n - v.stock;
                return (
                  <li key={v.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2.5 sm:grid-cols-[1fr_90px_110px_90px]">
                    <div className="flex min-w-0 items-center gap-3">
                      <Thumb src={v.product.image} size="size-9" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{splitName(v.product.name).local}</p>
                        <p className="flex items-center gap-2 text-[13px] text-ink-3">
                          {v.name} <AgeBadge days={v.oldestDays} />
                        </p>
                      </div>
                    </div>
                    <p className="tabular hidden text-right text-sm text-ink-3 sm:block">
                      system <strong className="text-ink">{v.stock}</strong>
                    </p>
                    <input
                      ref={el => {
                        inputs.current[i] = el;
                      }}
                      inputMode="numeric"
                      aria-label={`Counted ${label(v)} (system has ${v.stock})`}
                      placeholder={String(v.stock)}
                      value={raw}
                      onChange={e => setCounts(c => ({ ...c, [v.id]: e.target.value.replace(/\D/g, "") }))}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          inputs.current[i + 1]?.focus();
                        }
                      }}
                      className="tabular h-11 w-full rounded-lg bg-ice text-center text-lg font-bold text-ink ring-1 ring-inset ring-ice-3 outline-none placeholder:font-normal placeholder:text-ink-3/60 focus:bg-paper focus:ring-2 focus:ring-teal-deep"
                    />
                    <span className="w-16 text-right text-sm font-bold sm:w-auto">
                      {diff === null ? (
                        <span className="text-ink-3/50">—</span>
                      ) : diff === 0 ? (
                        <span className="inline-flex items-center gap-1 text-leaf">
                          <Check className="size-4" aria-hidden /> ok
                        </span>
                      ) : (
                        <span className={diff > 0 ? "text-teal-deep" : "text-marker-deep"}>
                          {diff > 0 ? "+" : ""}
                          {diff}
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="sticky bottom-20 z-20 mt-4 flex items-center gap-3 rounded-2xl bg-ink p-3 pl-5 text-white shadow-[var(--shadow-sheet)] lg:bottom-6">
        <p className="text-sm">
          <strong>{entered.length}</strong> of {variants.length} counted
          {diffs.length > 0 && <span className="text-tarp"> · {diffs.length} differ</span>}
        </p>
        <Button variant="tarp" className="ml-auto" disabled={entered.length === 0} loading={pending} onClick={save}>
          Save count
        </Button>
      </div>
    </div>
  );
}

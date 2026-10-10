"use client";

import Link from "next/link";
import { Fragment, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Archive, ArchiveRestore, ChevronDown, Pencil, Plus, ScrollText, Search, SlidersHorizontal } from "lucide-react";
import type { InvProduct } from "@/lib/admin-data";
import { setProductActive } from "@/lib/actions/admin-catalog";
import { LOW_STOCK_AT } from "@/lib/meta";
import { peso } from "@/lib/money";
import { ButtonLink, CategoryChip, Kbd } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { AgeBadge, StockCount, Thumb } from "./kit";

type Filter = "all" | "low" | "out" | "tosale" | "archived";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Active" },
  { id: "low", label: "Running low" },
  { id: "out", label: "Sold out" },
  { id: "tosale", label: "To sale (7d+)" },
  { id: "archived", label: "Archived" },
];

export function ProductsTable({ products, initialFilter }: { products: InvProduct[]; initialFilter: Filter }) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [openId, setOpenId] = useState<string | null>(null);
  const [, start] = useTransition();

  const cats = useMemo(() => {
    const m = new Map<string, string>();
    products.forEach(p => m.set(p.category.slug, p.category.name));
    return [...m.entries()];
  }, [products]);

  const shown = products.filter(p => {
    if (filter === "archived" ? p.active : !p.active) return false;
    if (cat !== "all" && p.category.slug !== cat) return false;
    if (q && !`${p.name} ${p.variants.map(v => v.sku).join(" ")}`.toLowerCase().includes(q.toLowerCase())) return false;
    const vs = p.variants.filter(v => v.active);
    if (filter === "low") return vs.some(v => v.stock > 0 && v.stock <= LOW_STOCK_AT);
    if (filter === "out") return vs.some(v => v.stock <= 0);
    if (filter === "tosale") return vs.some(v => v.toSale);
    return true;
  });

  function setActive(p: InvProduct, active: boolean) {
    start(async () => {
      const res = await setProductActive(p.id, active);
      if (!res.ok) return toast({ title: "Not saved", description: res.error, tone: "error" });
      toast({
        title: active ? `${p.name} is back on sale` : `${p.name} archived`,
        description: active ? undefined : "Hidden from the storefront. Past orders keep it.",
        undo: async () => {
          await setProductActive(p.id, !active);
        },
      });
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <input
            data-page-search
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search name or SKU"
            aria-label="Search products"
            className="h-10 w-full rounded-lg bg-paper pl-9 pr-3 text-sm ring-1 ring-inset ring-ice-3 outline-none focus:ring-2 focus:ring-teal-deep"
          />
        </div>
        <select
          value={cat}
          onChange={e => setCat(e.target.value)}
          aria-label="Category"
          className="h-10 rounded-lg bg-paper px-3 text-sm font-semibold text-ink ring-1 ring-inset ring-ice-3 outline-none focus:ring-2 focus:ring-teal-deep"
        >
          <option value="all">All categories</option>
          {cats.map(([slug, name]) => (
            <option key={slug} value={slug}>
              {name}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`h-10 rounded-lg px-3 text-[13px] font-semibold ring-1 ring-inset transition-colors ${
                filter === f.id ? "bg-ink text-white ring-ink" : "bg-paper text-ink-2 ring-ice-3 hover:ring-ink-3"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <ButtonLink href="/admin/products/new" className="ml-auto">
          <Plus className="size-4" aria-hidden /> New product <Kbd>n</Kbd>
        </ButtonLink>
      </div>

      <p className="mt-3 text-[13px] text-ink-3">
        {shown.length} product{shown.length === 1 ? "" : "s"}
      </p>

      <div className="mt-2 overflow-hidden rounded-[var(--radius-card)] bg-paper ring-1 ring-inset ring-ice-3">
        {shown.length === 0 && <p className="px-6 py-12 text-center text-sm text-ink-3">No products match.</p>}
        <ul className="divide-y divide-ice-2">
          {shown.map(p => {
            const vs = p.variants.filter(v => v.active);
            const total = vs.reduce((s, v) => s + Math.max(0, v.stock), 0);
            const prices = vs.map(v => v.price);
            const open = openId === p.id;
            const flags = vs.filter(v => v.toSale).length;
            return (
              <Fragment key={p.id}>
                <li className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
                  <button
                    onClick={() => setOpenId(open ? null : p.id)}
                    className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-3 hover:bg-ice"
                    aria-expanded={open}
                    aria-label={`${open ? "Hide" : "Show"} variants of ${p.name}`}
                  >
                    <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  <Thumb src={p.image} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/products/${p.id}`} className="block truncate font-semibold text-ink hover:underline">
                      {p.name}
                    </Link>
                    <p className="flex flex-wrap items-center gap-2 text-[13px] text-ink-3">
                      <CategoryChip slug={p.category.slug} name={p.category.name} />
                      {vs.length} variant{vs.length === 1 ? "" : "s"}
                      {flags > 0 && <AgeBadge days={Math.max(...vs.map(v => v.oldestDays ?? 0))} />}
                    </p>
                  </div>
                  <p className="tabular hidden w-32 text-right text-sm text-ink-2 md:block">
                    {prices.length ? (Math.min(...prices) === Math.max(...prices) ? peso(prices[0]) : `${peso(Math.min(...prices))}–${peso(Math.max(...prices))}`) : "—"}
                  </p>
                  <p className="hidden w-20 text-right sm:block">
                    <StockCount stock={total} className="text-sm" />
                  </p>
                  <div className="flex shrink-0 gap-1">
                    <Link href={`/admin/products/${p.id}`} className="grid size-9 place-items-center rounded-lg text-ink-2 hover:bg-ice" aria-label={`Edit ${p.name}`}>
                      <Pencil className="size-4" />
                    </Link>
                    <button
                      onClick={() => setActive(p, !p.active)}
                      className="grid size-9 place-items-center rounded-lg text-ink-2 hover:bg-ice"
                      aria-label={p.active ? `Archive ${p.name}` : `Restore ${p.name}`}
                      title={p.active ? "Archive" : "Restore"}
                    >
                      {p.active ? <Archive className="size-4" /> : <ArchiveRestore className="size-4" />}
                    </button>
                  </div>
                </li>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.li
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 40 }}
                      className="overflow-hidden bg-ice/50"
                    >
                      <ul className="divide-y divide-ice-2 py-1 pl-14 pr-3 sm:pr-4">
                        {p.variants.map(v => (
                          <li key={v.id} className={`flex flex-wrap items-center gap-x-4 gap-y-1 py-2 ${v.active ? "" : "opacity-50"}`}>
                            <span className="min-w-36 flex-1 font-semibold text-ink">
                              {v.name}
                              {!v.active && <span className="ml-2 text-[12px] font-normal text-ink-3">(archived)</span>}
                            </span>
                            <span className="w-40 font-mono text-[12px] text-ink-3">{v.sku}</span>
                            <span className="tabular w-20 text-sm text-ink">{peso(v.price)}</span>
                            <span className="w-16">
                              <StockCount stock={v.stock} className="text-sm" />
                            </span>
                            <span className="w-28">
                              <AgeBadge days={v.oldestDays} />
                            </span>
                            <span className="flex gap-1">
                              <Link href={`/admin/stock?v=${v.id}`} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[13px] font-semibold text-teal-deep hover:bg-mint-soft">
                                <SlidersHorizontal className="size-3.5" aria-hidden /> Adjust
                              </Link>
                              <Link href={`/admin/ledger?v=${v.id}`} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[13px] font-semibold text-teal-deep hover:bg-mint-soft">
                                <ScrollText className="size-3.5" aria-hidden /> Ledger
                              </Link>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </motion.li>
                  )}
                </AnimatePresence>
              </Fragment>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

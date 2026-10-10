import Link from "next/link";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { getShopCatalog, type ShopProduct } from "@/lib/catalog";
import { DISHES, type Dish } from "@/lib/catalog-data";
import { categoryHue } from "@/lib/meta";
import { fmtLongDate, shopHour, shopIsOpen } from "@/lib/time";
import { HeroBoard } from "@/components/shop/HeroBoard";
import { ProductCard } from "@/components/shop/ProductCard";

export default async function ShopHome(props: PageProps<"/">) {
  const sp = await props.searchParams;
  const c = typeof sp.c === "string" ? sp.c : "";
  const dish = (typeof sp.dish === "string" ? sp.dish : "") as Dish | "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const { products, categories, offline } = await getShopCatalog();

  const filtered = products.filter(p => {
    if (c && p.category.slug !== c) return false;
    if (dish && !p.dishes.includes(dish)) return false;
    if (q) {
      const hay = p.name.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const featured = pickFeatured(products);
  const open = shopIsOpen();
  const hour = shopHour();
  const href = (patch: Record<string, string>) => {
    const next = new URLSearchParams();
    const merged = { c, dish, q, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, v);
    const s = next.toString();
    return `/${s ? `?${s}` : ""}#catch`;
  };
  const filtering = !!(c || dish || q);

  return (
    <>
      {/* ── First viewport: the price board ─────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="sign max-w-[14ch] text-[clamp(52px,9vw,112px)] text-ink">
            Just in from <span className="text-teal-deep">the port</span>
          </h1>
          <div className="flex flex-col gap-1 pb-2 lg:items-end lg:text-right">
            <p className="text-[15px] font-semibold text-ink">{fmtLongDate(new Date())}</p>
            <p className="flex items-center gap-2 text-sm text-ink-2 lg:justify-end">
              <span
                className={`size-2 rounded-full ${open ? "bg-leaf shadow-[0_0_0_4px_var(--color-leaf-soft)]" : "bg-ink-3"}`}
                aria-hidden
              />
              {open
                ? hour < 10
                  ? "Open now · this morning's catch is on ice"
                  : "Open now until 6 PM"
                : "Closed now · order tonight for tomorrow morning"}
            </p>
            <p className="max-w-sm text-sm text-ink-3">
              Stock on every tag is counted live. Cleaning and scaling are free.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <HeroBoard featured={featured} />
        </div>
      </section>

      {/* ── The catch ───────────────────────────────────────────────────── */}
      <section id="catch" className="mx-auto max-w-7xl scroll-mt-28 px-4 pt-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="sign text-[clamp(40px,6vw,64px)] text-ink">Today&apos;s catch</h2>
          <p className="pb-1.5 text-sm text-ink-3">
            {filtered.length} of {products.length} on ice{offline ? " · browsing only" : ""}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <nav aria-label="Categories" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <ul className="flex w-max gap-2">
              <li>
                <FilterChip href={href({ c: "" })} active={!c}>
                  Everything
                </FilterChip>
              </li>
              {categories.map(cat => {
                const hue = categoryHue(cat.slug);
                return (
                  <li key={cat.slug}>
                    <FilterChip href={href({ c: c === cat.slug ? "" : cat.slug })} active={c === cat.slug} hue={hue.bg}>
                      {cat.name}
                      <span className="tabular text-[12px] opacity-70">{cat.count}</span>
                    </FilterChip>
                  </li>
                );
              })}
            </ul>
          </nav>
          <nav aria-label="Cook it as" className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <span className="shrink-0 text-[13px] font-semibold text-ink-3">Cook it as</span>
            <ul className="flex w-max gap-1.5">
              {DISHES.map(d => (
                <li key={d.id}>
                  <Link
                    href={href({ dish: dish === d.id ? "" : d.id })}
                    scroll={false}
                    aria-current={dish === d.id ? "true" : undefined}
                    className={`inline-flex h-8 items-center rounded-full px-3 text-[13px] font-semibold transition-colors ${
                      dish === d.id
                        ? "bg-teal-deep text-white"
                        : "bg-paper text-ink-2 ring-1 ring-inset ring-ice-3 hover:ring-teal"
                    }`}
                  >
                    {d.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {filtering && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
              {q && (
                <span>
                  Results for <strong className="text-ink">&ldquo;{q}&rdquo;</strong>
                </span>
              )}
              <Link
                href="/#catch"
                scroll={false}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold text-marker-deep hover:bg-marker-soft"
              >
                <X className="size-3.5" aria-hidden /> Clear filters
              </Link>
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-[var(--radius-card)] bg-paper px-6 py-16 text-center ring-1 ring-inset ring-ice-3">
            <p className="sign text-[34px] text-ink">Nothing on ice for that</p>
            <p className="mt-2 max-w-sm text-sm text-ink-3">
              {q ? `We don't stock anything called "${q}" today.` : "No catch matches those filters today."} Try
              another dish, or see everything.
            </p>
            <Link href="/#catch" className="mt-6 font-semibold text-teal-deep underline">
              Show everything
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-10 min-[440px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} offline={offline} />
            ))}
          </div>
        )}
      </section>

      {/* ── How it reaches you ──────────────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="grid overflow-hidden rounded-[var(--radius-card)] bg-ink text-white md:grid-cols-[1.1fr_1fr]">
          <div className="relative min-h-64">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/scenes/cold-box.jpg" alt="Whole fish packed in ice inside an insulated box" className="absolute inset-0 size-full object-cover" />
          </div>
          <div className="p-7 sm:p-10">
            <h2 className="sign text-[clamp(34px,4vw,48px)] text-tarp">From the port to your pan</h2>
            <ol className="mt-7 flex flex-col gap-6">
              {[
                ["Order by 9 PM", "Pick your catch and a morning delivery slot. Pay by GCash or cash on delivery."],
                ["Packed at dawn", "We clean and scale your order free, then pack it on crushed ice in an insulated box."],
                ["At your door by noon", "Delivered across Dasmariñas City. Free delivery when your order reaches ₱500."],
              ].map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[auto_1fr] gap-4">
                  <span className="font-marker grid size-10 place-items-center rounded-full bg-tarp text-xl text-ink" aria-hidden>
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-lg font-bold">{t}</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-white/75">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}

function FilterChip({
  href,
  active,
  hue,
  children,
}: {
  href: string;
  active: boolean;
  hue?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-[15px] font-semibold transition-[background-color,box-shadow,color] ${
        active ? "bg-ink text-white" : "bg-paper text-ink ring-1 ring-inset ring-ice-3 hover:ring-ink-3"
      }`}
    >
      {hue && <span className="size-3 rounded-[4px]" style={{ backgroundColor: hue }} aria-hidden />}
      {children}
    </Link>
  );
}

/** Three hero products: the best-stocked item from three different categories. */
function pickFeatured(products: ShopProduct[]): ShopProduct[] {
  const stockOf = (p: ShopProduct) => p.variants.reduce((s, v) => s + Math.max(0, v.stock), 0);
  const ranked = [...products].filter(p => p.image && stockOf(p) > 0).sort((a, b) => stockOf(b) - stockOf(a));
  const out: ShopProduct[] = [];
  const seen = new Set<string>();
  for (const p of ranked) {
    if (seen.has(p.category.slug)) continue;
    seen.add(p.category.slug);
    out.push(p);
    if (out.length === 3) break;
  }
  return out;
}

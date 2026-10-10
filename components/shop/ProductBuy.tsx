"use client";

import Link from "next/link";
import { ViewTransition, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, Plus, Snowflake, Truck } from "lucide-react";
import type { ShopProduct } from "@/lib/catalog";
import { DISHES } from "@/lib/catalog-data";
import { LOW_STOCK_AT, splitName, unitFor } from "@/lib/meta";
import { pesoNumber } from "@/lib/money";
import { CategoryChip, buttonClass } from "@/components/ui/primitives";
import { Odometer, Stamp } from "@/components/ui/motion";
import { useBasket } from "./basket";
import { QtyStepper } from "./BasketUI";

/** Grams in a variant name, for the hanging scale ("Whole 1kg" → 1000). */
function gramsOf(name: string): number | null {
  const n = name.toLowerCase();
  const kg = /(\d+(?:\.\d+)?)\s*kg/.exec(n);
  if (kg) return Math.round(Number(kg[1]) * 1000);
  const g = /(\d+)\s*g\b/.exec(n);
  if (g) return Number(g[1]);
  return null;
}

// Server and browser trig can differ in the last digits; rounding keeps
// the SVG markup identical so hydration matches.
const r2 = (n: number) => Math.round(n * 100) / 100;

/** A market hanging scale. The needle swings to the selected weight. */
function HangingScale({ grams }: { grams: number | null }) {
  const reduce = useReducedMotion();
  const max = 2000;
  const angle = grams === null ? -62 : -70 + (Math.min(grams, max) / max) * 140;
  const ticks = Array.from({ length: 21 }, (_, i) => i);
  return (
    <svg viewBox="0 0 160 96" className="h-auto w-full max-w-[220px]" aria-hidden>
      <path d="M12 88 A68 68 0 0 1 148 88" fill="#fff" stroke="#13191c" strokeWidth="3" />
      {ticks.map(i => {
        const a = (-70 + i * 7) * (Math.PI / 180);
        const major = i % 5 === 0;
        const r1 = major ? 52 : 57;
        return (
          <line
            key={i}
            x1={r2(80 + Math.sin(a) * r1)}
            y1={r2(88 - Math.cos(a) * r1)}
            x2={r2(80 + Math.sin(a) * 63)}
            y2={r2(88 - Math.cos(a) * 63)}
            stroke="#13191c"
            strokeWidth={major ? 2.2 : 1.2}
          />
        );
      })}
      {[0, 0.5, 1, 1.5, 2].map((kg, i) => {
        const a = (-70 + i * 35) * (Math.PI / 180);
        return (
          <text
            key={kg}
            x={r2(80 + Math.sin(a) * 41)}
            y={r2(91 - Math.cos(a) * 41)}
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill="#3d4a50"
            fontFamily="var(--font-geist-mono)"
          >
            {kg}
          </text>
        );
      })}
      <g transform="translate(80 88)">
        {/* The transparent disc centres the group's box on the pivot, so it rotates about it. */}
        <motion.g
          initial={false}
          animate={{ rotate: angle }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 9, mass: 0.9 }}
        >
          <circle r="60" fill="transparent" />
          <line x1="0" y1="0" x2="0" y2="-58" stroke="#d7263d" strokeWidth="3.2" strokeLinecap="round" />
        </motion.g>
      </g>
      <circle cx="80" cy="88" r="6" fill="#13191c" />
    </svg>
  );
}

export function ProductBuy({ product, offline }: { product: ShopProduct; offline: boolean }) {
  const basket = useBasket();
  const firstInStock = product.variants.find(v => v.stock > 0) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstInStock.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(0);
  const photoRef = useRef<HTMLImageElement>(null);

  const v = product.variants.find(x => x.id === variantId) ?? firstInStock;
  const { local, english } = splitName(product.name);
  const left = v.stock - basket.qtyOf(v.id);
  const canAdd = !offline && left > 0;
  const dishes = DISHES.filter(d => product.dishes.includes(d.id));

  function add() {
    if (!canAdd) return;
    basket.add(
      {
        variantId: v.id,
        productId: product.id,
        name: local,
        variantName: v.name,
        price: v.price,
        image: product.image,
        stock: v.stock,
      },
      Math.min(qty, left),
      photoRef.current
    );
    setAdded(a => a + 1);
    setQty(1);
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1.05fr_1fr] md:gap-12">
      <div className="relative">
        <div className="sticky top-24 overflow-hidden rounded-[var(--radius-card)] bg-ice-2">
          <ViewTransition name={`photo-${product.id}`} share="morph" default="none">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img ref={photoRef} src={product.image} alt={product.name} className="aspect-[4/3] w-full object-cover md:aspect-[4/5]" />
            ) : (
              <div className="aspect-[4/3] md:aspect-[4/5]" />
            )}
          </ViewTransition>
          {v.stock <= 0 && (
            <span className="absolute right-4 top-4">
              <Stamp rotate={6} className="bg-paper/85 text-[26px]">
                Sold out
              </Stamp>
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryChip slug={product.category.slug} name={product.category.name} />
          {product.variants.some(x => x.priceChangedToday) && (
            <span className="rounded-md bg-marker px-2 py-0.5 text-[12px] font-bold uppercase tracking-wide text-white">
              New price today
            </span>
          )}
        </div>
        <h1 className="sign mt-4 text-[clamp(56px,8vw,96px)] text-ink">{local}</h1>
        {english && <p className="mt-2 text-xl font-semibold text-ink-2">{english}</p>}
        {product.description && <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-ink-2">{product.description}</p>}

        {/* Weigh it */}
        <div className="mt-8 rounded-[var(--radius-card)] bg-paper p-5 ring-1 ring-inset ring-ice-3">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
            <HangingScale grams={gramsOf(v.name)} />
            <div className="cardboard min-w-52 rounded-md px-5 py-3 text-center [rotate:-2deg]">
              <p className="sign text-[18px] text-ink">{v.name}</p>
              <p className="font-marker text-[46px] leading-none text-marker-deep">
                <span className="text-[0.55em] align-[0.4em]">₱</span>
                <Odometer value={pesoNumber(v.price)} />
                <span className="ml-1 text-[0.4em] text-ink/80">/{unitFor(v.name)}</span>
              </p>
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="text-[13px] font-semibold text-ink-2">Pick a size</legend>
            <div className="mt-2 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
              {product.variants.map(x => {
                const on = x.id === v.id;
                return (
                  <label
                    key={x.id}
                    className={`relative flex cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 ring-inset transition-[box-shadow,background-color] ${
                      on ? "bg-mint-soft ring-2 ring-teal-deep" : "bg-ice ring-1 ring-ice-3 hover:ring-ink-3"
                    } ${x.stock <= 0 ? "opacity-60" : ""}`}
                  >
                    <input
                      type="radio"
                      name="variant"
                      className="sr-only"
                      checked={on}
                      onChange={() => {
                        setVariantId(x.id);
                        setQty(1);
                      }}
                    />
                    <span>
                      <span className="block font-semibold text-ink">{x.name}</span>
                      <span className="block text-[13px] text-ink-3">
                        {x.stock <= 0 ? "Sold out today" : x.stock <= LOW_STOCK_AT ? `Only ${x.stock} left` : `${x.stock} on hand`}
                      </span>
                    </span>
                    <span className="tabular font-bold text-ink">₱{pesoNumber(x.price)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-5 flex items-center gap-3">
            <QtyStepper value={qty} max={Math.max(1, left)} onChange={n => setQty(Math.max(1, n))} label={local} size="lg" />
            <button onClick={add} disabled={!canAdd} className={buttonClass("tarp", "lg", "min-w-0 flex-1 whitespace-normal text-center leading-tight")}>
              {added > 0 && left > 0 ? <Check className="size-5" aria-hidden /> : <Plus className="size-5" aria-hidden />}
              {offline
                ? "Ordering paused"
                : v.stock <= 0
                  ? "Sold out today"
                  : left <= 0
                    ? "All of it is in your basket"
                    : `Add to basket · ₱${pesoNumber(v.price * Math.min(qty, left))}`}
            </button>
          </div>
          <p className="mt-3 text-[13px] text-ink-3">
            Stock shown is counted live from our stock ledger.
            {basket.qtyOf(v.id) > 0 && ` ${basket.qtyOf(v.id)} already in your basket.`}
          </p>
        </div>

        {dishes.length > 0 && (
          <div className="mt-7">
            <p className="text-[13px] font-semibold text-ink-2">Good for</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {dishes.map(d => (
                <li key={d.id}>
                  <Link
                    href={`/?dish=${d.id}#catch`}
                    className="inline-flex h-9 items-center rounded-full bg-paper px-3.5 text-sm font-semibold text-ink-2 ring-1 ring-inset ring-ice-3 hover:ring-teal"
                  >
                    {d.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ul className="mt-7 flex flex-col gap-3 border-t border-ice-3 pt-6 text-[15px] text-ink-2">
          <li className="flex gap-3">
            <Snowflake className="mt-0.5 size-5 shrink-0 text-teal-deep" aria-hidden />
            Cleaned and scaled free, then packed on crushed ice in an insulated box.
          </li>
          <li className="flex gap-3">
            <Truck className="mt-0.5 size-5 shrink-0 text-teal-deep" aria-hidden />
            Morning delivery across Dasmariñas City. Free when your order reaches ₱500.
          </li>
        </ul>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ViewTransition, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Plus } from "lucide-react";
import type { ShopProduct } from "@/lib/catalog";
import { LOW_STOCK_AT, splitName, tiltFor, unitFor } from "@/lib/meta";
import { PriceTag } from "@/components/ui/PriceTag";
import { Stamp } from "@/components/ui/motion";
import { buttonClass } from "@/components/ui/primitives";
import { useBasket } from "./basket";

export function ProductCard({ product, offline }: { product: ShopProduct; offline: boolean }) {
  const basket = useBasket();
  const firstInStock = product.variants.find(v => v.stock > 0) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstInStock.id);
  const [added, setAdded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const v = product.variants.find(x => x.id === variantId) ?? firstInStock;
  const { local, english } = splitName(product.name);
  const inBasket = basket.qtyOf(v.id);
  const left = v.stock - inBasket;
  const soldOut = v.stock <= 0;
  const allOut = product.variants.every(x => x.stock <= 0);

  function add() {
    if (left <= 0 || offline) return;
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
      1,
      imgRef.current
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1300);
  }

  return (
    <article className="group relative flex flex-col">
      <Link
        href={`/p/${product.id}`}
        className="relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-ice-2"
        aria-label={`${product.name}, from ₱${Math.round(v.price / 100)}`}
      >
        <ViewTransition name={`photo-${product.id}`} share="morph" default="none">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={product.image}
              alt=""
              loading="lazy"
              className={`size-full object-cover transition-[transform,filter] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.05] ${
                allOut ? "grayscale-[0.7] brightness-95" : ""
              }`}
            />
          ) : (
            <div className="size-full" />
          )}
        </ViewTransition>
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/25 to-transparent" aria-hidden />
        <div className="absolute left-3 top-3">
          <PriceTag name={local} price={v.price} unit={unitFor(v.name)} tilt={tiltFor(product.id)} soldOut={soldOut} size="sm" />
        </div>
        {!soldOut && left > 0 && left <= LOW_STOCK_AT && (
          <span className="absolute bottom-3 right-3 rounded-md bg-tarp px-2 py-1 text-[12px] font-bold text-ink shadow-sm">
            Only {left} left
          </span>
        )}
        {allOut && (
          <span className="absolute bottom-3 right-3">
            <Stamp tone="marker" rotate={-6} className="bg-paper/85 text-[18px]">
              Sold out
            </Stamp>
          </span>
        )}
      </Link>

      <div className="mt-3 flex flex-1 flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="min-w-0 truncate text-[17px] font-bold text-ink">
            <Link href={`/p/${product.id}`} className="hover:underline">
              {local}
            </Link>
          </h3>
          <span className="shrink-0 text-[13px] text-ink-3">{english ?? product.category.name}</span>
        </div>

        {product.variants.length > 1 && (
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`${local} size`}>
            {product.variants.map(x => {
              const on = x.id === v.id;
              return (
                <button
                  key={x.id}
                  role="radio"
                  aria-checked={on}
                  onClick={() => setVariantId(x.id)}
                  className={`relative h-8 rounded-lg px-2.5 text-[13px] font-semibold transition-colors ${
                    on ? "text-white" : "bg-paper text-ink-2 ring-1 ring-inset ring-ice-3 hover:ring-ink-3"
                  } ${x.stock <= 0 ? "line-through decoration-2" : ""}`}
                >
                  {on && (
                    <motion.span
                      layoutId={`variant-${product.id}`}
                      className="absolute inset-0 rounded-lg bg-ink"
                      transition={{ type: "spring", stiffness: 500, damping: 36 }}
                    />
                  )}
                  <span className="relative">{x.name}</span>
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={add}
          disabled={left <= 0 || offline}
          className={buttonClass("tarp", "md", "mt-auto w-full overflow-hidden")}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {added ? (
              <motion.span
                key="added"
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                className="inline-flex items-center gap-1.5"
              >
                <Check className="size-4" aria-hidden /> In your basket
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                className="inline-flex items-center gap-1.5"
              >
                {offline ? (
                  "Ordering paused"
                ) : soldOut ? (
                  "Sold out"
                ) : left <= 0 ? (
                  "All in your basket"
                ) : (
                  <>
                    <Plus className="size-4" aria-hidden /> Add {v.name.toLowerCase()}
                  </>
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </article>
  );
}

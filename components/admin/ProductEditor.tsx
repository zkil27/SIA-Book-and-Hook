"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Plus, Trash2, Wand2 } from "lucide-react";
import { saveProduct } from "@/lib/actions/admin-catalog";
import { categoryHue, splitName, tiltFor, unitFor } from "@/lib/meta";
import { parsePesoInput, pesoNumber } from "@/lib/money";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";

type VariantDraft = { key: string; id?: string; name: string; sku: string; price: string; opening: string; active: boolean; stock?: number };

export type EditorProduct = {
  id?: string;
  name: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  variants: { id: string; name: string; sku: string; price: number; active: boolean; stock: number }[];
};

let seq = 0;
const key = () => `v${++seq}`;

export function ProductEditor({
  product,
  categories,
  images,
}: {
  product: EditorProduct | null;
  categories: { id: string; name: string; slug: string }[];
  images: string[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.variants.length
      ? product.variants.map(v => ({ key: key(), id: v.id, name: v.name, sku: v.sku, price: pesoNumber(v.price).replace(/,/g, ""), opening: "", active: v.active, stock: v.stock }))
      : [{ key: key(), name: "", sku: "", price: "", opening: "", active: true }]
  );
  const [error, setError] = useState<string | null>(null);

  const cat = categories.find(c => c.id === categoryId);
  const preview = variants.find(v => v.active && parsePesoInput(v.price) !== null) ?? variants[0];
  const previewPrice = parsePesoInput(preview?.price ?? "") ?? 0;

  function patch(k: string, p: Partial<VariantDraft>) {
    setVariants(vs => vs.map(v => (v.key === k ? { ...v, ...p } : v)));
  }

  function suggestSku(v: VariantDraft) {
    const prefix = (cat?.slug ?? "gen").slice(0, 5).toUpperCase().replace(/[^A-Z]/g, "");
    const word = (splitName(name).local.split(/\s+/)[0] ?? "ITEM").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const size = v.name.toUpperCase().replace(/[^A-Z0-9.]/g, "").replace(".", "").slice(0, 6);
    return [prefix, word, size].filter(Boolean).join("-");
  }

  function submit() {
    setError(null);
    const parsed = variants.map(v => ({ v, price: parsePesoInput(v.price) }));
    const bad = parsed.find(p => p.price === null);
    if (bad) {
      setError(`Enter a valid price for "${bad.v.name || "the new variant"}" (e.g. 180 or 180.50).`);
      return;
    }
    start(async () => {
      const res = await saveProduct({
        id: product?.id,
        name,
        categoryId,
        description,
        imageUrl,
        variants: parsed.map(({ v, price }) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          price: price ?? 0,
          opening: v.id ? undefined : parseInt(v.opening || "0", 10) || 0,
          active: v.active,
        })),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast({ title: product ? "Product saved" : "Product added", description: name });
      router.push("/admin/products");
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col gap-6">
        <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-deep hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> All products
        </Link>

        <section className="rounded-[var(--radius-card)] bg-paper p-5 ring-1 ring-inset ring-ice-3 sm:p-6">
          <h2 className="text-[15px] font-bold text-ink">Details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="p-name" hint="Filipino name first, English in brackets: Bangus (Milkfish)" className="sm:col-span-2">
              <Input id="p-name" value={name} onChange={e => setName(e.target.value)} placeholder="Galunggong (Round Scad)" />
            </Field>
            <Field label="Category" htmlFor="p-cat">
              <Select id="p-cat" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Description" htmlFor="p-desc" className="sm:col-span-2">
              <Textarea id="p-desc" rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Shown to customers on the product page." />
            </Field>
          </div>
          <fieldset className="mt-5">
            <legend className="text-[13px] font-semibold text-ink-2">Photo (from the shop&apos;s photo library)</legend>
            <div className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-8">
              {images.map(src => (
                <button
                  key={src}
                  onClick={() => setImageUrl(src === imageUrl ? "" : src)}
                  aria-pressed={src === imageUrl}
                  aria-label={src.split("/").pop()}
                  className={`aspect-square overflow-hidden rounded-lg ring-inset transition-[box-shadow,transform] ${src === imageUrl ? "ring-3 ring-teal-deep" : "ring-1 ring-ice-3 hover:scale-[1.04]"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="rounded-[var(--radius-card)] bg-paper p-5 ring-1 ring-inset ring-ice-3 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-ink">Sizes and prices</h2>
            <Button variant="outline" size="sm" onClick={() => setVariants(vs => [...vs, { key: key(), name: "", sku: "", price: "", opening: "", active: true }])}>
              <Plus className="size-4" aria-hidden /> Add variant
            </Button>
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {variants.map(v => (
                <motion.li
                  key={v.key}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`rounded-xl bg-ice p-4 ring-1 ring-inset ring-ice-3 ${v.active ? "" : "opacity-60"}`}
                >
                  <div className="grid gap-3 sm:grid-cols-[1fr_1.2fr_110px_110px]">
                    <Field label="Size / cut" htmlFor={`${v.key}-n`}>
                      <Input id={`${v.key}-n`} value={v.name} onChange={e => patch(v.key, { name: e.target.value })} placeholder="Whole 1kg" />
                    </Field>
                    <Field label="SKU" htmlFor={`${v.key}-s`}>
                      <div className="flex gap-1.5">
                        <Input id={`${v.key}-s`} value={v.sku} onChange={e => patch(v.key, { sku: e.target.value.toUpperCase() })} className="font-mono" placeholder="FISH-GG-1" />
                        <button onClick={() => patch(v.key, { sku: suggestSku(v) })} className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-paper text-teal-deep ring-1 ring-inset ring-ice-3 hover:ring-teal" title="Suggest a SKU" aria-label="Suggest a SKU">
                          <Wand2 className="size-4" />
                        </button>
                      </div>
                    </Field>
                    <Field label="Price (₱)" htmlFor={`${v.key}-p`}>
                      <Input id={`${v.key}-p`} inputMode="decimal" value={v.price} onChange={e => patch(v.key, { price: e.target.value })} placeholder="200" className="tabular text-right" />
                    </Field>
                    {v.id ? (
                      <Field label="On hand">
                        <p className="tabular flex h-11 items-center justify-end font-semibold text-ink">{v.stock}</p>
                      </Field>
                    ) : (
                      <Field label="Opening stock" htmlFor={`${v.key}-o`}>
                        <Input id={`${v.key}-o`} inputMode="numeric" value={v.opening} onChange={e => patch(v.key, { opening: e.target.value.replace(/\D/g, "") })} placeholder="0" className="tabular text-right" />
                      </Field>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[13px]">
                    {v.id ? (
                      <label className="inline-flex cursor-pointer items-center gap-2 font-semibold text-ink-2">
                        <input type="checkbox" checked={v.active} onChange={e => patch(v.key, { active: e.target.checked })} className="size-4" />
                        On sale
                      </label>
                    ) : (
                      <span className="text-ink-3">Opening stock is written to the ledger as &ldquo;Opening stock&rdquo;.</span>
                    )}
                    {!v.id && variants.length > 1 && (
                      <button onClick={() => setVariants(vs => vs.filter(x => x.key !== v.key))} className="inline-flex items-center gap-1 font-semibold text-marker-deep hover:underline">
                        <Trash2 className="size-3.5" aria-hidden /> Remove
                      </button>
                    )}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <p className="mt-3 text-[13px] text-ink-3">Saved variants are never deleted. Untick &ldquo;On sale&rdquo; to take one off the board.</p>
        </section>

        {error && (
          <p role="alert" className="rounded-lg bg-marker-soft px-4 py-3 text-sm font-medium text-marker-deep">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Link href="/admin/products" className="inline-flex h-12 items-center rounded-xl px-5 font-semibold text-ink-2 hover:bg-ice-2">
            Cancel
          </Link>
          <Button size="lg" loading={pending} onClick={submit}>
            {product ? "Save changes" : "Add product"}
          </Button>
        </div>
      </div>

      {/* Live preview: the same price card the storefront shows */}
      <aside className="lg:sticky lg:top-10 lg:h-fit">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-wider text-ink-3">Storefront preview</p>
        <div className="group">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-ice-2">
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="size-full object-cover" />
            )}
            <div className="absolute left-3 top-3">
              <PriceTag name={splitName(name || "Product name").local} price={previewPrice} unit={unitFor(preview?.name || "kg")} tilt={tiltFor(name || "x")} size="sm" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <p className="truncate text-[17px] font-bold text-ink">{splitName(name || "Product name").local}</p>
            <p className="text-[13px] text-ink-3">{splitName(name).english ?? cat?.name}</p>
          </div>
          {cat && (
            <span className="mt-2 inline-block rounded-md px-2 py-0.5 text-[12px] font-bold" style={{ backgroundColor: categoryHue(cat.slug).soft, color: categoryHue(cat.slug).ink }}>
              {cat.name}
            </span>
          )}
        </div>
      </aside>
    </div>
  );
}

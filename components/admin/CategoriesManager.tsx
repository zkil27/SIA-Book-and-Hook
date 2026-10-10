"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, Plus, X } from "lucide-react";
import { createCategory, renameCategory } from "@/lib/actions/admin-catalog";
import { categoryHue } from "@/lib/meta";
import { Button, Input } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";

type Cat = { id: string; name: string; slug: string; products: number };

export function CategoriesManager({ categories }: { categories: Cat[] }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, start] = useTransition();

  function add() {
    start(async () => {
      const res = await createCategory(name);
      if (!res.ok) return toast({ title: "Category not added", description: res.error, tone: "error" });
      toast({ title: `Added "${name.trim()}"` });
      setName("");
    });
  }

  function rename(c: Cat) {
    start(async () => {
      const res = await renameCategory(c.id, draft);
      if (!res.ok) return toast({ title: "Not renamed", description: res.error, tone: "error" });
      const old = c.name;
      setEditing(null);
      toast({
        title: `Renamed to "${draft.trim()}"`,
        undo: async () => {
          await renameCategory(c.id, old);
        },
      });
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <ul className="divide-y divide-ice-2 overflow-hidden rounded-[var(--radius-card)] bg-paper ring-1 ring-inset ring-ice-3">
        {categories.map(c => {
          const hue = categoryHue(c.slug);
          const isEditing = editing === c.id;
          return (
            <li key={c.id} className="flex items-center gap-4 px-4 py-3">
              <span className="size-8 shrink-0 rounded-lg" style={{ backgroundColor: hue.bg }} aria-hidden />
              {isEditing ? (
                <form
                  className="flex flex-1 items-center gap-2"
                  onSubmit={e => {
                    e.preventDefault();
                    rename(c);
                  }}
                >
                  <Input autoFocus value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Escape" && setEditing(null)} aria-label={`New name for ${c.name}`} className="h-10" />
                  <Button type="submit" size="sm" loading={pending} aria-label="Save name">
                    <Check className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(null)} aria-label="Cancel">
                    <X className="size-4" />
                  </Button>
                </form>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{c.name}</p>
                    <p className="text-[13px] text-ink-3">
                      {c.products} product{c.products === 1 ? "" : "s"} · <span className="font-mono">/{c.slug}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditing(c.id);
                      setDraft(c.name);
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-ink-2 hover:bg-ice"
                  >
                    <Pencil className="size-4" aria-hidden /> Rename
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ul>
      <form
        onSubmit={e => {
          e.preventDefault();
          add();
        }}
        className="h-fit rounded-[var(--radius-card)] bg-paper p-5 ring-1 ring-inset ring-ice-3"
      >
        <p className="font-bold text-ink">New category</p>
        <p className="mt-1 text-[13px] text-ink-3">It shows on the storefront once it has a product on sale.</p>
        <Input className="mt-4" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Dried fish" aria-label="Category name" />
        <Button type="submit" className="mt-3 w-full" loading={pending} disabled={name.trim().length < 2}>
          <Plus className="size-4" aria-hidden /> Add category
        </Button>
        <p className="mt-3 text-[12px] text-ink-3">Renaming keeps the web address, so links and colours stay the same.</p>
      </form>
    </div>
  );
}

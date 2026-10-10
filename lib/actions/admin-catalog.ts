"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { dbError, fail, ok, refreshAll, serializable, UserError, type ActionResult } from "./util";

// ── Products ─────────────────────────────────────────────────────────────────

const VariantInput = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Every variant needs a name (e.g. 500g, Whole 1kg)."),
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{3,40}$/, "SKUs use letters, numbers and dashes only."),
  price: z.number().int().min(100, "Price must be at least ₱1.").max(10_000_000),
  opening: z.number().int().min(0).max(100_000).optional(),
  active: z.boolean(),
});

const ProductInput = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Enter a product name."),
  categoryId: z.string().min(1, "Pick a category."),
  description: z.string().trim().max(300).optional(),
  imageUrl: z.string().trim().startsWith("/").optional().or(z.literal("")),
  variants: z.array(VariantInput).min(1, "Add at least one variant."),
});

export type ProductInputT = z.infer<typeof ProductInput>;

export async function saveProduct(input: ProductInputT): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  const parsed = ProductInput.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the product details.");
  const p = parsed.data;
  const skus = p.variants.map(v => v.sku);
  if (new Set(skus).size !== skus.length) return fail("Two variants share the same SKU.");

  try {
    const id = await serializable(async tx => {
      const clash = await tx.productVariant.findFirst({
        where: { sku: { in: skus }, NOT: { id: { in: p.variants.map(v => v.id).filter(Boolean) as string[] } } },
        select: { sku: true },
      });
      if (clash) throw new UserError(`SKU ${clash.sku} is already used by another product.`);

      const data = {
        name: p.name,
        categoryId: p.categoryId,
        description: p.description || null,
        imageUrl: p.imageUrl || null,
      };
      const product = p.id
        ? await tx.product.update({ where: { id: p.id }, data })
        : await tx.product.create({ data });

      for (const v of p.variants) {
        if (v.id) {
          const current = await tx.productVariant.findUnique({ where: { id: v.id } });
          if (!current || current.productId !== product.id) throw new UserError("A variant no longer exists.");
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              name: v.name,
              sku: v.sku,
              active: v.active,
              priceCentavos: v.price,
              ...(current.priceCentavos !== v.price ? { priceUpdatedAt: new Date() } : {}),
            },
          });
        } else {
          const created = await tx.productVariant.create({
            data: { productId: product.id, name: v.name, sku: v.sku, priceCentavos: v.price, active: v.active },
          });
          if (v.opening && v.opening > 0) {
            await tx.stockMovement.create({
              data: { variantId: created.id, quantity: v.opening, reason: "Opening stock", actorId: admin.id },
            });
          }
        }
      }
      return product.id;
    });
    refreshAll();
    return ok({ id });
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}

/** Archive (soft delete) or restore a product. Never a hard delete. */
export async function setProductActive(productId: string, active: boolean): Promise<ActionResult> {
  await requireAdmin();
  try {
    await prisma.product.update({ where: { id: productId }, data: { active } });
    refreshAll();
    return ok(null);
  } catch (err) {
    return dbError(err);
  }
}

// ── Prices ───────────────────────────────────────────────────────────────────

const PriceChange = z.object({ variantId: z.string().min(1), price: z.number().int().min(100).max(10_000_000) });

/** Save many prices at once (Today's prices board, inline edits, and undo). */
export async function savePrices(
  changes: { variantId: string; price: number }[]
): Promise<ActionResult<{ changed: { variantId: string; from: number; to: number }[] }>> {
  await requireAdmin();
  const parsed = z.array(PriceChange).safeParse(changes);
  if (!parsed.success) return fail("Prices must be at least ₱1.");
  try {
    const changed = await serializable(async tx => {
      const current = await tx.productVariant.findMany({
        where: { id: { in: parsed.data.map(c => c.variantId) } },
        select: { id: true, priceCentavos: true },
      });
      const was = new Map(current.map(c => [c.id, c.priceCentavos]));
      const out: { variantId: string; from: number; to: number }[] = [];
      const now = new Date();
      for (const c of parsed.data) {
        const from = was.get(c.variantId);
        if (from === undefined || from === c.price) continue;
        await tx.productVariant.update({
          where: { id: c.variantId },
          data: { priceCentavos: c.price, priceUpdatedAt: now },
        });
        out.push({ variantId: c.variantId, from, to: c.price });
      }
      return out;
    });
    refreshAll();
    return ok({ changed });
  } catch (err) {
    return dbError(err);
  }
}

// ── Categories ───────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createCategory(name: string): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const clean = name.trim();
  if (clean.length < 2) return fail("Enter a category name.");
  const slug = slugify(clean);
  if (!slug) return fail("Use letters or numbers in the name.");
  try {
    const exists = await prisma.category.findUnique({ where: { slug } });
    if (exists) return fail(`"${exists.name}" already exists.`);
    const c = await prisma.category.create({ data: { name: clean, slug } });
    refreshAll();
    return ok({ id: c.id });
  } catch (err) {
    return dbError(err);
  }
}

/** Rename keeps the slug, so storefront links and hues stay stable. */
export async function renameCategory(id: string, name: string): Promise<ActionResult> {
  await requireAdmin();
  const clean = name.trim();
  if (clean.length < 2) return fail("Enter a category name.");
  try {
    await prisma.category.update({ where: { id }, data: { name: clean } });
    refreshAll();
    return ok(null);
  } catch (err) {
    return dbError(err);
  }
}

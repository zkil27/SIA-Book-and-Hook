"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { movementRef } from "@/lib/meta";
import { dbError, fail, ok, refreshAll, serializable, UserError, type ActionResult } from "./util";

/**
 * Every stock change in the system goes through these actions, and every one
 * of them only ever INSERTS StockMovement rows. Corrections and undos are
 * compensating movements; nothing is edited or deleted.
 */

async function stockOf(tx: Pick<typeof prisma, "stockMovement">, variantId: string): Promise<number> {
  const agg = await tx.stockMovement.aggregate({ where: { variantId }, _sum: { quantity: true } });
  return agg._sum.quantity ?? 0;
}

const Adjust = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().refine(n => n !== 0, "Enter a quantity other than zero."),
  reason: z.string().trim().min(2, "Pick a reason."),
  note: z.string().trim().max(140).optional(),
});

export async function adjustStock(
  input: z.infer<typeof Adjust>
): Promise<ActionResult<{ movementId: string; before: number; after: number }>> {
  const admin = await requireAdmin();
  const parsed = Adjust.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the adjustment.");
  const { variantId, quantity, reason, note } = parsed.data;
  try {
    const res = await serializable(async tx => {
      const before = await stockOf(tx, variantId);
      if (before + quantity < 0) {
        throw new UserError(`Only ${before} on hand. You can't take out ${-quantity}.`);
      }
      const m = await tx.stockMovement.create({
        data: { variantId, quantity, reason: note ? `${reason} — ${note}` : reason, actorId: admin.id },
      });
      return { movementId: m.id, before, after: before + quantity };
    });
    refreshAll();
    return ok(res);
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}

/** Write the exact opposite of a movement (used by Undo and "Counter this entry"). */
export async function counterMovement(movementId: string, label = "Undo"): Promise<ActionResult<{ movementId: string }>> {
  const admin = await requireAdmin();
  try {
    const res = await serializable(async tx => {
      const m = await tx.stockMovement.findUnique({ where: { id: movementId } });
      if (!m) throw new UserError("Movement not found.");
      const before = await stockOf(tx, m.variantId);
      if (before - m.quantity < 0) throw new UserError("Not enough stock on hand to reverse that movement.");
      const c = await tx.stockMovement.create({
        data: {
          variantId: m.variantId,
          quantity: -m.quantity,
          reason: `${label} of ${movementRef(m.id)}`,
          actorId: admin.id,
        },
      });
      return { movementId: c.id };
    });
    refreshAll();
    return ok(res);
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}

/** Counter sale for a walk-in customer. */
export async function walkInSale(
  variantId: string,
  qty: number
): Promise<ActionResult<{ movementId: string; after: number }>> {
  const admin = await requireAdmin();
  if (!Number.isInteger(qty) || qty < 1) return fail("Enter how many were sold.");
  try {
    const res = await serializable(async tx => {
      const before = await stockOf(tx, variantId);
      if (qty > before) throw new UserError(before <= 0 ? "That item is sold out." : `Only ${before} on hand.`);
      const m = await tx.stockMovement.create({
        data: { variantId, quantity: -qty, reason: "Walk-in sale", actorId: admin.id },
      });
      return { movementId: m.id, after: before - qty };
    });
    refreshAll();
    return ok(res);
  } catch (err) {
    if (err instanceof UserError) return fail(err.message);
    return dbError(err);
  }
}

/**
 * Morning count: staff enter the physical count for each variant; the
 * difference from the ledger is written as one "Morning count" movement.
 * Matching counts write nothing.
 */
export async function saveMorningCount(
  counts: { variantId: string; counted: number }[]
): Promise<ActionResult<{ adjusted: number; checked: number }>> {
  const admin = await requireAdmin();
  const valid = counts.filter(c => Number.isInteger(c.counted) && c.counted >= 0);
  if (valid.length === 0) return fail("Enter at least one count.");
  try {
    const adjusted = await serializable(async tx => {
      const sums = await tx.stockMovement.groupBy({
        by: ["variantId"],
        where: { variantId: { in: valid.map(c => c.variantId) } },
        _sum: { quantity: true },
      });
      const system = new Map(sums.map(s => [s.variantId, s._sum.quantity ?? 0]));
      const rows = valid
        .map(c => ({ ...c, system: system.get(c.variantId) ?? 0 }))
        .filter(c => c.counted !== c.system)
        .map(c => ({
          variantId: c.variantId,
          quantity: c.counted - c.system,
          reason: `Morning count (counted ${c.counted}, system had ${c.system})`,
          actorId: admin.id,
        }));
      if (rows.length) await tx.stockMovement.createMany({ data: rows });
      return rows.length;
    });
    refreshAll();
    return ok({ adjusted, checked: valid.length });
  } catch (err) {
    return dbError(err);
  }
}

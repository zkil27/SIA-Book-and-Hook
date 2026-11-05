import "server-only";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

export const ok = <T,>(data: T): ActionResult<T> => ({ ok: true, data });
export const fail = (error: string): ActionResult<never> => ({ ok: false, error });

/** Friendly message for database failures; rethrows Next.js control flow. */
export function dbError(err: unknown): ActionResult<never> {
  if (err && typeof err === "object" && "digest" in err) throw err; // redirect()/notFound()
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return fail("Can't reach the store database right now. Try again in a minute.");
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return fail("That value is already used. Pick a different one.");
    if (err.code === "P2034") return fail("Someone else changed this at the same moment. Please try again.");
    if (err.code === "P1001" || err.code === "P1002") {
      return fail("Can't reach the store database right now. Try again in a minute.");
    }
  }
  console.error("[action]", err);
  return fail("Something went wrong saving that. Nothing was changed.");
}

/** Run a serializable transaction, retrying once on a write conflict. */
export async function serializable<T>(run: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  const opts = { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 15000 };
  try {
    return await prisma.$transaction(run, opts);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2034") {
      return prisma.$transaction(run, opts);
    }
    throw err;
  }
}

/** Expected-condition error thrown inside a transaction to abort it. */
export class UserError extends Error {}

/**
 * What a write affects, so an action refreshes only those views instead of
 * the whole app:
 * - "admin":  every /admin page (the admin layout's badges included)
 * - "orders": the customer's order views (/track, /account)
 * - "shop":   storefront pages that show stock or price
 * In a server action this also re-renders the page the user is on when it is
 * one of these paths.
 */
export type Area = "admin" | "orders" | "shop";

export function invalidate(...areas: Area[]) {
  const set = new Set(areas);
  if (set.has("admin")) revalidatePath("/admin", "layout");
  if (set.has("orders")) {
    revalidatePath("/track");
    revalidatePath("/account");
  }
  if (set.has("shop")) {
    revalidatePath("/", "page");
    revalidatePath("/p/[id]", "page");
    revalidatePath("/checkout");
  }
}

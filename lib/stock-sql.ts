import { Prisma } from "@prisma/client";

/**
 * Ledger-derived stock, computed in the database instead of by loading every
 * StockMovement row into Node. Stock is still never stored: it is the sum of a
 * variant's movements, exactly as before (see lib/ledger.ts for the reference
 * JavaScript implementation that `lib/dev/checks.ts` compares against).
 *
 * Takes the client as a parameter (no `server-only`) so CLI scripts and
 * interactive transactions can use the same functions.
 */

/** The app client or an interactive-transaction client (the app client satisfies this type). */
export type Db = Prisma.TransactionClient;

/** Current stock per variant (sum of movements). Variants with no movements are absent (= 0). */
export async function stockByVariant(db: Db, ids?: string[]): Promise<Map<string, number>> {
  if (ids && ids.length === 0) return new Map();
  const sums = await db.stockMovement.groupBy({
    by: ["variantId"],
    where: ids ? { variantId: { in: ids } } : undefined,
    _sum: { quantity: true },
  });
  return new Map(sums.map(s => [s.variantId, s._sum.quantity ?? 0]));
}

/**
 * Received-at time of the oldest stock still on hand, per variant, with FIFO
 * lots: outflows consume the oldest inflows first, so what remains is the
 * newest inflows adding up to the current balance. An inflow row is (at least
 * partly) still on hand when the units received after it are fewer than the
 * balance: `cumulative-from-newest − quantity < stock`.
 *
 * Matches `oldestRemainingAt` for every variant whose running balance never
 * went negative (the integrity checks flag any that did).
 */
export async function oldestInflowByVariant(db: Db, ids?: string[]): Promise<Map<string, Date>> {
  if (ids && ids.length === 0) return new Map();
  const scope = ids ? Prisma.sql`AND "variantId" IN (${Prisma.join(ids)})` : Prisma.empty;
  const rows = await db.$queryRaw<{ variantId: string; oldest: Date }[]>`
    WITH bal AS (
      SELECT "variantId", SUM("quantity") AS stock
      FROM "StockMovement"
      WHERE TRUE ${scope}
      GROUP BY "variantId"
    ),
    inflow AS (
      SELECT "variantId", "createdAt", "quantity",
        SUM("quantity") OVER (
          PARTITION BY "variantId" ORDER BY "createdAt" DESC, "id" DESC
        ) AS cum
      FROM "StockMovement"
      WHERE "quantity" > 0 ${scope}
    )
    SELECT i."variantId", MIN(i."createdAt") AS oldest
    FROM inflow i
    JOIN bal b ON b."variantId" = i."variantId"
    WHERE b.stock > 0 AND i.cum - i."quantity" < b.stock
    GROUP BY i."variantId"
  `;
  return new Map(rows.map(r => [r.variantId, r.oldest]));
}

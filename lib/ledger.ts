/**
 * Pure ledger math. Stock is never stored: it is the sum of a variant's
 * StockMovement rows. These helpers work on movement lists already loaded.
 */

export type MovementLite = { quantity: number; createdAt: Date };

export function sumStock(movements: MovementLite[]): number {
  return movements.reduce((s, m) => s + m.quantity, 0);
}

/**
 * Received-at time of the oldest stock still on hand, evaluating lots FIFO:
 * every outflow consumes the oldest remaining inflow first.
 */
export function oldestRemainingAt(movements: MovementLite[]): Date | null {
  const lots: { quantity: number; createdAt: Date }[] = [];
  const sorted = [...movements].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  for (const m of sorted) {
    if (m.quantity > 0) {
      lots.push({ quantity: m.quantity, createdAt: m.createdAt });
      continue;
    }
    let toConsume = -m.quantity;
    while (toConsume > 0 && lots.length > 0) {
      const lot = lots[0];
      const used = Math.min(lot.quantity, toConsume);
      lot.quantity -= used;
      toConsume -= used;
      if (lot.quantity === 0) lots.shift();
    }
  }
  return lots[0]?.createdAt ?? null;
}

export function ageInDays(since: Date | null, now: Date = new Date()): number | null {
  if (!since) return null;
  return Math.max(0, Math.floor((now.getTime() - since.getTime()) / 86_400_000));
}

/**
 * Money helpers. Money is ALWAYS integer centavos in logic and storage
 * (₱180.50 → 18050). Conversion to pesos happens only here, for display.
 */

const pesoWhole = new Intl.NumberFormat("en-PH", { maximumFractionDigits: 0 });
const pesoExact = new Intl.NumberFormat("en-PH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** "₱1,234" when the amount is whole pesos, "₱1,234.50" otherwise. */
export function peso(amount: number): string {
  const whole = Math.trunc(amount / 100);
  const cents = Math.abs(amount % 100);
  if (cents === 0) return `₱${pesoWhole.format(whole)}`;
  return `₱${pesoExact.format(amount / 100)}`;
}

/** Bare number for price tags: "180" or "180.50". */
export function pesoNumber(amount: number): string {
  const cents = Math.abs(amount % 100);
  const whole = pesoWhole.format(Math.trunc(amount / 100));
  return cents === 0 ? whole : `${whole}.${String(cents).padStart(2, "0")}`;
}

/**
 * Parse a peso amount typed by staff ("180", "180.5", "1,250.00") into integer
 * centavos without ever going through a float. Returns null when invalid.
 */
export function parsePesoInput(input: string): number | null {
  const s = input.replace(/[₱,\s]/g, "");
  const m = /^(\d{1,7})(?:\.(\d{1,2}))?$/.exec(s);
  if (!m) return null;
  const whole = parseInt(m[1], 10);
  const frac = m[2] ? parseInt(m[2].padEnd(2, "0"), 10) : 0;
  return whole * 100 + frac;
}

/** Free delivery threshold and flat fee (scope: free over ₱500). */
export const FREE_DELIVERY_MIN = 50000;
export const DELIVERY_FEE = 5000;

export function deliveryFeeFor(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
}

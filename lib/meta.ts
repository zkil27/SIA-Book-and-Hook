/**
 * Shared display metadata: category hues, order codes and statuses, stock
 * thresholds. Safe to import from client and server.
 */

// ── Category hues ────────────────────────────────────────────────────────────
// One hue per category, carried on every surface (shelf tags, admin chips).
const HUES: Record<string, { bg: string; ink: string; soft: string }> = {
  fish: { bg: "#2FA4BC", ink: "#0B4F5C", soft: "#DDF2F6" },
  shellfish: { bg: "#E8743B", ink: "#7A3210", soft: "#FCE7DA" },
  crab: { bg: "#D7263D", ink: "#7E1220", soft: "#FADDE1" },
  squid: { bg: "#7B5CD6", ink: "#3B2A78", soft: "#ECE6FA" },
  prepared: { bg: "#2E9E5B", ink: "#14532F", soft: "#DDF3E6" },
};
const EXTRA = [
  { bg: "#C88A1E", ink: "#5E3F07", soft: "#F8EBCF" },
  { bg: "#3D6FD9", ink: "#1A346E", soft: "#E0E9FB" },
  { bg: "#B5487A", ink: "#5C1E3B", soft: "#F6E0EA" },
];

export function categoryHue(slug: string) {
  if (HUES[slug]) return HUES[slug];
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return EXTRA[h % EXTRA.length];
}

/** Stable small tilt (degrees) per id, so price cards sit at varied angles. */
export function tiltFor(id: string, range = 4): number {
  let h = 0;
  for (const ch of id) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return ((h % 1000) / 1000) * range * 2 - range;
}

/** "Bangus (Milkfish)" → { local: "Bangus", english: "Milkfish" }. */
export function splitName(name: string): { local: string; english: string | null } {
  const m = /^(.*?)\s*\((.+)\)\s*$/.exec(name);
  if (!m) return { local: name, english: null };
  return { local: m[1], english: m[2] };
}

/** Short unit for a price tag from a variant name: "Whole 1kg" → "kg". */
export function unitFor(variantName: string): string {
  const n = variantName.toLowerCase();
  if (/1\.5\s*kg/.test(n)) return "1.5kg";
  if (/\b1\s*kg|\bkg/.test(n)) return "kg";
  const g = /(\d+)\s*g\b/.exec(n);
  if (g) return `${g[1]}g`;
  if (n.includes("doz")) return "doz";
  if (n.includes("pack") || n.includes("pc")) return "pack";
  if (n.includes("tub")) return "tub";
  return variantName;
}

// ── Orders ───────────────────────────────────────────────────────────────────
export type OrderStatusKey = "PENDING" | "CONFIRMED" | "READY" | "COMPLETED" | "CANCELLED";

export function orderCode(orderNumber: number): string {
  return `HB-${String(orderNumber).padStart(4, "0")}`;
}

/** "HB-0005", "hb5", "#HB-005", "5" → 5. */
export function parseOrderCode(input: string): number | null {
  const m = /(\d{1,7})\s*$/.exec(input.trim());
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return n > 0 ? n : null;
}

export const STATUS_META: Record<
  OrderStatusKey,
  { label: string; customer: string; tone: "yellow" | "teal" | "violet" | "green" | "gray"; next?: OrderStatusKey; nextLabel?: string }
> = {
  PENDING: { label: "Pending", customer: "Order placed", tone: "yellow", next: "CONFIRMED", nextLabel: "Confirm" },
  CONFIRMED: { label: "Confirmed", customer: "Confirmed and packing", tone: "teal", next: "READY", nextLabel: "Mark ready" },
  READY: { label: "Out for delivery", customer: "Out for delivery", tone: "violet", next: "COMPLETED", nextLabel: "Mark delivered" },
  COMPLETED: { label: "Delivered", customer: "Delivered", tone: "green" },
  CANCELLED: { label: "Cancelled", customer: "Cancelled", tone: "gray" },
};

export const STATUS_FLOW: OrderStatusKey[] = ["PENDING", "CONFIRMED", "READY", "COMPLETED"];

export const PAYMENT_LABEL = { GCASH: "GCash", COD: "Cash on delivery" } as const;

export const DELIVERY_SLOTS = ["6:00–8:00 AM", "8:00–10:00 AM", "10:00 AM–12:00 NN"] as const;

// ── Stock ────────────────────────────────────────────────────────────────────
export const LOW_STOCK_AT = 10;
export const TO_SALE_AFTER_DAYS = 7;

export type StockState = "in" | "low" | "out";
export function stockState(stock: number): StockState {
  if (stock <= 0) return "out";
  if (stock <= LOW_STOCK_AT) return "low";
  return "in";
}

/** Movement reasons staff pick from; free text is still allowed as a note. */
export const ADJUST_REASONS = [
  { id: "Restock", sign: 1, label: "Restock" },
  { id: "Return", sign: 1, label: "Customer return" },
  { id: "Spoilage", sign: -1, label: "Spoilage" },
  { id: "Damaged", sign: -1, label: "Damaged in transit" },
  { id: "Miscount", sign: 0, label: "Miscount" },
] as const;

export function movementRef(id: string): string {
  return `MV-${id.slice(-6).toUpperCase()}`;
}

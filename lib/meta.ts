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
export type OrderStatusKey = "PENDING" | "CONFIRMED" | "PACKED" | "READY" | "COMPLETED" | "CANCELLED";

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

/**
 * Staff see one vocabulary everywhere: the chip on an order, the Orders tab
 * that lists it and the pipeline strip all say the same words, phrased as
 * the job waiting on it ("To confirm", "To pack"). `done` is the past-tense
 * event used on timelines and toasts ("Confirmed", "Packed").
 */
export const STATUS_META: Record<
  OrderStatusKey,
  {
    label: string;
    done: string;
    /** Short status for customer-facing chips (account, tracking). */
    shopLabel: string;
    customer: string;
    tone: "yellow" | "teal" | "cardboard" | "violet" | "green" | "gray";
    next?: OrderStatusKey;
    nextLabel?: string;
  }
> = {
  PENDING: { label: "To confirm", done: "Order placed", shopLabel: "Pending", customer: "Order placed", tone: "yellow", next: "CONFIRMED", nextLabel: "Confirm" },
  CONFIRMED: { label: "To pack", done: "Confirmed", shopLabel: "Confirmed", customer: "Confirmed, being packed", tone: "teal", next: "PACKED", nextLabel: "Mark packed" },
  // Packed → On the truck happens only when the driver starts the trip.
  PACKED: { label: "Packed", done: "Packed", shopLabel: "Packed", customer: "Packed, waiting for the truck", tone: "cardboard", next: "READY" },
  READY: { label: "On the truck", done: "Put on the truck", shopLabel: "On the truck", customer: "On the truck to you", tone: "violet", next: "COMPLETED", nextLabel: "Mark delivered" },
  COMPLETED: { label: "Delivered", done: "Delivered", shopLabel: "Delivered", customer: "Delivered", tone: "green" },
  CANCELLED: { label: "Cancelled", done: "Cancelled", shopLabel: "Cancelled", customer: "Cancelled", tone: "gray" },
};

export const STATUS_FLOW: OrderStatusKey[] = ["PENDING", "CONFIRMED", "PACKED", "READY", "COMPLETED"];

/** Statuses still in the store's hands (shown in admin "to handle" lists). */
export const OPEN_STATUSES = ["PENDING", "CONFIRMED", "PACKED", "READY"] as const satisfies readonly OrderStatusKey[];

/**
 * Statuses the office may advance with one tap. Packed → On the truck belongs
 * to the trip, and On the truck → Delivered to the driver's handoff (or an
 * office override with a written reason).
 */
export const OFFICE_ADVANCE: readonly OrderStatusKey[] = ["PENDING", "CONFIRMED"];

// ── Delivery trips ───────────────────────────────────────────────────────────
export type TripStatusKey = "PLANNED" | "OUT" | "RETURNED" | "REMITTED";

export const TRIP_STATUS_META: Record<TripStatusKey, { label: string; tone: "yellow" | "violet" | "teal" | "green" }> = {
  PLANNED: { label: "Being loaded", tone: "yellow" },
  OUT: { label: "On the road", tone: "violet" },
  RETURNED: { label: "Closed", tone: "green" },
  REMITTED: { label: "Closed", tone: "green" },
};

/** Hours before an unconfirmed GCash order is flagged as stale (holding stock). */
export const STALE_GCASH_HOURS = 2;

/** Payment state shown in admin tables/drawers: GCash settles on confirm, COD on delivery. */
export function paymentStatusOf(
  payment: "GCASH" | "COD",
  status: OrderStatusKey
): { label: string; tone: "yellow" | "green" | "teal" | "gray" } {
  if (status === "CANCELLED") return { label: payment === "GCASH" ? "GCash" : "COD", tone: "gray" };
  if (payment === "GCASH") {
    return status === "PENDING" ? { label: "GCash · On hold", tone: "yellow" } : { label: "GCash · Paid", tone: "green" };
  }
  return status === "COMPLETED" ? { label: "COD · Collected", tone: "green" } : { label: "COD · On delivery", tone: "teal" };
}

export function tripCode(tripNumber: number): string {
  return `T-${String(tripNumber).padStart(3, "0")}`;
}

/** Orders per delivery slot per day: what one truck run can carry. */
export const SLOT_CAPACITY = 12;

/** Wrong PIN entries before the PIN locks and only a logged reason can finish the stop. */
export const PIN_MAX_TRIES = 5;

/** Suggested vehicle labels (free text is allowed). Labels only, no fleet records. */
export const VEHICLES = ["Truck 1", "Motorbike 1", "Motorbike 2"] as const;

/** Why a driver finished a stop without the customer's PIN. */
export const HANDOFF_FALLBACK_REASONS = [
  "Received by a household member",
  "Customer couldn't open their PIN",
  "PIN locked after wrong tries",
  "Order placed before PINs",
] as const;

/** Why a driver brought an order back. */
export const FAILED_STOP_REASONS = [
  "No one home",
  "Couldn't find the address",
  "Couldn't reach the customer by phone",
  "Customer refused the order",
  "Road blocked or flooded",
] as const;

/**
 * The truck's fixed loop out of the stall, so drafted trips start in a
 * sensible stop order. Set by the store (fictional); the office can reorder.
 * Barangays not listed go last.
 */
export const BARANGAY_ROUTE = [
  "Zone I", "Zone II", "Zone III", "Zone IV", "San Agustin", "Burol", "Datu Esmael", "Victoria Reyes",
  "Sampaloc", "San Jose", "Santa Cruz", "Santa Fe", "San Miguel", "Luzviminda", "Emmanuel Bergado",
  "Fatima", "Sabang", "Langkaan", "Salitran", "Paliparan", "Salawag",
];

export function routeRank(barangay: string): number {
  const i = BARANGAY_ROUTE.findIndex(b => b.toLowerCase() === barangay.trim().toLowerCase());
  return i === -1 ? BARANGAY_ROUTE.length : i;
}

/** Slot order for sorting: 0, 1, 2; unknown slots last. */
export function slotRank(slot: string): number {
  const i = (DELIVERY_SLOTS as readonly string[]).indexOf(slot);
  return i === -1 ? DELIVERY_SLOTS.length : i;
}

/** "6:00–8:00 AM" → "6–8 AM", for tight spots like the bag label. */
export function shortSlot(slot: string): string {
  return slot.replace(/:00/g, "").replace(/ AM–(\d+) AM/, "–$1 AM").replace("12 NN", "12 noon");
}

/** "Maria" from "Maria Santos": what a bag label and the load list show. */
export const firstName = (name: string) => name.trim().split(/\s+/)[0] || "Customer";

export const PAYMENT_LABEL = { GCASH: "GCash", COD: "Cash on delivery" } as const;

export const DELIVERY_SLOTS = ["6:00–8:00 AM", "8:00–10:00 AM", "10:00 AM–12:00 NN"] as const;

/** The part of a delivery that can be saved on an account. */
export type DeliveryContact = { phone: string; address: string; barangay: string };

/** Philippine mobile number, e.g. 0917 123 4567. */
export const PHONE_RE = /^(\+?63|0)9\d{2}[\s-]?\d{3}[\s-]?\d{4}$/;

export const BARANGAYS = [
  "Burol", "Datu Esmael", "Emmanuel Bergado", "Fatima", "Langkaan", "Luzviminda", "Paliparan",
  "Sabang", "Salawag", "Salitran", "Sampaloc", "San Agustin", "San Jose", "San Miguel",
  "Santa Cruz", "Santa Fe", "Victoria Reyes", "Zone I", "Zone II", "Zone III", "Zone IV",
];

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

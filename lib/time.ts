/**
 * Store-local time. The shop runs on Philippine time (UTC+8, no DST), and
 * "today" must mean the shop's day, not the server's (Vercel runs in UTC).
 */
const OFFSET_MS = 8 * 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;

/** Start of the Manila calendar day containing `at`, as a UTC Date. */
export function startOfShopDay(at: Date = new Date()): Date {
  const local = new Date(at.getTime() + OFFSET_MS);
  const midnightLocal = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  return new Date(midnightLocal - OFFSET_MS);
}

export function daysAgo(n: number, at: Date = new Date()): Date {
  return new Date(startOfShopDay(at).getTime() - n * DAY_MS);
}

const dateFmt = new Intl.DateTimeFormat("en-PH", {
  timeZone: "Asia/Manila",
  month: "short",
  day: "numeric",
});
const dateTimeFmt = new Intl.DateTimeFormat("en-PH", {
  timeZone: "Asia/Manila",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const timeFmt = new Intl.DateTimeFormat("en-PH", {
  timeZone: "Asia/Manila",
  hour: "numeric",
  minute: "2-digit",
});
const weekdayFmt = new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", weekday: "short" });
const longDateFmt = new Intl.DateTimeFormat("en-PH", {
  timeZone: "Asia/Manila",
  weekday: "long",
  month: "long",
  day: "numeric",
});

export const fmtDate = (d: Date | string) => dateFmt.format(new Date(d));
export const fmtDateTime = (d: Date | string) => dateTimeFmt.format(new Date(d));
export const fmtTime = (d: Date | string) => timeFmt.format(new Date(d));
export const fmtWeekday = (d: Date | string) => weekdayFmt.format(new Date(d));
export const fmtLongDate = (d: Date | string) => longDateFmt.format(new Date(d));

/** "just now", "12 min ago", "3 h ago", "2 d ago". */
export function ago(d: Date | string, now: Date = new Date()): string {
  const s = Math.max(0, Math.round((now.getTime() - new Date(d).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

/** Shop hours: Mon–Sat 6:00 AM – 6:00 PM (Manila). */
export function shopIsOpen(at: Date = new Date()): boolean {
  const local = new Date(at.getTime() + OFFSET_MS);
  const day = local.getUTCDay(); // 0 = Sunday
  const hour = local.getUTCHours();
  return day !== 0 && hour >= 6 && hour < 18;
}

/** Hour of day in Manila, 0–23. */
export function shopHour(at: Date = new Date()): number {
  return new Date(at.getTime() + OFFSET_MS).getUTCHours();
}

// ── Delivery days ────────────────────────────────────────────────────────────
// A delivery day is a Manila calendar date. Prisma `@db.Date` columns hold it
// as a Date at UTC midnight of that day, so these helpers work in UTC parts.

/** Orders placed before this Manila hour go out the next morning. */
export const ORDER_CUTOFF_HOUR = 21;

/** The Manila calendar day containing `at`, as a UTC-midnight Date. */
export function shopDate(at: Date = new Date()): Date {
  const local = new Date(at.getTime() + OFFSET_MS);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
}

export function addDays(day: Date, n: number): Date {
  return new Date(day.getTime() + n * DAY_MS);
}

/**
 * The morning an order placed at `placedAt` is delivered: the next day when
 * ordered before 9 PM, otherwise the day after. The store is closed on
 * Sundays, so a Sunday delivery moves to Monday.
 */
export function deliveryDateFor(placedAt: Date = new Date()): Date {
  let day = addDays(shopDate(placedAt), shopHour(placedAt) >= ORDER_CUTOFF_HOUR ? 2 : 1);
  if (day.getUTCDay() === 0) day = addDays(day, 1);
  return day;
}

/** "2026-11-08" for a delivery day (URL- and form-safe). */
export const dayKey = (day: Date) => day.toISOString().slice(0, 10);

/** Parse a "YYYY-MM-DD" day key; null when malformed. */
export function parseDayKey(key: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const d = new Date(`${key}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const dayFmt = new Intl.DateTimeFormat("en-PH", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" });
const longDayFmt = new Intl.DateTimeFormat("en-PH", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" });

/** "Sat, Nov 8" for a delivery day. */
export const fmtDay = (day: Date | string) => dayFmt.format(new Date(day));
/** "Saturday, November 8" for a delivery day. */
export const fmtLongDay = (day: Date | string) => longDayFmt.format(new Date(day));

/** "Today", "Tomorrow" or "Sat, Nov 8", relative to the shop's today. */
export function fmtDayRelative(day: Date | string, now: Date = new Date()): string {
  const key = dayKey(new Date(day));
  if (key === dayKey(shopDate(now))) return "Today";
  if (key === dayKey(addDays(shopDate(now), 1))) return "Tomorrow";
  return fmtDay(day);
}

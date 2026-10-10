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

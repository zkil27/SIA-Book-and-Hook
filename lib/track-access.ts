import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Who may see an order on /track and /receipt.
 *
 * Order codes are sequential (HB-0001, HB-0002…), so a code alone proves
 * nothing: anyone could walk every number. An order opens for:
 * - the signed-in customer who placed it, and staff;
 * - anyone holding its tracking link (`?t=`), which is an HMAC of the order
 *   number under AUTH_SECRET, handed out after they prove the order is
 *   theirs with the last 4 digits of the delivery phone.
 *
 * Residual risk (docs/security.md): there's no rate limit on those 4 digits,
 * so one order can be guessed in up to 10,000 tries. That is a per-order
 * attack, no longer a free sweep of every order.
 */

function secret(): string {
  const s = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is not set");
  return "dev-only-tracking-secret";
}

/** The shareable tracking token for one order. */
export function trackToken(orderNumber: number): string {
  return createHmac("sha256", secret()).update(`track:${orderNumber}`).digest("base64url").slice(0, 22);
}

export function validTrackToken(orderNumber: number, token: string | null | undefined): boolean {
  if (!token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(trackToken(orderNumber));
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Last 4 digits of a phone number as typed at checkout. */
export const phoneLast4 = (phone: string) => phone.replace(/\D/g, "").slice(-4);

export function sameLast4(phone: string, typed: string): boolean {
  const a = Buffer.from(phoneLast4(phone));
  const b = Buffer.from(typed.replace(/\D/g, ""));
  return a.length === 4 && a.length === b.length && timingSafeEqual(a, b);
}

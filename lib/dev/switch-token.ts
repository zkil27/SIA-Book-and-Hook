import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * One-time-ish ticket for the dev account switcher: "developer O may sign in
 * as user T", signed with AUTH_SECRET and valid for 60 seconds. Only
 * `lib/actions/dev-switch.ts` mints one (after checking DEV_EMAILS on the
 * server), and only the "dev-switch" sign-in provider in auth.ts accepts it,
 * which re-checks DEV_EMAILS against the database before signing anyone in.
 */

const TTL_MS = 60_000;
const PURPOSE = "hb-dev-switch";

function secret(): string {
  const s = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

const sign = (body: string) => createHmac("sha256", secret()).update(`${PURPOSE}.${body}`).digest("base64url");

export function mintSwitchToken(targetUserId: string, originUserId: string): string {
  const body = Buffer.from(JSON.stringify({ t: targetUserId, o: originUserId, exp: Date.now() + TTL_MS })).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function readSwitchToken(token: string): { targetUserId: string; originUserId: string } | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const want = Buffer.from(sign(body));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const claim = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { t?: unknown; o?: unknown; exp?: unknown };
    if (typeof claim.t !== "string" || typeof claim.o !== "string" || typeof claim.exp !== "number") return null;
    if (claim.exp < Date.now()) return null;
    return { targetUserId: claim.t, originUserId: claim.o };
  } catch {
    return null;
  }
}

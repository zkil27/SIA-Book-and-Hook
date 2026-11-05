import "server-only";
import { notFound } from "next/navigation";
import { requireAdmin, type SessionUser } from "@/lib/session";

/**
 * Developer tools gate. The /admin/dev section is open only to signed-in
 * ADMINs whose email is listed in DEV_EMAILS (comma-separated). It fails
 * closed: with DEV_EMAILS unset or empty nobody gets in, and anyone not on the
 * list sees a plain 404 so the section's existence isn't advertised.
 *
 * Checked in the dev layout AND at the start of every dev server action,
 * because server actions are callable directly, not only from the page.
 */

export function devEmails(): string[] {
  return (process.env.DEV_EMAILS ?? "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isDevEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return devEmails().includes(email.trim().toLowerCase());
}

export async function requireDev(): Promise<SessionUser> {
  const user = await requireAdmin();
  if (!isDevEmail(user.email)) notFound();
  return user;
}

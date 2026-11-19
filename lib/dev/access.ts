import "server-only";
import { notFound } from "next/navigation";
import { requireAdmin, type SessionUser } from "@/lib/session";
import { isDevEmail } from "./emails";

export { devEmails, isDevEmail } from "./emails";

/**
 * Developer tools gate. The /admin/dev section is open only to signed-in
 * ADMINs whose email is listed in DEV_EMAILS (comma-separated). It fails
 * closed: with DEV_EMAILS unset or empty nobody gets in, and anyone not on the
 * list sees a plain 404 so the section's existence isn't advertised.
 *
 * Checked in the dev layout AND at the start of every dev server action,
 * because server actions are callable directly, not only from the page.
 */

export async function requireDev(): Promise<SessionUser> {
  const user = await requireAdmin();
  if (!isDevEmail(user.email)) notFound();
  return user;
}

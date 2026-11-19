/**
 * The developer allowlist (DEV_EMAILS, comma-separated, case-insensitive).
 * Its own module with no imports so `auth.ts` can use it without a circular
 * import through lib/session.ts. Empty or unset means nobody: it fails closed.
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

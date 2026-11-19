import "server-only";
import { isDevEmail } from "@/lib/dev/emails";
import type { SessionUser } from "@/lib/session";
import { DevSwitcher } from "./DevSwitcher";

/**
 * Renders the dev account switcher only for an allowlisted developer, or for
 * a developer who has switched into another account (so they can get back).
 * Everyone else gets nothing: no markup, no client code path.
 */
export function DevSwitcherGate({ user }: { user: SessionUser | null }) {
  if (!user) return null;
  const viewingAs = !!user.devOrigin;
  if (!viewingAs && !isDevEmail(user.email)) return null;
  return <DevSwitcher name={user.name ?? user.email} role={user.role} viewingAs={viewingAs} />;
}

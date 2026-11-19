import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { asRole, type AppRole } from "@/lib/roles";

export type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  role: AppRole;
  /** The developer's own user id while they use the dev account switcher. */
  devOrigin: string | null;
};

/** Per-request deduplicated: layout, page and actions decode the JWT once. */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  const u = session?.user;
  if (!u?.id || !u.email) return null;
  return { id: u.id, name: u.name ?? null, email: u.email, role: asRole(u.role), devOrigin: u.devOrigin ?? null };
});

/** For customer-only pages: redirects to /login?next=… when signed out. */
export async function requireUser(next: string): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

/** For /admin pages and admin actions: signed-in ADMIN or redirect. */
export async function requireAdmin(): Promise<SessionUser> {
  return requireRole(["ADMIN"], "/admin");
}

/**
 * For staff pages and staff actions: a signed-in user with one of `roles`,
 * or a redirect (to sign in, or to the "wrong account" notice).
 */
export async function requireRole(roles: readonly AppRole[], next = "/"): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (!roles.includes(user.role)) redirect("/login?denied=1");
  return user;
}

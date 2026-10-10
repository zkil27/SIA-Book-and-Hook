import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export type SessionUser = { id: string; name: string | null; email: string; role: "ADMIN" | "CUSTOMER" };

export async function getUser(): Promise<SessionUser | null> {
  const session = await auth();
  const u = session?.user;
  if (!u?.id || !u.email) return null;
  return { id: u.id, name: u.name ?? null, email: u.email, role: u.role };
}

/** For customer-only pages: redirects to /login?next=… when signed out. */
export async function requireUser(next: string): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

/** For /admin pages and admin actions: signed-in ADMIN or redirect. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/login?denied=1");
  return user;
}

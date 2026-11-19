"use server";

import prisma from "@/lib/prisma";
import { signIn } from "@/auth";
import { getUser } from "@/lib/session";
import { isDevEmail } from "@/lib/dev/emails";
import { mintSwitchToken } from "@/lib/dev/switch-token";
import { asRole, homeFor, ROLE_LABEL, type AppRole } from "@/lib/roles";
import { dbError, fail, ok, type ActionResult } from "./util";

/**
 * Dev account switcher: lets an allowlisted developer (ADMIN + DEV_EMAILS)
 * become any account in one click, to test the admin, packer, driver and
 * customer screens without signing out and in. Every call re-checks the
 * allowlist on the server against the database, because server actions can
 * be called directly. See docs/dev-tools.md and docs/security.md.
 */

/** The developer behind this session (themselves, or the one who switched in), or null. */
async function devOrigin() {
  const me = await getUser();
  if (!me) return null;
  const origin = await prisma.user.findUnique({ where: { id: me.devOrigin ?? me.id }, select: { id: true, email: true, role: true } });
  if (!origin || origin.role !== "ADMIN" || !isDevEmail(origin.email)) return null;
  return { me, origin };
}

export type SwitchAccount = { id: string; name: string; email: string; role: AppRole; roleLabel: string; current: boolean };

/** Accounts to switch to, grouped by role (up to 10 per role). */
export async function switchableAccounts(): Promise<ActionResult<{ accounts: SwitchAccount[]; originId: string }>> {
  try {
    const dev = await devOrigin();
    if (!dev) return fail("Account switching is for developer accounts only.");
    const roles: AppRole[] = ["ADMIN", "PACKER", "DRIVER", "CUSTOMER"];
    const lists = await Promise.all(
      roles.map(role =>
        prisma.user.findMany({
          where: { role },
          select: { id: true, name: true, email: true, role: true },
          orderBy: [{ name: "asc" }, { email: "asc" }],
          take: 10,
        })
      )
    );
    const accounts = lists.flat().map(u => ({
      id: u.id,
      name: u.name ?? u.email,
      email: u.email,
      role: asRole(u.role),
      roleLabel: ROLE_LABEL[asRole(u.role)],
      current: u.id === dev.me.id,
    }));
    return ok({ accounts, originId: dev.origin.id });
  } catch (err) {
    return dbError(err);
  }
}

/** Become another account and land on its home screen. */
export async function switchAccount(userId: string): Promise<ActionResult | void> {
  const dev = await devOrigin();
  if (!dev) return fail("Account switching is for developer accounts only.");
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!target) return fail("That account no longer exists.");
  // Throws Next's redirect on success; nothing after this runs.
  await signIn("dev-switch", { token: mintSwitchToken(target.id, dev.origin.id), redirectTo: homeFor(asRole(target.role)) });
}

/** Back to the developer's own account. */
export async function switchBack(): Promise<ActionResult | void> {
  const dev = await devOrigin();
  if (!dev) return fail("Account switching is for developer accounts only.");
  await signIn("dev-switch", { token: mintSwitchToken(dev.origin.id, dev.origin.id), redirectTo: homeFor("ADMIN") });
}

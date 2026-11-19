/**
 * Account roles and which staff areas each one may open. Edge-safe (no
 * Prisma, no server-only): `auth.config.ts` uses it in the proxy, and pages
 * and server actions re-check with `requireRole()` in `lib/session.ts`.
 */

export type AppRole = "ADMIN" | "CUSTOMER" | "PACKER" | "DRIVER";

export const STAFF_ROLES: readonly AppRole[] = ["ADMIN", "PACKER", "DRIVER"];

export const ROLE_LABEL: Record<AppRole, string> = {
  ADMIN: "Admin",
  CUSTOMER: "Customer",
  PACKER: "Packer",
  DRIVER: "Driver",
};

/** Narrow an untrusted value (a JWT claim) to a role; unknown means CUSTOMER. */
export function asRole(v: unknown): AppRole {
  return v === "ADMIN" || v === "PACKER" || v === "DRIVER" ? v : "CUSTOMER";
}

export const isStaff = (role: AppRole) => role !== "CUSTOMER";

/** Where each role lands after signing in. */
export function homeFor(role: AppRole): string {
  if (role === "ADMIN") return "/admin";
  if (role === "PACKER") return "/staff/pack";
  if (role === "DRIVER") return "/staff/trip";
  return "/";
}

/** Gated areas and the roles allowed in each. Longest prefix first. */
const AREAS: { prefix: string; roles: readonly AppRole[] }[] = [
  { prefix: "/staff/pack", roles: ["ADMIN", "PACKER"] },
  { prefix: "/staff/load", roles: ["ADMIN", "PACKER", "DRIVER"] },
  { prefix: "/staff/trip", roles: ["ADMIN", "DRIVER"] },
  { prefix: "/staff", roles: STAFF_ROLES },
  { prefix: "/admin", roles: ["ADMIN"] },
];

/** True when `path` is inside a role-gated area. */
export const isGated = (path: string) => AREAS.some(a => path === a.prefix || path.startsWith(`${a.prefix}/`));

/** Whether `role` may open `path`. Paths outside the gated areas are open to all. */
export function canOpen(role: AppRole, path: string): boolean {
  const area = AREAS.find(a => path === a.prefix || path.startsWith(`${a.prefix}/`));
  return !area || area.roles.includes(role);
}

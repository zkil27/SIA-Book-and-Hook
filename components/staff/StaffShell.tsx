"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { LayoutDashboard, LogOut, Package, PackageOpen, Truck, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { logoutAction } from "@/lib/actions/auth";
import { homeFor, ROLE_LABEL, type AppRole } from "@/lib/roles";

type Tab = { href: string; label: string; icon: LucideIcon };

const TABS: Record<Exclude<AppRole, "CUSTOMER">, Tab[]> = {
  PACKER: [
    { href: "/staff/pack", label: "Pack", icon: Package },
    { href: "/staff/load", label: "Load truck", icon: PackageOpen },
  ],
  // In the order the work happens: load the truck, then deliver.
  DRIVER: [
    { href: "/staff/load", label: "Load", icon: PackageOpen },
    { href: "/staff/trip", label: "Deliver", icon: Truck },
  ],
  ADMIN: [
    { href: "/staff/pack", label: "Pack", icon: Package },
    { href: "/staff/load", label: "Load", icon: PackageOpen },
    { href: "/staff/trip", label: "Deliver", icon: Truck },
  ],
};

/**
 * Phone-first shell for packers and drivers: who's signed in, their two
 * screens, sign out. No admin navigation, prices or ledger. Pages pin their
 * main action to the bottom with `ActionBar`.
 */
export function StaffShell({ role, name, children }: { role: AppRole; name: string; children: ReactNode }) {
  const pathname = usePathname();
  const tabs = role === "CUSTOMER" ? [] : TABS[role];
  return (
    <div className="min-h-dvh bg-ice">
      <header className="sticky top-0 z-30 border-b border-ice-3 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Logo size="sm" href={homeFor(role)} />
          <span className="ml-auto flex min-w-0 items-center gap-2 text-[13px]">
            <span className="rounded-md bg-ink px-2 py-0.5 font-bold text-white">{ROLE_LABEL[role]}</span>
            <span className="hidden truncate font-semibold text-ink-2 min-[400px]:inline">{name}</span>
          </span>
          {role === "ADMIN" && (
            <Link href="/admin" className="grid size-10 place-items-center rounded-lg text-ink-2 hover:bg-ice" aria-label="Back to the admin">
              <LayoutDashboard className="size-5" aria-hidden />
            </Link>
          )}
          <form action={logoutAction}>
            <button className="grid size-10 place-items-center rounded-lg text-ink-2 hover:bg-ice" aria-label={`Sign out ${name}`}>
              <LogOut className="size-5" aria-hidden />
            </button>
          </form>
        </div>
        <nav className="mx-auto max-w-2xl px-4 pb-2.5" aria-label="Staff">
          <ul className="flex gap-1 rounded-xl bg-ice p-1 ring-1 ring-inset ring-ice-3">
            {tabs.map(t => {
              const on = pathname === t.href || pathname.startsWith(`${t.href}/`);
              return (
                <li key={t.href} className="flex-1">
                  <Link
                    href={t.href}
                    aria-current={on ? "page" : undefined}
                    className={`relative flex h-11 items-center justify-center gap-2 rounded-lg text-[15px] font-semibold ${
                      on ? "text-white" : "text-ink-2 hover:text-ink"
                    }`}
                  >
                    {on && (
                      <motion.span
                        layoutId="staff-tab"
                        className="absolute inset-0 rounded-lg bg-ink"
                        transition={{ type: "spring", stiffness: 500, damping: 38 }}
                      />
                    )}
                    <t.icon className="relative size-[18px]" aria-hidden />
                    <span className="relative">{t.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-2xl px-4 pb-36 pt-5">{children}</main>
    </div>
  );
}

/** The page's main action, pinned above the home indicator for thumbs. */
export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ice-3 bg-paper/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4">{children}</div>
    </div>
  );
}

/** Big empty state for a cleared queue. */
export function StaffEmpty({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className="mt-4 flex flex-col items-center rounded-[var(--radius-card)] bg-paper px-6 py-14 text-center ring-1 ring-inset ring-ice-3">
      {title}
      {children && <div className="mt-4 max-w-sm text-sm text-ink-3">{children}</div>}
    </div>
  );
}

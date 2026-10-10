"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Search, User, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { BasketButton, BasketSheet } from "./BasketUI";

const NAV = [
  { href: "/", label: "Today's catch" },
  { href: "/track", label: "Track order" },
  { href: "/about", label: "About" },
];

export function ShopHeader({ user }: { user: { name: string | null; role: "ADMIN" | "CUSTOMER" } | null }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [menu, setMenu] = useState(false);

  // Keep the search box in sync with the URL and close the menu on navigation
  // (reset during render rather than in an effect).
  const urlQ = params.get("q") ?? "";
  const [seen, setSeen] = useState({ urlQ, pathname });
  if (seen.urlQ !== urlQ || seen.pathname !== pathname) {
    setSeen({ urlQ, pathname });
    setQ(urlQ);
    setMenu(false);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(pathname === "/" ? params.toString() : "");
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    router.push(`/?${next.toString()}#catch`);
  }

  const account = user
    ? user.role === "ADMIN"
      ? { href: "/admin", label: "Staff admin" }
      : { href: "/account", label: "My orders" }
    : { href: `/login?next=${encodeURIComponent(pathname)}`, label: "Sign in" };

  const search = (
    <form onSubmit={submit} role="search" className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search bangus, hipon, pusit…"
        aria-label="Search the catch"
        className="h-11 w-full rounded-xl bg-paper pl-9 pr-3 text-[15px] text-ink ring-1 ring-inset ring-ice-3 outline-none placeholder:text-ink-3/80 focus:ring-2 focus:ring-teal-deep"
      />
    </form>
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ice-3 bg-ice/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo size="sm" />
        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map(n => {
            const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-lg px-3 py-2 text-[15px] font-semibold transition-colors ${
                  active ? "text-ink" : "text-ink-3 hover:text-ink"
                }`}
              >
                {n.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-[13px] h-[3px] rounded-full bg-marker"
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto hidden w-full max-w-xs md:block">{search}</div>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href={account.href}
            className="hidden h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-ink-2 transition-colors hover:bg-ice-2 hover:text-ink sm:inline-flex"
          >
            <User className="size-4" aria-hidden />
            {account.label}
          </Link>
          <BasketButton />
          <button
            onClick={() => setMenu(m => !m)}
            className="grid size-11 place-items-center rounded-xl text-ink-2 hover:bg-ice-2 lg:hidden"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
          >
            {menu ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden">{search}</div>
      <AnimatePresence>
        {menu && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 38 }}
            className="overflow-hidden border-t border-ice-3 lg:hidden"
            aria-label="Mobile"
          >
            <ul className="flex flex-col px-4 py-2">
              {[...NAV, account].map(n => (
                <li key={n.href}>
                  <Link href={n.href} className="block rounded-lg px-2 py-3 text-base font-semibold text-ink">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
    <BasketSheet />
  </>
);
}

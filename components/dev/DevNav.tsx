"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/dev", label: "Overview" },
  { href: "/admin/dev/checks", label: "Checks and timing" },
  { href: "/admin/dev/scenarios", label: "Test scenarios" },
  { href: "/admin/dev/gallery", label: "UI gallery" },
];

export function DevNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Developer tools" className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-1 rounded-lg bg-paper p-1 ring-1 ring-inset ring-ice-3">
        {TABS.map(t => {
          const active = t.href === "/admin/dev" ? pathname === t.href : pathname.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-9 items-center rounded-md px-3.5 text-[13px] font-semibold transition-colors ${
                  active ? "bg-ink text-white" : "text-ink-2 hover:bg-ice hover:text-ink"
                }`}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

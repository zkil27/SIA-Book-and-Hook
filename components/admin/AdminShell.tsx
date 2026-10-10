"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  CornerDownLeft,
  Keyboard,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Package,
  Plus,
  Scale,
  ScrollText,
  Search,
  ShoppingBag,
  Store,
  Tags,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Kbd } from "@/components/ui/primitives";
import { logoutAction } from "@/lib/actions/auth";

export type Counts = { pending: number; out: number; low: number; toSale: number };
export type PaletteItem = { label: string; hint?: string; href: string; group: string; keywords?: string; icon?: LucideIcon };

type NavItem = { href: string; label: string; icon: LucideIcon; keys: string; badge?: (c: Counts) => { n: number; tone: "yellow" | "red" } | null };

const NAV: NavItem[] = [
  { href: "/admin", label: "Today", icon: LayoutDashboard, keys: "g t" },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ClipboardList,
    keys: "g o",
    badge: c => (c.pending ? { n: c.pending, tone: "yellow" } : null),
  },
  {
    href: "/admin/stock",
    label: "Stock",
    icon: Scale,
    keys: "g s",
    badge: c => (c.out + c.low ? { n: c.out + c.low, tone: "red" } : null),
  },
  { href: "/admin/prices", label: "Today's prices", icon: Tags, keys: "g r" },
  { href: "/admin/products", label: "Products", icon: Package, keys: "g p" },
  { href: "/admin/categories", label: "Categories", icon: Layers, keys: "g k" },
  { href: "/admin/ledger", label: "Stock ledger", icon: ScrollText, keys: "g l" },
];

const GO: Record<string, string> = {
  t: "/admin",
  o: "/admin/orders",
  s: "/admin/stock",
  w: "/admin/stock?mode=walkin",
  c: "/admin/stock?mode=count",
  r: "/admin/prices",
  p: "/admin/products",
  k: "/admin/categories",
  l: "/admin/ledger",
};

const SHORTCUTS: [string, string][] = [
  ["⌘ K / Ctrl K", "Search everything"],
  ["/", "Search this page"],
  ["g t", "Go to Today"],
  ["g o", "Go to Orders"],
  ["g s", "Go to Stock"],
  ["g w", "Walk-in sale"],
  ["g c", "Morning count"],
  ["g r", "Today's prices"],
  ["g p", "Products"],
  ["g l", "Stock ledger"],
  ["n", "New product"],
  ["a", "Advance the open order"],
  ["?", "Show these shortcuts"],
];

function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
}

export function AdminShell({
  children,
  counts,
  palette,
  userName,
}: {
  children: ReactNode;
  counts: Counts;
  palette: PaletteItem[];
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pendingG = useRef<number | null>(null);

  // Close the phone "More" sheet on navigation (reset during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMoreOpen(false);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(o => !o);
        return;
      }
      if (isTyping(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (pendingG.current !== null) {
        window.clearTimeout(pendingG.current);
        pendingG.current = null;
        const dest = GO[e.key.toLowerCase()];
        if (dest) {
          e.preventDefault();
          router.push(dest);
        }
        return;
      }
      if (e.key === "g") {
        pendingG.current = window.setTimeout(() => (pendingG.current = null), 900);
      } else if (e.key === "?") {
        setHelpOpen(true);
      } else if (e.key === "n") {
        router.push("/admin/products/new");
      } else if (e.key === "/") {
        const field = document.querySelector<HTMLInputElement>("[data-page-search]");
        if (field) {
          e.preventDefault();
          field.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="min-h-dvh bg-ice">
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-ice-3 bg-paper lg:flex">
        <div className="flex h-16 items-center px-5">
          <Logo size="sm" href="/admin" />
        </div>
        <button
          onClick={() => setPaletteOpen(true)}
          className="group mx-3 mb-3 flex h-9.5 items-center gap-2 rounded-lg bg-ice px-2.5 text-[13px] text-ink-3 ring-1 ring-inset ring-ice-3 transition-all hover:bg-paper hover:text-ink hover:ring-ink-3/50 hover:shadow-xs cursor-pointer select-none"
          aria-label="Search or jump to page"
        >
          <Search className="size-4 shrink-0 text-ink-3 group-hover:text-ink-2 transition-colors" aria-hidden />
          <span className="truncate whitespace-nowrap font-medium text-ink-3 group-hover:text-ink transition-colors">
            Search or jump…
          </span>
          <span className="ml-auto flex items-center gap-1 shrink-0">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
        <nav className="flex flex-1 flex-col gap-0.5 px-3" aria-label="Admin">
          {NAV.map(item => {
            const active = isActive(item.href);
            const badge = item.badge?.(counts);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] font-semibold transition-colors ${
                  active ? "text-teal-ink" : "text-ink-2 hover:bg-ice hover:text-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="rail-active"
                    className="absolute inset-0 rounded-lg bg-mint-soft ring-1 ring-inset ring-teal/30"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <item.icon className="relative size-[18px]" aria-hidden />
                <span className="relative">{item.label}</span>
                {badge && (
                  <span
                    className={`tabular relative ml-auto grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold ${
                      badge.tone === "yellow" ? "bg-tarp text-ink" : "bg-marker text-white"
                    }`}
                  >
                    {badge.n}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-col gap-1 border-t border-ice-3 p-3">
          <Link href="/" className="flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold text-ink-2 hover:bg-ice hover:text-ink">
            <Store className="size-4" aria-hidden /> View storefront
          </Link>
          <button
            onClick={() => setHelpOpen(true)}
            className="flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold text-ink-2 hover:bg-ice hover:text-ink"
          >
            <Keyboard className="size-4" aria-hidden /> Shortcuts <Kbd>?</Kbd>
          </button>
          <form action={logoutAction}>
            <button className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-semibold text-ink-2 hover:bg-ice hover:text-ink">
              <LogOut className="size-4" aria-hidden /> Sign out <span className="ml-auto truncate text-ink-3">{userName}</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Phone top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-ice-3 bg-paper/95 px-3 backdrop-blur lg:hidden">
        <Logo size="sm" href="/admin" />
        <button
          onClick={() => setPaletteOpen(true)}
          className="ml-auto grid size-10 place-items-center rounded-lg text-ink-2 hover:bg-ice"
          aria-label="Search"
        >
          <Search className="size-5" />
        </button>
      </header>

      <main className="pb-24 lg:pb-12 lg:pl-60">
        <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:pt-10">{children}</div>
      </main>

      {/* Phone tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-ice-3 bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label="Admin"
      >
        {[NAV[0], NAV[1], NAV[2], NAV[4]].map(item => {
          const active = isActive(item.href);
          const badge = item.badge?.(counts);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active ? "text-teal-deep" : "text-ink-3"}`}
            >
              <span className="relative">
                <item.icon className="size-[22px]" aria-hidden />
                {badge && (
                  <span
                    className={`tabular absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold ${
                      badge.tone === "yellow" ? "bg-tarp text-ink" : "bg-marker text-white"
                    }`}
                  >
                    {badge.n}
                  </span>
                )}
              </span>
              {item.label === "Today's prices" ? "Prices" : item.label}
              {active && <motion.span layoutId="tab-active" className="absolute inset-x-5 top-0 h-[3px] rounded-b-full bg-teal-deep" />}
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-ink-3"
        >
          <Menu className="size-[22px]" aria-hidden />
          More
        </button>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMoreOpen(false)} />
            <motion.div
              className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-paper p-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 38 }}
            >
              <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-ice-3" aria-hidden />
              {[NAV[3], NAV[5], NAV[6]].map(item => (
                <Link key={item.href} href={item.href} className="flex h-12 items-center gap-3 rounded-lg px-3 font-semibold text-ink hover:bg-ice">
                  <item.icon className="size-5 text-ink-2" aria-hidden /> {item.label}
                </Link>
              ))}
              <Link href="/admin/stock?mode=walkin" className="flex h-12 items-center gap-3 rounded-lg px-3 font-semibold text-ink hover:bg-ice">
                <Scale className="size-5 text-ink-2" aria-hidden /> Walk-in sale
              </Link>
              <Link href="/" className="flex h-12 items-center gap-3 rounded-lg px-3 font-semibold text-ink hover:bg-ice">
                <Store className="size-5 text-ink-2" aria-hidden /> View storefront
              </Link>
              <form action={logoutAction}>
                <button className="flex h-12 w-full items-center gap-3 rounded-lg px-3 font-semibold text-ink hover:bg-ice">
                  <LogOut className="size-5 text-ink-2" aria-hidden /> Sign out
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={palette} />
      <ShortcutHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

// ── Command palette ─────────────────────────────────────────────────────────

const PAGES: PaletteItem[] = [
  ...NAV.map(n => ({ label: n.label, href: n.href, group: "Navigation", hint: n.keys, icon: n.icon })),
  { label: "Walk-in sale", href: "/admin/stock?mode=walkin", group: "Quick actions", hint: "g w", keywords: "counter sell", icon: ShoppingBag },
  { label: "Morning count", href: "/admin/stock?mode=count", group: "Quick actions", hint: "g c", keywords: "inventory count physical", icon: CalendarCheck },
  { label: "New product", href: "/admin/products/new", group: "Quick actions", hint: "n", keywords: "add create", icon: Plus },
];

function getItemIcon(item: PaletteItem) {
  if (item.icon) return item.icon;
  if (item.group === "Navigation" || item.group === "Go to") {
    const nav = NAV.find(n => n.href === item.href);
    if (nav) return nav.icon;
  }
  if (item.group === "Orders to handle") return ClipboardList;
  if (item.group === "Walk-in sale") return ShoppingBag;
  if (item.group === "Stock") return Scale;
  if (item.group === "Stock ledger") return ScrollText;
  if (item.group === "Products") return Package;
  return ArrowRight;
}

function Hint({ hint, active }: { hint: string; active?: boolean }) {
  const isShortcut = /^[a-z0-9]( [a-z0-9])?$/i.test(hint.trim());
  if (isShortcut) {
    return (
      <span className="shrink-0 inline-flex items-center gap-1">
        {hint.split(" ").map((k, i) => (
          <Kbd key={i}>{k}</Kbd>
        ))}
      </span>
    );
  }
  return (
    <span
      className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
        active ? "bg-teal-deep/15 text-teal-ink" : "bg-ice text-ink-3"
      }`}
    >
      {hint}
    </span>
  );
}

function score(item: PaletteItem, q: string): number {
  const hay = `${item.label} ${item.keywords ?? ""} ${item.group}`.toLowerCase();
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  let s = 0;
  for (const w of words) {
    const i = hay.indexOf(w);
    if (i === -1) return -1;
    s += i === 0 ? 3 : hay[i - 1] === " " ? 2 : 1;
  }
  return s;
}

function CommandPalette({ open, onClose, items }: { open: boolean; onClose: () => void; items: PaletteItem[] }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const all = useMemo(() => [...PAGES, ...items], [items]);
  const results = useMemo(() => {
    if (!q.trim()) return PAGES.concat(items.filter(i => i.group === "Orders to handle").slice(0, 6));
    return all
      .map(i => ({ i, s: score(i, q) }))
      .filter(x => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 40)
      .map(x => x.i);
  }, [q, all, items]);

  // Fresh search each time the palette opens (reset during render).
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setQ("");
      setActive(0);
    }
  }
  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 20);
  }, [open]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = useCallback(
    (item: PaletteItem | undefined) => {
      if (!item) return;
      onClose();
      router.push(item.href);
    },
    [onClose, router]
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[55] flex items-start justify-center px-3 pt-[10vh]">
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search and jump"
            className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-paper shadow-2xl ring-1 ring-ice-3 focus-within:ring-2 focus-within:ring-teal/40 transition-shadow"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 500, damping: 36 }}
            onKeyDown={e => {
              if (e.key === "Escape") onClose();
              else if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive(a => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive(a => Math.max(a - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                go(results[active]);
              }
            }}
          >
            <div className="flex items-center gap-3 border-b border-ice-3 px-4 bg-paper">
              <Search className="size-4.5 text-ink-3 shrink-0" aria-hidden />
              <input
                ref={inputRef}
                value={q}
                onChange={e => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                placeholder="Find a product, order code, or action…"
                data-no-outline=""
                className="h-14 flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-3/70 border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-transparent focus-visible:border-transparent"
                style={{ outline: "none", boxShadow: "none" }}
                aria-label="Search"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={`palette-${active}`}
              />
              {q ? (
                <button
                  onClick={() => {
                    setQ("");
                    inputRef.current?.focus();
                  }}
                  className="grid size-7 place-items-center rounded-lg text-ink-3 hover:bg-ice hover:text-ink transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              ) : (
                <Kbd>esc</Kbd>
              )}
            </div>
            <ul
              ref={listRef}
              id="palette-list"
              role="listbox"
              className="max-h-[56vh] overflow-y-auto overscroll-contain p-2 pr-2.5 [scrollbar-width:thin] [scrollbar-color:var(--color-ice-3)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-ice-3/80 hover:[&::-webkit-scrollbar-thumb]:bg-teal/60"
            >
              {results.length === 0 && (
                <li className="px-3 py-10 text-center text-sm text-ink-3">
                  Nothing matches &ldquo;{q}&rdquo;.
                </li>
              )}
              {results.map((item, idx) => {
                const header = idx === 0 || results[idx - 1].group !== item.group ? item.group : null;
                const Icon = getItemIcon(item);
                const isSelected = idx === active;
                return (
                  <li key={`${item.group}-${item.href}-${item.label}`} role="presentation">
                    {header && (
                      <p className="px-3 pb-1.5 pt-3 text-[11px] font-bold uppercase tracking-wider text-ink-3">
                        {header}
                      </p>
                    )}
                    <button
                      id={`palette-${idx}`}
                      data-idx={idx}
                      role="option"
                      aria-selected={isSelected}
                      onMouseMove={() => setActive(idx)}
                      onClick={() => go(item)}
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-mint-soft text-teal-ink font-semibold"
                          : "text-ink hover:bg-ice/70"
                      }`}
                    >
                      <Icon
                        className={`size-4 shrink-0 transition-colors ${
                          isSelected ? "text-teal-ink" : "text-ink-3 group-hover:text-ink-2"
                        }`}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.hint && <Hint hint={item.hint} active={isSelected} />}
                      {isSelected && (
                        <CornerDownLeft className="size-3.5 shrink-0 text-teal-ink/70" aria-hidden />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-between border-t border-ice-3/60 bg-ice/40 px-4 py-2.5 text-[11px] text-ink-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                  <span className="ml-1 text-ink-3">navigate</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Kbd>↵</Kbd>
                  <span className="ml-1 text-ink-3">select</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Kbd>esc</Kbd>
                  <span className="ml-1 text-ink-3">close</span>
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-3/80">
                Hook &amp; Box
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ShortcutHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[55] grid place-items-center px-4">
          <motion.div className="absolute inset-0 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            className="relative w-full max-w-md rounded-2xl bg-paper p-6 shadow-[var(--shadow-sheet)]"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Keyboard shortcuts</h2>
              <button onClick={onClose} className="grid size-8 place-items-center rounded-lg text-ink-3 hover:bg-ice" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
            <dl className="mt-4 grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-2.5 text-sm">
              {SHORTCUTS.map(([k, d]) => (
                <div key={k} className="contents">
                  <dt className="flex gap-1">
                    {k.split(" ").map((p, i) => (p === "/" && k.includes("K") ? <span key={i} className="text-ink-3">or</span> : <Kbd key={i}>{p}</Kbd>))}
                  </dt>
                  <dd className="text-ink-2">{d}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

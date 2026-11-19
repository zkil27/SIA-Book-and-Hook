"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronDown, LoaderCircle, Undo2, UserRound } from "lucide-react";
import { switchableAccounts, switchAccount, switchBack, type SwitchAccount } from "@/lib/actions/dev-switch";
import { ROLE_LABEL, type AppRole } from "@/lib/roles";

/**
 * Developer-only pill (DEV_EMAILS): "Dev · Viewing as Nonoy (Packer)". Opens a
 * list of accounts by role; one tap signs in as that account and lands on its
 * home screen. "Back to me" returns to the developer's own admin account.
 * Rendered only for an allowlisted developer (or one who switched in), and
 * every switch is re-checked on the server.
 */
export function DevSwitcher({ name, role, viewingAs }: { name: string; role: AppRole; viewingAs: boolean }) {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<SwitchAccount[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);

  // Load the list the first time it opens.
  useEffect(() => {
    if (!open || accounts) return;
    let live = true;
    switchableAccounts().then(res => {
      if (!live) return;
      if (res.ok) setAccounts(res.data.accounts);
      else setError(res.error);
    });
    return () => {
      live = false;
    };
  }, [open, accounts]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function go(id: string | "back") {
    setBusyId(id);
    setError(null);
    start(async () => {
      const res = id === "back" ? await switchBack() : await switchAccount(id);
      // On success the server redirects and this never returns.
      if (res && !res.ok) setError(res.error);
      setBusyId(null);
    });
  }

  const groups = (["ADMIN", "PACKER", "DRIVER", "CUSTOMER"] as AppRole[])
    .map(r => ({ role: r, list: (accounts ?? []).filter(a => a.role === r) }))
    .filter(g => g.list.length > 0);

  return (
    <div ref={box} className="fixed left-1/2 top-1.5 z-[70] -translate-x-1/2 print:hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className={`flex h-8 max-w-[90vw] items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold shadow-[var(--shadow-lift)] ring-1 ring-inset transition-colors duration-150 ${
          viewingAs ? "bg-tarp text-ink ring-tarp-deep" : "bg-ink text-white ring-ink"
        }`}
      >
        <span className={`rounded px-1 text-[10px] font-black uppercase tracking-wider ${viewingAs ? "bg-ink text-tarp" : "bg-white/15"}`}>Dev</span>
        <span className="truncate">
          {viewingAs ? "Viewing as " : ""}
          {name} ({ROLE_LABEL[role]})
        </span>
        <ChevronDown className={`size-3.5 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <div className="absolute left-1/2 top-10 w-[min(340px,92vw)] -translate-x-1/2 overflow-hidden rounded-xl bg-paper text-ink shadow-[var(--shadow-sheet)] ring-1 ring-ice-3">
          <p className="border-b border-ice-2 px-4 py-2.5 text-[12px] text-ink-3">
            Switch account without a password. Developer accounts only. Use a separate browser window (Incognito or another profile) to keep two roles open side by side.
          </p>
          {viewingAs && (
            <button
              type="button"
              disabled={pending}
              onClick={() => go("back")}
              className="flex h-11 w-full items-center gap-2 border-b border-ice-2 px-4 text-left text-[14px] font-semibold text-teal-deep hover:bg-mint-soft disabled:opacity-60"
            >
              {busyId === "back" ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Undo2 className="size-4" aria-hidden />}
              Back to me
            </button>
          )}
          <div className="max-h-[60vh] overflow-y-auto py-1">
            {!accounts && !error && (
              <p className="flex items-center gap-2 px-4 py-3 text-[13px] text-ink-3">
                <LoaderCircle className="size-4 animate-spin" aria-hidden /> Loading accounts…
              </p>
            )}
            {groups.map(g => (
              <div key={g.role} className="py-1">
                <p className="px-4 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-ink-3">{ROLE_LABEL[g.role]}</p>
                {g.list.map(a => (
                  <button
                    key={a.id}
                    type="button"
                    disabled={pending || a.current}
                    onClick={() => go(a.id)}
                    className="flex min-h-11 w-full items-center gap-2.5 px-4 py-1.5 text-left hover:bg-ice disabled:cursor-default disabled:opacity-60"
                  >
                    {busyId === a.id ? (
                      <LoaderCircle className="size-4 shrink-0 animate-spin text-ink-3" aria-hidden />
                    ) : (
                      <UserRound className="size-4 shrink-0 text-ink-3" aria-hidden />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold">{a.name}</span>
                      <span className="block truncate text-[12px] text-ink-3">{a.email}</span>
                    </span>
                    {a.current && <span className="shrink-0 text-[12px] font-semibold text-ink-3">You now</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>
          {error && <p className="border-t border-ice-2 px-4 py-2.5 text-[13px] font-semibold text-marker-deep">{error}</p>}
        </div>
      )}
    </div>
  );
}

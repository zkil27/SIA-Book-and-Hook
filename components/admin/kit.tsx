import type { ReactNode } from "react";
import { CloudOff, Hourglass } from "lucide-react";
import { stockState, TO_SALE_AFTER_DAYS } from "@/lib/meta";

export function PageHeader({ title, sub, actions }: { title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="sign text-[40px] text-ink sm:text-[48px]">{title}</h1>
        {sub && <div className="mt-1 text-[15px] text-ink-2">{sub}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
  pad = true,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <section className={`rounded-[var(--radius-card)] bg-paper ring-1 ring-inset ring-ice-3 ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-ice-3 px-5 py-3.5">
          <h2 className="text-[15px] font-bold text-ink">{title}</h2>
          {action}
        </div>
      )}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function DbOffline() {
  return (
    <div className="mx-auto mt-10 flex max-w-lg flex-col items-center rounded-[var(--radius-card)] bg-paper p-10 text-center ring-1 ring-inset ring-ice-3">
      <CloudOff className="size-10 text-ink-3" aria-hidden />
      <p className="sign mt-4 text-[34px] text-ink">Database is offline</p>
      <p className="mt-2 text-sm text-ink-2">
        The admin can&apos;t reach Supabase right now. If the project was paused for inactivity, restore it from the
        Supabase dashboard, then reload this page.
      </p>
    </div>
  );
}

/** Stock count with its state colour. */
export function StockCount({ stock, className = "" }: { stock: number; className?: string }) {
  const s = stockState(stock);
  const tone = s === "out" ? "text-marker-deep" : s === "low" ? "text-[#8a6100]" : "text-ink";
  return (
    <span className={`tabular inline-flex items-center gap-1.5 font-semibold ${tone} ${className}`}>
      <span
        className={`size-2 rounded-full ${s === "out" ? "bg-marker" : s === "low" ? "bg-tarp-deep" : "bg-leaf"}`}
        aria-hidden
      />
      {stock <= 0 ? "Out" : stock}
      {s === "low" && <span className="sr-only">(low)</span>}
    </span>
  );
}

/** FIFO age chip: oldest unit on hand, flagged To Sale at 7+ days. */
export function AgeBadge({ days }: { days: number | null }) {
  if (days === null) return null;
  if (days < TO_SALE_AFTER_DAYS) return <span className="tabular text-[12px] text-ink-3">{days}d old</span>;
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-tarp px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink">
      <Hourglass className="size-3" aria-hidden /> To sale · {days}d
    </span>
  );
}

export function Thumb({ src, size = "size-10" }: { src: string | null; size?: string }) {
  return (
    <span className={`${size} block shrink-0 overflow-hidden rounded-lg bg-ice-2`}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      )}
    </span>
  );
}

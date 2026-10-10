"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Ban, ChevronRight, MapPin, Phone, Search, X } from "lucide-react";
import type { AdminOrder } from "@/lib/admin-data";
import { advanceOrder, advanceOrders, cancelOrder, revertOrder } from "@/lib/actions/admin-orders";
import { PAYMENT_LABEL, splitName, STATUS_META, type OrderStatusKey } from "@/lib/meta";
import { peso } from "@/lib/money";
import { ago, fmtDateTime } from "@/lib/time";
import { Button, Kbd, StatusChip, Textarea } from "@/components/ui/primitives";
import { Sheet } from "@/components/ui/motion";
import { useToast } from "@/components/ui/toast";
import { Thumb } from "./kit";

const TABS: { key: OrderStatusKey | "ALL"; label: string }[] = [
  { key: "PENDING", label: "To confirm" },
  { key: "CONFIRMED", label: "Packing" },
  { key: "READY", label: "Out for delivery" },
  { key: "COMPLETED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "ALL", label: "All" },
];

const CANCEL_REASONS = ["Customer cancelled", "Couldn't reach customer", "Out of stock", "Outside delivery area"];

function useAdvance() {
  const toast = useToast();
  const [pending, start] = useTransition();
  const run = (o: { id: string; code: string; status: OrderStatusKey }, after?: () => void) =>
    start(async () => {
      const res = await advanceOrder(o.id, o.status);
      if (!res.ok) {
        toast({ title: `Couldn't update ${o.code}`, description: res.error, tone: "error" });
        return;
      }
      after?.();
      toast({
        title: `${o.code} → ${STATUS_META[res.data.to].label}`,
        undo: async () => {
          const r = await revertOrder(o.id, res.data.to, o.status);
          if (!r.ok) toast({ title: "Couldn't undo", description: r.error, tone: "error" });
        },
      });
    });
  return { run, pending };
}

export function OrdersBoard({
  orders,
  counts,
  status,
  openCode,
}: {
  orders: AdminOrder[];
  counts: Record<OrderStatusKey | "ALL", number>;
  status: OrderStatusKey | "ALL";
  openCode: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [focus, setFocus] = useState(0);
  const [bulkPending, startBulk] = useTransition();
  const { run, pending } = useAdvance();

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return orders;
    return orders.filter(o =>
      `${o.code} ${o.customer} ${o.delivery.name} ${o.delivery.barangay} ${o.items.map(i => i.name).join(" ")}`.toLowerCase().includes(s)
    );
  }, [orders, q]);

  const open = openCode ? orders.find(o => o.code === openCode) ?? null : null;
  const setOpen = (code: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (code) next.set("open", code);
    else next.delete("open");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  // Switching tabs clears the selection (reset during render).
  const [selStatus, setSelStatus] = useState(status);
  if (selStatus !== status) {
    setSelStatus(status);
    setSelected(new Set());
  }

  // j/k to move, x to select, Enter to open, a to advance.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (open) {
        if (e.key === "a" && STATUS_META[open.status].next && !pending) {
          e.preventDefault();
          run(open);
        }
        return;
      }
      const o = shown[focus];
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocus(f => Math.min(f + 1, shown.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocus(f => Math.max(f - 1, 0));
      } else if (e.key === "x" && o) {
        toggle(o.id);
      } else if (e.key === "Enter" && o) {
        setOpen(o.code);
      } else if (e.key === "a" && o && STATUS_META[o.status].next) {
        run(o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    document.querySelector(`[data-row="${focus}"]`)?.scrollIntoView({ block: "nearest" });
  }, [focus]);

  function toggle(id: string) {
    setSelected(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const selectedOrders = orders.filter(o => selected.has(o.id));
  const bulkStatus = selectedOrders.length && selectedOrders.every(o => o.status === selectedOrders[0].status) ? selectedOrders[0].status : null;
  const bulkNext = bulkStatus ? STATUS_META[bulkStatus].nextLabel : null;

  function bulkAdvance() {
    if (!bulkStatus) return;
    startBulk(async () => {
      const res = await advanceOrders([...selected], bulkStatus);
      if (!res.ok) return toast({ title: "Couldn't update orders", description: res.error, tone: "error" });
      toast({ title: `${res.data.count} order${res.data.count === 1 ? "" : "s"} updated` });
      setSelected(new Set());
    });
  }

  return (
    <div>
      {/* Status tabs */}
      <nav className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Order status">
        <ul className="flex w-max gap-1 rounded-xl bg-paper p-1 ring-1 ring-inset ring-ice-3">
          {TABS.map(t => {
            const on = t.key === status;
            return (
              <li key={t.key}>
                <Link
                  href={`/admin/orders?status=${t.key}`}
                  scroll={false}
                  aria-current={on ? "page" : undefined}
                  className={`relative flex h-9 items-center gap-2 rounded-lg px-3 text-[14px] font-semibold ${on ? "text-white" : "text-ink-2 hover:text-ink"}`}
                >
                  {on && <motion.span layoutId="order-tab" className="absolute inset-0 rounded-lg bg-ink" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                  <span className="relative">{t.label}</span>
                  <span
                    className={`tabular relative rounded-full px-1.5 text-[12px] ${
                      on ? "bg-white/20" : t.key === "PENDING" && counts.PENDING > 0 ? "bg-tarp text-ink" : "bg-ice-2 text-ink-3"
                    }`}
                  >
                    {counts[t.key]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <input
            data-page-search
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Find by code, name, barangay or item"
            aria-label="Search orders"
            className="h-10 w-full rounded-lg bg-paper pl-9 pr-3 text-sm ring-1 ring-inset ring-ice-3 outline-none focus:ring-2 focus:ring-teal-deep"
          />
        </div>
        <p className="hidden items-center gap-1.5 text-[12px] text-ink-3 md:flex">
          <Kbd>j</Kbd>
          <Kbd>k</Kbd> move · <Kbd>x</Kbd> select · <Kbd>↵</Kbd> open · <Kbd>a</Kbd> advance
        </p>
      </div>

      {shown.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-card)] bg-paper px-6 py-14 text-center ring-1 ring-inset ring-ice-3">
          <p className="sign text-[30px] text-ink">{q ? "No matches" : "Nothing here"}</p>
          <p className="mt-1 text-sm text-ink-3">
            {q ? "Try a different code or name." : status === "PENDING" ? "Every order is confirmed. Nice." : "No orders in this list."}
          </p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-paper ring-1 ring-inset ring-ice-3">
          <AnimatePresence initial={false}>
            {shown.map((o, i) => {
              const meta = STATUS_META[o.status];
              const isSel = selected.has(o.id);
              return (
                <motion.li
                  key={o.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  data-row={i}
                  className={`flex items-center gap-3 border-b border-ice-2 px-3 py-3 last:border-b-0 sm:px-4 ${
                    i === focus ? "bg-mint-soft/60" : isSel ? "bg-tarp-soft/60" : "hover:bg-ice/70"
                  }`}
                  onMouseEnter={() => setFocus(i)}
                >
                  <input
                    type="checkbox"
                    checked={isSel}
                    onChange={() => toggle(o.id)}
                    aria-label={`Select ${o.code}`}
                    className="size-4 shrink-0 cursor-pointer rounded"
                  />
                  <button onClick={() => setOpen(o.code)} className="grid min-w-0 flex-1 grid-cols-1 items-center gap-x-4 gap-y-0.5 text-left md:grid-cols-[96px_1.4fr_1fr_auto]">
                    <span className="font-mono text-[13px] font-bold text-ink">{o.code}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink">{o.delivery.name || o.customer}</span>
                      <span className="block truncate text-[13px] text-ink-3">
                        {o.items.map(it => `${it.qty}× ${splitName(it.name).local}`).join(", ")}
                      </span>
                    </span>
                    <span className="text-[13px] text-ink-2">
                      {o.delivery.slot || "—"} · {o.payment === "GCASH" ? "GCash" : "COD"}
                      <span className="block text-ink-3">{ago(o.createdAt)}</span>
                    </span>
                    <span className="tabular font-bold text-ink md:text-right">{peso(o.total)}</span>
                  </button>
                  <span className="hidden sm:block">
                    <StatusChip status={o.status} />
                  </span>
                  {meta.next ? (
                    <Button size="sm" variant={o.status === "PENDING" ? "primary" : "outline"} disabled={pending} onClick={() => run(o)} className="shrink-0">
                      {meta.nextLabel}
                    </Button>
                  ) : (
                    <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden />
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      {/* Bulk bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="fixed inset-x-3 bottom-20 z-40 mx-auto flex max-w-xl items-center gap-3 rounded-2xl bg-ink p-2 pl-4 text-white shadow-[var(--shadow-sheet)] lg:bottom-6 lg:left-60"
          >
            <span className="text-sm font-semibold">{selected.size} selected</span>
            {bulkNext ? (
              <Button size="sm" variant="tarp" loading={bulkPending} onClick={bulkAdvance} className="ml-auto">
                {bulkNext} {selected.size}
              </Button>
            ) : (
              <span className="ml-auto text-[13px] text-white/70">
                {bulkStatus ? "These are finished." : "Pick orders with the same status"}
              </span>
            )}
            <button onClick={() => setSelected(new Set())} className="grid size-8 place-items-center rounded-lg text-white/70 hover:bg-white/10" aria-label="Clear selection">
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <OrderDrawer order={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function OrderDrawer({ order, onClose }: { order: AdminOrder | null; onClose: () => void }) {
  const toast = useToast();
  const { run, pending } = useAdvance();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [cancelling, startCancel] = useTransition();

  // A different order resets the cancel form (reset during render).
  const [forId, setForId] = useState(order?.id);
  if (forId !== order?.id) {
    setForId(order?.id);
    setCancelOpen(false);
    setReason("");
  }

  const meta = order ? STATUS_META[order.status] : null;
  const subtotal = order ? order.items.reduce((s, i) => s + i.price * i.qty, 0) : 0;
  const canCancel = order && order.status !== "CANCELLED" && order.status !== "COMPLETED";

  return (
    <Sheet
      open={!!order}
      onClose={onClose}
      width="max-w-lg"
      title={order ? <span className="font-mono">{order.code}</span> : ""}
      description={order ? `Placed ${fmtDateTime(order.createdAt)} by ${order.customer}` : undefined}
      footer={
        order && meta ? (
          <div className="flex flex-col gap-3">
            {cancelOpen ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-ink">Why cancel {order.code}?</p>
                <div className="flex flex-wrap gap-1.5">
                  {CANCEL_REASONS.map(r => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`h-8 rounded-full px-3 text-[13px] font-semibold ring-1 ring-inset ${reason === r ? "bg-ink text-white ring-ink" : "text-ink-2 ring-ice-3 hover:ring-ink-3"}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Or type a reason" rows={2} />
                <p className="text-[12px] text-ink-3">Stock from this order goes back on the shelf as new ledger entries.</p>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setCancelOpen(false)}>
                    Keep order
                  </Button>
                  <Button
                    variant="marker"
                    loading={cancelling}
                    disabled={reason.trim().length < 3}
                    onClick={() =>
                      startCancel(async () => {
                        const res = await cancelOrder(order.id, reason);
                        if (!res.ok) return toast({ title: "Couldn't cancel", description: res.error, tone: "error" });
                        toast({ title: `${order.code} cancelled`, description: "Stock returned to the shelf." });
                        setCancelOpen(false);
                      })
                    }
                  >
                    Cancel order
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {canCancel && (
                  <Button variant="danger" onClick={() => setCancelOpen(true)}>
                    <Ban className="size-4" aria-hidden /> Cancel
                  </Button>
                )}
                {meta.next && (
                  <Button size="lg" className="ml-auto" loading={pending} onClick={() => run(order)}>
                    {meta.nextLabel} <Kbd>a</Kbd>
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : undefined
      }
    >
      {order && (
        <div className="flex flex-col gap-6">
          <StatusChip status={order.status} />

          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-3">Deliver to</h3>
            <p className="mt-2 font-semibold text-ink">{order.delivery.name}</p>
            <p className="mt-1 flex items-start gap-2 text-sm text-ink-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
              {order.delivery.address}, {order.delivery.barangay}, Dasmariñas
            </p>
            <a href={`tel:${order.delivery.phone.replace(/\s/g, "")}`} className="mt-1 flex items-center gap-2 text-sm font-semibold text-teal-deep hover:underline">
              <Phone className="size-4" aria-hidden /> {order.delivery.phone}
            </a>
            <p className="mt-2 text-sm text-ink-2">
              Slot <strong className="text-ink">{order.delivery.slot || "—"}</strong> · {PAYMENT_LABEL[order.payment]} · courier label: Lalamove
            </p>
          </section>

          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-3">Pack list</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {order.items.map((i, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <Thumb src={i.image} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">
                      {i.qty}× {splitName(i.name).local} <span className="font-normal text-ink-3">{i.variant}</span>
                    </p>
                    <p className="font-mono text-[12px] text-ink-3">{i.sku}</p>
                  </div>
                  <span className="tabular text-sm text-ink">{peso(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 grid grid-cols-[1fr_auto] gap-y-1 border-t border-ice-3 pt-3 text-sm">
              <dt className="text-ink-3">Subtotal</dt>
              <dd className="tabular text-right">{peso(subtotal)}</dd>
              <dt className="text-ink-3">Delivery</dt>
              <dd className="tabular text-right">{order.fee ? peso(order.fee) : "Free"}</dd>
              <dt className="font-bold">Total</dt>
              <dd className="tabular text-right font-bold">{peso(order.total)}</dd>
            </dl>
          </section>

          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-3">Timeline</h3>
            <ol className="relative mt-3 flex flex-col gap-4 border-l-2 border-ice-3 pl-5">
              {order.events.map(e => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[27px] top-1 size-3 rounded-full bg-teal-deep ring-4 ring-ice" aria-hidden />
                  <p className="text-sm font-semibold text-ink">
                    {e.from ? `${STATUS_META[e.from].label} → ` : ""}
                    {STATUS_META[e.to].label}
                    {e.note === "Undo" && <span className="ml-1.5 text-[12px] font-normal text-ink-3">(undone)</span>}
                  </p>
                  <p className="text-[13px] text-ink-3">
                    {fmtDateTime(e.at)} · {e.actor}
                    {e.note && e.note !== "Undo" ? ` · ${e.note}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </Sheet>
  );
}

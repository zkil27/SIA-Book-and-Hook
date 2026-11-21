"use client";

import Link from "next/link";
import { memo, useCallback, useDeferredValue, useEffect, useEffectEvent, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Ban, ChevronRight, MapPin, Phone, Printer, Search, Truck, X } from "lucide-react";
import type { AdminOrder, OrderDetail } from "@/lib/admin-data";
import { advanceOrder, advanceOrders, cancelOrder, cancelOrders, markDeliveredByOffice, orderDetail, revertOrder } from "@/lib/actions/admin-orders";
import { OFFICE_ADVANCE, PAYMENT_LABEL, paymentStatusOf, splitName, STALE_GCASH_HOURS, STATUS_META, type OrderStatusKey } from "@/lib/meta";
import { peso } from "@/lib/money";
import { ago, fmtDateTime, fmtDay } from "@/lib/time";
import { Button, Chip, Kbd, StatusChip, Textarea } from "@/components/ui/primitives";
import { Sheet } from "@/components/ui/motion";
import { useToast } from "@/components/ui/toast";
import { labelFromAdmin } from "@/components/staff/BagLabel";
import { usePrintLabels, usePrintOnConfirm } from "@/components/staff/PrintLabels";
import { Thumb } from "./kit";

/**
 * The order pipeline, left to right, in the same words as each order's chip.
 * Reading the strip teaches the job: confirm → pack → trip → deliver.
 */
const FLOW: OrderStatusKey[] = ["PENDING", "CONFIRMED", "PACKED", "READY", "COMPLETED"];
const OTHER: (OrderStatusKey | "ALL")[] = ["CANCELLED", "ALL"];

const tabLabel = (k: OrderStatusKey | "ALL") => (k === "ALL" ? "All" : STATUS_META[k].label);

const CANCEL_REASONS = [
  "GCash payment not received",
  "Customer cancelled",
  "Couldn't reach customer",
  "Out of stock",
  "Outside delivery area",
  "Bad weather (no delivery)",
];

const STALE_MS = STALE_GCASH_HOURS * 3_600_000;
function isStaleGcash(o: AdminOrder, now: number) {
  return o.payment === "GCASH" && o.status === "PENDING" && now - Date.parse(o.createdAt) >= STALE_MS;
}

const OFFICE_DELIVERED_REASONS = [
  "Customer confirmed by phone",
  "Picked up at the stall",
  "Driver's phone died on the route",
];

/** One-tap office step (Confirm, Mark packed). Later steps belong to trips. */
const canAdvance = (s: OrderStatusKey) => OFFICE_ADVANCE.includes(s) && !!STATUS_META[s].nextLabel;

/** A label is worth (re)printing while the bag is still in the store's hands. */
const canPrint = (s: OrderStatusKey) => s !== "CANCELLED" && s !== "COMPLETED";

function nextButtonLabel(s: OrderStatusKey, printOn: boolean) {
  if (s === "PENDING") return printOn ? "Confirm & print" : "Confirm";
  return STATUS_META[s].nextLabel ?? "";
}

/** Advance one order; confirming also prints its bag label (when switched on). */
function useAdvance(print: (o: AdminOrder) => void) {
  const toast = useToast();
  const [printOn] = usePrintOnConfirm();
  const [pending, start] = useTransition();
  const run = useCallback(
    (o: AdminOrder, after?: () => void) =>
      start(async () => {
      const res = await advanceOrder(o.id, o.status);
      if (!res.ok) {
        toast({ title: `Couldn't update ${o.code}`, description: res.error, tone: "error" });
        return;
      }
      const printed = o.status === "PENDING" && printOn;
      if (printed) print(o);
      after?.();
      toast({
        title: `${o.code} ${STATUS_META[res.data.to].done.toLowerCase()}`,
        description: printed
          ? "Label sent to the printer. It now waits in To pack."
          : res.data.tripCode
            ? `Added to ${res.data.tripCode} for loading.`
            : `Next: ${STATUS_META[res.data.to].label.toLowerCase()}.`,
        undo: async () => {
          const r = await revertOrder(o.id, res.data.to, o.status);
          if (!r.ok) toast({ title: "Couldn't undo", description: r.error, tone: "error" });
          else toast({ title: `Undone: ${o.code} is back in ${STATUS_META[o.status].label}` });
        },
      });
    }),
    [print, printOn, toast]
  );
  return { run, pending };
}

export function OrdersBoard({
  orders,
  counts,
  status,
  openCode: openFromUrl,
}: {
  orders: AdminOrder[];
  counts: Record<OrderStatusKey | "ALL", number>;
  status: OrderStatusKey | "ALL";
  openCode: string | null;
}) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const query = useDeferredValue(q);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [focus, setFocus] = useState(-1);
  const [bulkPending, startBulk] = useTransition();
  const [bulkCancelOpen, setBulkCancelOpen] = useState(false);
  const [bulkCancelReason, setBulkCancelReason] = useState("");
  const [bulkCancelling, startBulkCancel] = useTransition();
  const [now] = useState(() => Date.now());
  const { print, sheet } = usePrintLabels();
  const printOne = useCallback((o: AdminOrder) => print([labelFromAdmin(o)]), [print]);
  const { run, pending } = useAdvance(printOne);
  const [printOn, setPrintOn] = usePrintOnConfirm();

  const shown = useMemo(() => {
    const s = query.trim().toLowerCase();
    if (!s) return orders;
    return orders.filter(o =>
      `${o.code} ${o.customer} ${o.delivery.name} ${o.delivery.barangay} ${o.items.map(i => i.name).join(" ")}`.toLowerCase().includes(s)
    );
  }, [orders, query]);
  const staleIds = useMemo(() => shown.filter(o => isStaleGcash(o, now)).map(o => o.id), [shown, now]);

  // The open order lives in client state and the URL is updated without a
  // server round trip; a new ?open= from outside (palette, inbox) still wins.
  const [openCode, setOpenCode] = useState(openFromUrl);
  const [urlOpen, setUrlOpen] = useState(openFromUrl);
  if (urlOpen !== openFromUrl) {
    setUrlOpen(openFromUrl);
    setOpenCode(openFromUrl);
  }
  const open = openCode ? orders.find(o => o.code === openCode) ?? null : null;
  const setOpen = useCallback((code: string | null) => {
    setOpenCode(code);
    const url = new URL(window.location.href);
    if (code) url.searchParams.set("open", code);
    else url.searchParams.delete("open");
    window.history.replaceState(null, "", url);
  }, []);

  // Switching tabs clears the selection and keyboard focus (reset during render).
  const [selStatus, setSelStatus] = useState(status);
  if (selStatus !== status) {
    setSelStatus(status);
    setSelected(new Set());
    setFocus(-1);
  }

  const toggle = useCallback((id: string) => {
    setSelected(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, []);

  // j/k to move, x to select, Enter to open, a for the next step. Subscribed
  // once; the handler always sees the latest state.
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    const t = e.target as HTMLElement;
    if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable || e.metaKey || e.ctrlKey || e.altKey) return;
    if (open) {
      if (e.key === "a" && canAdvance(open.status) && !pending) {
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
    } else if (e.key === "a" && o && canAdvance(o.status) && !pending) {
      run(o);
    }
  });
  useEffect(() => {
    const h = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    if (focus >= 0) document.querySelector(`[data-row="${focus}"]`)?.scrollIntoView({ block: "nearest" });
  }, [focus]);

  const selectedOrders = orders.filter(o => selected.has(o.id));
  const bulkStatus = selectedOrders.length && selectedOrders.every(o => o.status === selectedOrders[0].status) ? selectedOrders[0].status : null;
  const bulkLabel = bulkStatus && canAdvance(bulkStatus) ? nextButtonLabel(bulkStatus, printOn) : null;
  const printableSelected = selectedOrders.filter(o => canPrint(o.status));
  const cancellableSelected = selectedOrders.filter(o => o.status !== "CANCELLED" && o.status !== "COMPLETED");

  function bulkAdvance() {
    if (!bulkStatus) return;
    startBulk(async () => {
      const res = await advanceOrders([...selected], bulkStatus);
      if (!res.ok) return toast({ title: "Couldn't update orders", description: res.error, tone: "error" });
      const moved = new Set(res.data.ids);
      const printed = bulkStatus === "PENDING" && printOn;
      if (printed) print(orders.filter(o => moved.has(o.id)).map(labelFromAdmin));
      toast({
        title: `${res.data.count} order${res.data.count === 1 ? "" : "s"} ${STATUS_META[STATUS_META[bulkStatus].next!].done.toLowerCase()}`,
        description: printed ? `${res.data.count} label${res.data.count === 1 ? "" : "s"} sent to the printer.` : undefined,
      });
      setSelected(new Set());
    });
  }

  return (
    <div>
      <OrderPipeline counts={counts} status={status} />

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
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
        <label className="inline-flex h-10 cursor-pointer select-none items-center gap-2 text-[13px] font-semibold text-ink-2">
          <input type="checkbox" checked={printOn} onChange={e => setPrintOn(e.target.checked)} className="size-4 rounded accent-[var(--color-ink)]" />
          <Printer className="size-4 text-ink-3" aria-hidden /> Print a bag label when confirming
        </label>
        {status === "PENDING" && staleIds.length > 0 && (
          <Button size="sm" variant="danger" onClick={() => setSelected(new Set(staleIds))}>
            Select stale ({staleIds.length})
          </Button>
        )}
        <p className="ml-auto hidden items-center gap-1.5 text-[12px] text-ink-3 lg:flex">
          Keyboard: <Kbd>j</Kbd>
          <Kbd>k</Kbd> move · <Kbd>a</Kbd> next step · <Kbd>?</Kbd> all shortcuts
        </p>
      </div>

      {shown.length === 0 ? (
        query ? (
          <EmptyState title="No matches">Try a different code, name or barangay.</EmptyState>
        ) : (
          <NextStepEmpty status={status} counts={counts} />
        )
      ) : (
        <ul className="mt-4 flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-paper ring-1 ring-inset ring-ice-3">
          {shown.map((o, i) => (
            <OrderRow
              key={o.id}
              order={o}
              index={i}
              focused={i === focus}
              selected={selected.has(o.id)}
              stale={isStaleGcash(o, now)}
              pending={pending}
              printOn={printOn}
              onToggle={toggle}
              onOpen={setOpen}
              onAdvance={run}
            />
          ))}
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
            className="fixed inset-x-3 bottom-20 z-40 mx-auto flex max-w-2xl flex-wrap items-center gap-2 rounded-2xl bg-ink p-2 pl-4 text-white shadow-[var(--shadow-sheet)] lg:bottom-6 lg:left-60"
          >
            <span className="text-sm font-semibold">{selected.size} selected</span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {printableSelected.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  onClick={() => print(printableSelected.map(labelFromAdmin))}
                >
                  <Printer className="size-3.5" aria-hidden /> Print labels ({printableSelected.length})
                </Button>
              )}
              {cancellableSelected.length > 0 && (
                <Button
                  size="sm"
                  variant="marker"
                  onClick={() => {
                    setBulkCancelReason("");
                    setBulkCancelOpen(true);
                  }}
                >
                  <Ban className="size-3.5" aria-hidden /> Cancel ({cancellableSelected.length})
                </Button>
              )}
              {bulkLabel ? (
                <Button size="sm" variant="tarp" loading={bulkPending} onClick={bulkAdvance}>
                  {bulkStatus === "PENDING" && printOn ? `Confirm ${selected.size} & print` : `${bulkLabel} ${selected.size}`}
                </Button>
              ) : (
                <span className="hidden text-[12px] text-white/75 sm:inline">
                  {bulkStatus === "PACKED" ? "Auto-tripped on pack" : bulkStatus ? "Moves with trip" : "Mixed statuses"}
                </span>
              )}
            </div>
            <button onClick={() => setSelected(new Set())} className="grid size-10 place-items-center rounded-lg text-white/70 hover:bg-white/10" aria-label="Clear selection">
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet
        open={bulkCancelOpen}
        onClose={() => setBulkCancelOpen(false)}
        title={`Cancel ${cancellableSelected.length} order${cancellableSelected.length === 1 ? "" : "s"}?`}
        description="Stock from these orders goes back on the shelf as compensating ledger entries."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setBulkCancelOpen(false)} disabled={bulkCancelling}>
              Keep orders
            </Button>
            <Button
              variant="marker"
              loading={bulkCancelling}
              disabled={bulkCancelReason.trim().length < 3 || cancellableSelected.length === 0}
              onClick={() =>
                startBulkCancel(async () => {
                  const res = await cancelOrders(
                    cancellableSelected.map(o => o.id),
                    bulkCancelReason
                  );
                  if (!res.ok) return toast({ title: "Couldn't cancel orders", description: res.error, tone: "error" });
                  toast({
                    title: `${res.data.count} order${res.data.count === 1 ? "" : "s"} cancelled`,
                    description: "Stock returned to the shelf.",
                  });
                  setBulkCancelOpen(false);
                  setSelected(new Set());
                })
              }
            >
              Cancel {cancellableSelected.length} order{cancellableSelected.length === 1 ? "" : "s"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-ink">Why cancel?</p>
          <ReasonChips reasons={CANCEL_REASONS} value={bulkCancelReason} onChange={setBulkCancelReason} />
          <Textarea value={bulkCancelReason} onChange={e => setBulkCancelReason(e.target.value)} placeholder="Or type a reason" rows={2} />
        </div>
      </Sheet>

      <OrderDrawer order={open} onClose={() => setOpen(null)} onPrint={printOne} />
      {sheet}
    </div>
  );
}

/** The status tabs drawn as the order's journey, with counts. */
function OrderPipeline({ counts, status }: { counts: Record<OrderStatusKey | "ALL", number>; status: OrderStatusKey | "ALL" }) {
  const tab = (k: OrderStatusKey | "ALL") => {
    const on = k === status;
    const hot = (k === "PENDING" || k === "CONFIRMED" || k === "PACKED") && counts[k] > 0;
    return (
      <Link
        key={k}
        href={`/admin/orders?status=${k}`}
        scroll={false}
        aria-current={on ? "page" : undefined}
        className={`flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-[14px] font-semibold transition-colors duration-150 ${
          on ? "bg-ink text-white" : "text-ink-2 hover:bg-ice hover:text-ink"
        }`}
      >
        {tabLabel(k)}
        <span
          className={`tabular rounded-full px-1.5 text-[12px] ${
            on ? "bg-white/20" : hot && k === "PENDING" ? "bg-tarp text-ink" : hot ? "bg-mint-soft text-teal-ink" : "bg-ice-2 text-ink-3"
          }`}
        >
          {counts[k]}
        </span>
      </Link>
    );
  };
  return (
    <nav className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Order steps">
      <div className="flex w-max items-center gap-1 rounded-xl bg-paper p-1 ring-1 ring-inset ring-ice-3">
        {FLOW.map((k, i) => (
          <span key={k} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-4 shrink-0 text-ink-3/60" aria-hidden />}
            {tab(k)}
          </span>
        ))}
        <span className="mx-1 h-6 w-px bg-ice-3" aria-hidden />
        {OTHER.map(tab)}
      </div>
    </nav>
  );
}

function EmptyState({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-[var(--radius-card)] bg-paper px-6 py-14 text-center ring-1 ring-inset ring-ice-3">
      <p className="sign text-[30px] text-ink">{title}</p>
      <div className="mt-1 text-sm text-ink-3">{children}</div>
    </div>
  );
}

/** An empty step points at the next one that has work, so nobody wonders "now what?". */
function NextStepEmpty({ status, counts }: { status: OrderStatusKey | "ALL"; counts: Record<OrderStatusKey | "ALL", number> }) {
  const link = "mt-4 inline-flex h-10 items-center gap-1.5 rounded-lg bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-2";
  if (status === "PENDING") {
    return (
      <EmptyState title="Nothing to confirm">
        New orders land here first.
        {counts.CONFIRMED > 0 && (
          <>
            {" "}
            {counts.CONFIRMED} confirmed order{counts.CONFIRMED === 1 ? " is" : "s are"} waiting to be packed.
            <br />
            <Link href="/staff/pack" className={link}>
              Open the packing screen <ArrowRight className="size-4" aria-hidden />
            </Link>
          </>
        )}
      </EmptyState>
    );
  }
  if (status === "CONFIRMED") {
    return (
      <EmptyState title="Nothing to pack">
        Confirmed orders wait here for the packer.
        {counts.PACKED > 0 && (
          <>
            {" "}
            {counts.PACKED} packed bag{counts.PACKED === 1 ? " needs" : "s need"} a trip.
            <br />
            <Link href="/admin/dispatch" className={link}>
              Plan trips in Dispatch <ArrowRight className="size-4" aria-hidden />
            </Link>
          </>
        )}
      </EmptyState>
    );
  }
  if (status === "PACKED") return <EmptyState title="No packed bags">Packed orders wait here until a trip takes them.</EmptyState>;
  if (status === "READY") return <EmptyState title="Nothing on the truck">Orders show here while a driver is out delivering them.</EmptyState>;
  return <EmptyState title="Nothing here">No orders in this list.</EmptyState>;
}

/** What happens next for an order the office can't move with one tap. */
function RowNext({ o }: { o: AdminOrder }) {
  if (o.status === "PACKED") {
    return o.trip ? (
      <span className="shrink-0 text-right text-[12px] font-semibold leading-tight text-ink-2">
        <span className="font-mono">{o.trip.code}</span>
        <span className="block text-ink-3">{o.trip.loaded ? "loaded" : "being loaded"}</span>
      </span>
    ) : (
      <Link
        href="/admin/dispatch"
        className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg bg-mint-soft px-3 text-[13px] font-semibold text-teal-ink ring-1 ring-inset ring-teal/40 hover:bg-mint"
      >
        Plan trip <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    );
  }
  if (o.status === "READY" && o.trip) {
    return (
      <span className="shrink-0 text-right text-[12px] font-semibold leading-tight text-ink-2">
        <span className="font-mono">{o.trip.code}</span>
        <span className="block text-ink-3">{o.trip.driver ?? "Driver"}</span>
      </span>
    );
  }
  return <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden />;
}

const OrderRow = memo(function OrderRow({
  order: o,
  index,
  focused,
  selected,
  stale,
  pending,
  printOn,
  onToggle,
  onOpen,
  onAdvance,
}: {
  order: AdminOrder;
  index: number;
  focused: boolean;
  selected: boolean;
  stale: boolean;
  pending: boolean;
  printOn: boolean;
  onToggle: (id: string) => void;
  onOpen: (code: string) => void;
  onAdvance: (o: AdminOrder) => void;
}) {
  const pay = paymentStatusOf(o.payment, o.status);
  return (
    <li
      data-row={index}
      className={`flex items-center gap-3 border-b border-ice-2 px-3 py-3 transition-colors duration-150 last:border-b-0 sm:px-4 ${
        focused ? "bg-mint-soft/60" : selected ? "bg-tarp-soft/60" : "hover:bg-ice/70"
      }`}
    >
      <input type="checkbox" checked={selected} onChange={() => onToggle(o.id)} aria-label={`Select ${o.code}`} className="size-4 shrink-0 cursor-pointer rounded" />
      <button onClick={() => onOpen(o.code)} className="grid min-w-0 flex-1 grid-cols-1 items-center gap-x-4 gap-y-0.5 text-left md:grid-cols-[96px_1.4fr_1fr_auto]">
        <span className="font-mono text-[13px] font-bold text-ink">{o.code}</span>
        <span className="min-w-0">
          <span className="block truncate font-semibold text-ink">{o.delivery.name || o.customer}</span>
          <span className="block truncate text-[13px] text-ink-3">{o.items.map(it => `${it.qty}× ${splitName(it.name).local}`).join(", ")}</span>
        </span>
        <span className="text-[13px] text-ink-2">
          {o.delivery.day ? `${fmtDay(o.delivery.day)} · ` : ""}
          {o.delivery.slot || "—"} ·{" "}
          <span className={pay.tone === "yellow" ? "font-semibold text-[#6b4e00]" : pay.tone === "green" ? "font-semibold text-[#14532f]" : pay.tone === "teal" ? "font-semibold text-teal-ink" : ""}>
            {pay.label}
          </span>
          {stale && <Chip tone="red" className="ml-1.5">Stale</Chip>}
          <span className="block text-ink-3">
            {o.delivery.barangay} · {ago(o.createdAt)}
          </span>
        </span>
        <span className="tabular font-bold text-ink md:text-right">{peso(o.total)}</span>
      </button>
      <span className="hidden sm:block">
        <StatusChip status={o.status} />
      </span>
      {canAdvance(o.status) ? (
        <Button size="sm" variant={o.status === "PENDING" ? "primary" : "outline"} disabled={pending} onClick={() => onAdvance(o)} className="shrink-0">
          {o.status === "PENDING" && printOn && <Printer className="size-3.5" aria-hidden />}
          {nextButtonLabel(o.status, printOn)}
        </Button>
      ) : (
        <RowNext o={o} />
      )}
    </li>
  );
});

/** Loads the opened order's phone, address, photos and timeline once per open. */
function useOrderDetail(id: string | null) {
  const [state, setState] = useState<{ id: string; detail: OrderDetail | null; error: string | null } | null>(null);
  useEffect(() => {
    if (!id) return;
    let live = true;
    orderDetail(id).then(res => {
      if (live) setState({ id, detail: res.ok ? res.data : null, error: res.ok ? null : res.error });
    });
    return () => {
      live = false;
    };
  }, [id]);
  return state && state.id === id ? state : null;
}

function OrderDrawer({ order, onClose, onPrint }: { order: AdminOrder | null; onClose: () => void; onPrint: (o: AdminOrder) => void }) {
  const toast = useToast();
  const { run, pending } = useAdvance(onPrint);
  const [printOn] = usePrintOnConfirm();
  const [now] = useState(() => Date.now());
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [cancelling, startCancel] = useTransition();
  const [delivering, startDeliver] = useTransition();
  const loaded = useOrderDetail(order?.id ?? null);
  const detail = loaded?.detail ?? null;
  const pay = order ? paymentStatusOf(order.payment, order.status) : null;
  const stale = order ? isStaleGcash(order, now) : false;

  // A different order resets the forms (reset during render).
  const [forId, setForId] = useState(order?.id);
  if (forId !== order?.id) {
    setForId(order?.id);
    setCancelOpen(false);
    setDeliverOpen(false);
    setReason("");
  }

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
        order ? (
          <div className="flex flex-col gap-3">
            {deliverOpen ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-ink">Mark {order.code} delivered without the customer&apos;s PIN?</p>
                <p className="text-[13px] text-ink-3">The timeline will say the office marked it, with your reason. Drivers finish stops from their trip screen.</p>
                <ReasonChips reasons={OFFICE_DELIVERED_REASONS} value={reason} onChange={setReason} />
                <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Or type a reason" rows={2} />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setDeliverOpen(false)}>
                    Back
                  </Button>
                  <Button
                    loading={delivering}
                    disabled={reason.trim().length < 3}
                    onClick={() =>
                      startDeliver(async () => {
                        const res = await markDeliveredByOffice(order.id, reason);
                        if (!res.ok) return toast({ title: "Couldn't mark delivered", description: res.error, tone: "error" });
                        toast({ title: `${order.code} marked delivered`, description: "Logged as an office override." });
                        setDeliverOpen(false);
                        setReason("");
                      })
                    }
                  >
                    Mark delivered
                  </Button>
                </div>
              </div>
            ) : cancelOpen ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-ink">Why cancel {order.code}?</p>
                <ReasonChips reasons={CANCEL_REASONS} value={reason} onChange={setReason} />
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
              <div className="flex flex-wrap items-center gap-2">
                {canCancel && (
                  <Button variant="danger" onClick={() => setCancelOpen(true)}>
                    <Ban className="size-4" aria-hidden /> Cancel
                  </Button>
                )}
                {canPrint(order.status) && order.status !== "PENDING" && (
                  <Button variant="ghost" onClick={() => onPrint(order)}>
                    <Printer className="size-4" aria-hidden /> Print label
                  </Button>
                )}
                {canAdvance(order.status) && (
                  <Button size="lg" className="ml-auto" loading={pending} onClick={() => run(order)}>
                    {order.status === "PENDING" && printOn && <Printer className="size-4" aria-hidden />}
                    {nextButtonLabel(order.status, printOn)} <Kbd>a</Kbd>
                  </Button>
                )}
                {order.status === "PACKED" && (
                  <Link
                    href="/admin/dispatch"
                    className="ml-auto inline-flex h-12 items-center gap-2 rounded-xl bg-ink px-5 text-[15px] font-semibold text-white hover:bg-ink-2"
                  >
                    <Truck className="size-4" aria-hidden /> {order.trip ? "Open in Dispatch" : "Plan a trip"}
                  </Link>
                )}
                {order.status === "READY" && (
                  <Button size="lg" variant="outline" className="ml-auto" onClick={() => setDeliverOpen(true)}>
                    Mark delivered…
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
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip status={order.status} />
            {pay && <Chip tone={pay.tone}>{pay.label}</Chip>}
            {stale && <Chip tone="red">Stale · holding stock</Chip>}
            {order.status === "PENDING" && (
              <p className="text-[13px] text-ink-2">
                Verify GCash payment before confirming. {printOn ? "Confirming prints the bag label for the packer." : "Confirming sends it to packing."}
              </p>
            )}
          </div>

          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-3">Deliver to</h3>
            <p className="mt-2 font-semibold text-ink">{order.delivery.name}</p>
            <p className="mt-1 flex items-start gap-2 text-sm text-ink-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
              {detail ? `${detail.address}, ` : ""}
              {order.delivery.barangay}, Dasmariñas
            </p>
            {detail ? (
              <a href={`tel:${detail.phone.replace(/\s/g, "")}`} className="mt-1 flex items-center gap-2 text-sm font-semibold text-teal-deep hover:underline">
                <Phone className="size-4" aria-hidden /> {detail.phone}
              </a>
            ) : (
              <span className="skeleton mt-1.5 block h-4 w-36 rounded" aria-hidden />
            )}
            <p className="mt-2 text-sm text-ink-2">
              <strong className="text-ink">
                {order.delivery.day ? `${fmtDay(order.delivery.day)}, ` : ""}
                {order.delivery.slot || "—"}
              </strong>{" "}
              · {PAYMENT_LABEL[order.payment]}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-ink-2">
              <Truck className="size-4 shrink-0 text-ink-3" aria-hidden />
              {order.trip ? (
                <span>
                  <strong className="font-mono text-ink">{order.trip.code}</strong> · {order.trip.vehicle}
                  {order.trip.driver ? ` · ${order.trip.driver}` : " · no driver yet"}
                  {order.trip.stop ? ` · stop ${order.trip.stop}` : ""}
                  {order.status === "PACKED" ? (order.trip.loaded ? " · loaded" : " · not loaded yet") : ""}
                </span>
              ) : (
                <span>Not on a trip yet</span>
              )}
            </p>
          </section>

          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-3">What goes in the bag</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {order.items.map((i, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <Thumb src={detail?.items[idx]?.image ?? null} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">
                      {i.qty}× {splitName(i.name).local} <span className="font-normal text-ink-3">{i.variant}</span>
                    </p>
                    {detail?.items[idx] && <p className="font-mono text-[12px] text-ink-3">{detail.items[idx].sku}</p>}
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
            {loaded?.error ? (
              <p className="mt-2 text-sm text-marker-deep">{loaded.error}</p>
            ) : !detail ? (
              <div className="mt-3 flex flex-col gap-3" aria-label="Loading timeline">
                <span className="skeleton block h-4 w-48 rounded" />
                <span className="skeleton block h-4 w-40 rounded" />
              </div>
            ) : (
              <ol className="relative mt-3 flex flex-col gap-4 border-l-2 border-ice-3 pl-5">
                {detail.events.map(e => (
                  <li key={e.id} className="relative">
                    <span className="absolute -left-[27px] top-1 size-3 rounded-full bg-teal-deep ring-4 ring-ice" aria-hidden />
                    <p className="text-sm font-semibold text-ink">
                      {e.note === "Undo" && e.from ? `Undid “${STATUS_META[e.from].done.toLowerCase()}”` : STATUS_META[e.to].done}
                    </p>
                    <p className="text-[13px] text-ink-3">
                      {fmtDateTime(e.at)} · {e.actor}
                      {e.note && e.note !== "Undo" ? ` · ${e.note}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </Sheet>
  );
}

function ReasonChips({ reasons, value, onChange }: { reasons: string[]; value: string; onChange: (r: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {reasons.map(r => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`h-9 rounded-full px-3 text-[13px] font-semibold ring-1 ring-inset ${value === r ? "bg-ink text-white ring-ink" : "text-ink-2 ring-ice-3 hover:ring-ink-3"}`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

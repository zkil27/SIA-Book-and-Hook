"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { Eraser, ShoppingCart, Zap } from "lucide-react";
import { cleanUpTestOrders, morningRush, placeTestOrders, type RushResult, type TestOrdersResult } from "@/lib/actions/dev";
import { Button, Field, Input } from "@/components/ui/primitives";
import { Sheet } from "@/components/ui/motion";
import { useToast } from "@/components/ui/toast";
import { Panel } from "@/components/admin/kit";
import { OutcomeChip } from "./kit";

type Action = "orders" | "rush" | "cleanup";

/**
 * Test traffic through the real checkout code. Every write is confirmed in a
 * sheet that says exactly what it will write; results show inline and in a
 * toast. Caps are enforced again on the server.
 */
export function ScenariosPanel({
  spareItems,
  maxSpare,
  openCount,
  heldUnits,
  maxOrders,
  maxRush,
}: {
  spareItems: number;
  maxSpare: { label: string; spare: number } | null;
  openCount: number;
  heldUnits: number;
  maxOrders: number;
  maxRush: number;
}) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState<Action | null>(null);
  const [orders, setOrders] = useState(3);
  const [rush, setRush] = useState(10);
  const [contention, setContention] = useState(true);
  const [ordersResult, setOrdersResult] = useState<TestOrdersResult | null>(null);
  const [rushResult, setRushResult] = useState<RushResult | null>(null);
  const [cleanupResult, setCleanupResult] = useState<{ cancelled: string[]; skipped: number } | null>(null);

  const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Number.isFinite(n) ? Math.floor(n) : lo));

  function runConfirmed() {
    const action = confirm;
    start(async () => {
      if (action === "orders") {
        const res = await placeTestOrders(orders);
        if (!res.ok) return void toast({ title: "No test orders placed", description: res.error, tone: "error" });
        setOrdersResult(res.data);
        toast({ title: `${res.data.placed.length} test order${res.data.placed.length === 1 ? "" : "s"} placed` });
      } else if (action === "rush") {
        const res = await morningRush(rush, contention);
        if (!res.ok) return void toast({ title: "Rush not started", description: res.error, tone: "error" });
        setRushResult(res.data);
        toast({ title: `Rush done: ${res.data.placed} of ${res.data.attempted} placed`, description: `${res.data.ms} ms wall time` });
      } else if (action === "cleanup") {
        const res = await cleanUpTestOrders();
        if (!res.ok) return void toast({ title: "Clean-up failed", description: res.error, tone: "error" });
        setCleanupResult(res.data);
        toast({ title: `${res.data.cancelled.length} test order${res.data.cancelled.length === 1 ? "" : "s"} cancelled` });
      }
      setConfirm(null);
    });
  }

  const sheet: Record<Action, { title: string; body: ReactNode; cta: string }> = {
    orders: {
      title: `Place ${orders} test order${orders === 1 ? "" : "s"}`,
      cta: "Place test orders",
      body: (
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-ink-2">
          <li>
            Writes {orders} order{orders === 1 ? "" : "s"} for the &ldquo;Dev test&rdquo; customer, each with 1–3 items
            of 1–2 units, cash on delivery.
          </li>
          <li>Writes one sale movement per item, reason &ldquo;Sale — HB-xxxx · dev test&rdquo;.</li>
          <li>Only uses items that stay above the low-stock line, so the storefront won&apos;t show anything as low.</li>
          <li>Undo with Clean up. The ledger keeps both entries.</li>
        </ul>
      ),
    },
    rush: {
      title: `Send ${rush} orders at once`,
      cta: "Start the rush",
      body: (
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-ink-2">
          <li>
            Sends {rush} single-unit orders at the same moment, each in its own serializable transaction, like that
            many shoppers tapping Place order together.
          </li>
          <li>
            {contention
              ? `All of them target one item${maxSpare ? ` (${maxSpare.label}, ${maxSpare.spare} spare)` : ""}, to show the ledger can't be oversold.`
              : "Each targets a random item with stock to spare."}
          </li>
          <li>Some may hit a write conflict and be refused. That is the expected, safe outcome.</li>
          <li>Writes up to {rush} orders and sale movements tagged &ldquo;dev test&rdquo;.</li>
        </ul>
      ),
    },
    cleanup: {
      title: `Cancel ${openCount} open test order${openCount === 1 ? "" : "s"}`,
      cta: "Cancel test orders",
      body: (
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-ink-2">
          <li>Cancels every Pending, Confirmed or Out-for-delivery order of the &ldquo;Dev test&rdquo; customer.</li>
          <li>
            Puts {heldUnits} unit{heldUnits === 1 ? "" : "s"} back as new &ldquo;Cancelled — HB-xxxx (back to stock) · dev
            test&rdquo; movements. The original sales stay in the ledger.
          </li>
          <li>Delivered test orders can&apos;t be cancelled, the same rule staff follow.</li>
        </ul>
      ),
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Test orders">
          <p className="text-sm text-ink-2">
            Real checkout code, a throwaway customer. {spareItems} item{spareItems === 1 ? " has" : "s have"} stock to
            spare above the low-stock line.
          </p>
          <div className="mt-4 flex items-end gap-3">
            <Field label={`How many (1–${maxOrders})`} htmlFor="dev-orders" className="w-40">
              <Input
                id="dev-orders"
                type="number"
                min={1}
                max={maxOrders}
                value={orders}
                onChange={e => setOrders(clamp(Number(e.target.value), 1, maxOrders))}
              />
            </Field>
            <Button onClick={() => setConfirm("orders")} disabled={spareItems === 0}>
              <ShoppingCart className="size-4" aria-hidden /> Place…
            </Button>
          </div>
          {ordersResult && (
            <Result>
              <OutcomeChip outcome={ordersResult.failed.length ? "warn" : "pass"}>
                {ordersResult.placed.length} placed{ordersResult.failed.length ? `, ${ordersResult.failed.length} refused` : ""}
              </OutcomeChip>
              <span className="tabular font-mono text-[12px] text-ink-3">{ordersResult.ms} ms</span>
              {ordersResult.placed.length > 0 && (
                <p className="w-full text-[13px] text-ink-2">
                  {ordersResult.placed.map((c, i) => (
                    <span key={c}>
                      {i > 0 && ", "}
                      <Link href={`/admin/orders?open=${c}`} className="font-mono font-semibold text-teal-deep hover:underline">
                        {c}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
              {ordersResult.failed.map((f, i) => (
                <p key={i} className="w-full text-[13px] text-marker-deep">
                  {f}
                </p>
              ))}
            </Result>
          )}
        </Panel>

        <Panel title="Morning rush">
          <p className="text-sm text-ink-2">Simultaneous checkouts. Proves two shoppers can&apos;t buy the same last kilo.</p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <Field label={`Orders at once (5–${maxRush})`} htmlFor="dev-rush" className="w-44">
              <Input
                id="dev-rush"
                type="number"
                min={5}
                max={maxRush}
                value={rush}
                onChange={e => setRush(clamp(Number(e.target.value), 5, maxRush))}
              />
            </Field>
            <label className="flex h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-ink-2">
              <input
                type="checkbox"
                checked={contention}
                onChange={e => setContention(e.target.checked)}
                className="size-4 accent-teal-deep"
              />
              All on one item
            </label>
            <Button variant="tarp" onClick={() => setConfirm("rush")} disabled={spareItems === 0}>
              <Zap className="size-4" aria-hidden /> Start…
            </Button>
          </div>
          {rushResult && (
            <Result>
              <OutcomeChip
                outcome={
                  rushResult.contention && rushResult.contention.after < 0 ? "fail" : rushResult.otherErrors.length ? "warn" : "pass"
                }
              >
                {rushResult.placed} of {rushResult.attempted} placed
              </OutcomeChip>
              <span className="tabular font-mono text-[12px] text-ink-3">{rushResult.ms} ms wall time</span>
              <p className="w-full text-[13px] text-ink-2">
                {rushResult.conflicts} write conflict{rushResult.conflicts === 1 ? "" : "s"} · {rushResult.rejected} refused
                as out of stock
              </p>
              {rushResult.contention && (
                <p className="w-full text-[13px] text-ink-2">
                  {rushResult.contention.label}: {rushResult.contention.before} → {rushResult.contention.after} on hand
                  {rushResult.contention.before - rushResult.contention.after === rushResult.placed
                    ? " (exactly one unit per placed order)"
                    : " (does NOT match the placed count; check the ledger)"}
                </p>
              )}
              {rushResult.otherErrors.map((e, i) => (
                <p key={i} className="w-full text-[13px] text-marker-deep">
                  {e}
                </p>
              ))}
            </Result>
          )}
        </Panel>
      </div>

      <Panel title="Clean up">
        <div className="flex flex-wrap items-center gap-4">
          <p className="min-w-0 flex-1 text-sm text-ink-2">
            {openCount === 0
              ? "No open test orders. The demo data is clean."
              : `${openCount} open test order${openCount === 1 ? "" : "s"} holding ${heldUnits} unit${heldUnits === 1 ? "" : "s"}. Clean up before a demo.`}
          </p>
          <Button variant="danger" onClick={() => setConfirm("cleanup")} disabled={openCount === 0}>
            <Eraser className="size-4" aria-hidden /> Clean up…
          </Button>
        </div>
        {cleanupResult && (
          <Result>
            <OutcomeChip outcome="pass">{cleanupResult.cancelled.length} cancelled</OutcomeChip>
            {cleanupResult.skipped > 0 && (
              <span className="text-[13px] text-ink-3">{cleanupResult.skipped} changed status meanwhile and were skipped</span>
            )}
          </Result>
        )}
      </Panel>

      <Sheet
        open={confirm !== null}
        onClose={() => !pending && setConfirm(null)}
        title={confirm ? sheet[confirm].title : ""}
        description="This writes to the shared demo database."
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setConfirm(null)} disabled={pending}>
              Back
            </Button>
            <Button variant={confirm === "cleanup" ? "marker" : "primary"} loading={pending} onClick={runConfirmed}>
              {confirm ? sheet[confirm].cta : ""}
            </Button>
          </div>
        }
      >
        {confirm && sheet[confirm].body}
      </Sheet>
    </div>
  );
}

function Result({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg bg-ice px-3.5 py-3" role="status">
      {children}
    </div>
  );
}

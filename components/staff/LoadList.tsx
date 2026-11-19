"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { ArrowLeft, Check, LoaderCircle } from "lucide-react";
import { setLoaded, startTrip } from "@/lib/actions/trips";
import type { TripView } from "@/lib/trips-data";
import { shortSlot } from "@/lib/meta";
import { fmtDayRelative } from "@/lib/time";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { ActionBar } from "./StaffShell";

/**
 * Loading checklist. Bags are listed last stop first, the order they go into
 * the truck, so the first stop's bag ends up nearest the door. Ticks are
 * saved, so a packer can load and the driver sees it on their phone.
 */
export function LoadList({ trip, canStart }: { trip: TripView; canStart: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [starting, startStart] = useTransition();
  const [loaded, setOptimistic] = useOptimistic(
    new Set(trip.stops.filter(s => s.loaded).map(s => s.orderId)),
    (cur: Set<string>, change: { id: string; on: boolean }) => {
      const n = new Set(cur);
      if (change.on) n.add(change.id);
      else n.delete(change.id);
      return n;
    }
  );
  const [confirming, setConfirming] = useState(false);
  const bags = [...trip.stops].reverse();
  const all = trip.stops.length > 0 && loaded.size === trip.stops.length;

  function toggle(id: string) {
    const on = !loaded.has(id);
    start(async () => {
      setOptimistic({ id, on });
      const res = await setLoaded(id, on);
      // Success: the action already re-rendered this screen. Only a failure
      // needs a fresh read to show the real state.
      if (!res.ok) {
        toast({ title: "Couldn't update that bag", description: res.error, tone: "error" });
        router.refresh();
      }
    });
  }

  function leave() {
    startStart(async () => {
      const res = await startTrip(trip.id);
      if (!res.ok) {
        toast({ title: "The trip can't leave yet", description: res.error, tone: "error" });
        router.refresh();
        return;
      }
      toast({ title: `${trip.code} is on the road`, description: "Customers now see their stop number. Drive safe." });
      router.push(`/staff/trip/${trip.id}`);
    });
  }

  return (
    <div>
      <Link href="/staff/load" className="-ml-1 inline-flex h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-ink-2">
        <ArrowLeft className="size-4" aria-hidden /> All trips to load
      </Link>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
        <h1 className="sign text-[40px] leading-none text-ink">{trip.code}</h1>
        <p className="tabular text-sm font-semibold text-ink-2" aria-live="polite">
          {loaded.size} of {trip.stops.length} loaded
        </p>
      </div>
      <p className="mt-1 text-[15px] text-ink-2">
        {fmtDayRelative(trip.day)}, {shortSlot(trip.slot)} · {trip.vehicle} · {trip.driver?.name ?? "no driver yet"}
      </p>

      {trip.stops.length === 0 ? (
        <p className="mt-6 rounded-xl bg-paper p-5 text-ink-2 ring-1 ring-inset ring-ice-3">
          This trip has no stops yet. The office adds packed orders from Dispatch.
        </p>
      ) : (
        <>
          <p className="mt-5 text-[15px] font-bold text-ink">Load from the top: the last stop goes in first</p>
          <p className="text-[13px] text-ink-3">So the first stop&apos;s bag ends up nearest the door. Tap a bag once it&apos;s on the truck.</p>
          <ul className="mt-2 flex flex-col gap-2">
            {bags.map(s => {
              const on = loaded.has(s.orderId);
              return (
                <li key={s.orderId}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggle(s.orderId)}
                    className={`flex min-h-[76px] w-full items-center gap-4 rounded-[var(--radius-card)] px-4 py-3 text-left ring-inset transition-[background-color,box-shadow] ${
                      on ? "bg-leaf-soft ring-2 ring-leaf" : "bg-paper ring-1 ring-ice-3 active:bg-ice"
                    }`}
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-ink text-white" aria-label={`Stop ${s.stop}`}>
                      <span className="tabular text-[22px] font-bold">{s.stop}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[18px] font-bold text-ink">{s.firstName}</span>
                      <span className="block truncate text-[14px] text-ink-3">
                        {s.barangay} · {s.units} item{s.units === 1 ? "" : "s"} · <span className="font-mono">{s.code}</span>
                      </span>
                      {s.status !== "PACKED" && <span className="block text-[13px] font-semibold text-marker-deep">Not packed any more: ask the office</span>}
                    </span>
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-full ${on ? "bg-leaf text-white" : "bg-ice ring-2 ring-inset ring-ice-3"}`}
                      aria-hidden
                    >
                      {on && <Check className="size-6 stroke-[3]" />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <ActionBar>
        {canStart && confirming && all ? (
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-[14px] font-semibold text-ink">Leave now? Customers start seeing their stop number, and bags can&apos;t be changed after.</p>
            <div className="flex gap-2">
              <Button size="lg" variant="outline" className="h-14 text-[16px]" onClick={() => setConfirming(false)} disabled={starting}>
                Not yet
              </Button>
              <Button size="lg" variant="tarp" className="h-14 flex-1 text-[17px]" loading={starting} onClick={leave}>
                Yes, start the trip
              </Button>
            </div>
          </div>
        ) : canStart ? (
          <Button size="lg" variant="tarp" className="h-14 flex-1 text-[17px]" disabled={!all || pending} onClick={() => setConfirming(true)}>
            {all ? "Start trip" : `Load every bag first (${trip.stops.length - loaded.size} left)`}
          </Button>
        ) : (
          <p className="flex flex-1 items-center gap-2 py-3 text-[15px] font-semibold text-ink-2">
            {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            {!trip.driver
              ? "No driver on this trip yet. The office assigns one in Dispatch."
              : all
                ? `All loaded. ${trip.driver.name} starts the trip.`
                : `Tick each bag as it goes on. ${trip.driver.name} starts the trip once every bag is loaded.`}
          </p>
        )}
      </ActionBar>
    </div>
  );
}

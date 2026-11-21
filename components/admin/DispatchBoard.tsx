"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Banknote, Check, PackageCheck, Plus, Trash2, Truck, X } from "lucide-react";
import {
  draftTrip,
  moveStop,
  scrapTrip,
  setOrderTrip,
  updateTrip,
} from "@/lib/actions/trips";
import type { DispatchDay, DispatchOrder, DispatchSlot, TripView } from "@/lib/trips-data";
import { SLOT_CAPACITY, TRIP_STATUS_META, VEHICLES } from "@/lib/meta";
import { peso } from "@/lib/money";
import { fmtDayRelative, fmtLongDay, fmtTime } from "@/lib/time";
import { Button, Chip, Input, Select } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";

type Driver = { id: string; name: string };

/** Runs a trip action with a toast on failure (and an optional one on success). */
function useAct() {
  const toast = useToast();
  const [pending, start] = useTransition();
  const act = (work: () => Promise<{ ok: true } | { ok: false; error: string }>, success?: string) =>
    start(async () => {
      const res = await work();
      if (!res.ok) toast({ title: "Couldn't update the trip", description: res.error, tone: "error" });
      else if (success) toast({ title: success });
    });
  return { act, pending };
}

/**
 * The office's trip planner, by delivery day and slot. Packed orders without
 * a trip wait at the top of their slot; "Draft trip" takes them all in route
 * order. Planned trips can be reordered, split and reassigned until the
 * driver starts them. Returned trips wait here for the cash count.
 */
export function DispatchBoard({ days, drivers }: { days: DispatchDay[]; drivers: Driver[] }) {
  return (
    <div className="flex flex-col gap-10">
      {drivers.length === 0 && (
        <p className="rounded-xl bg-tarp-soft p-4 text-sm text-[#5c4300] ring-1 ring-inset ring-tarp-deep/40">
          There are no driver accounts yet. Trips can be planned, but someone with the Driver role has to start them.
        </p>
      )}
      {days.map(d => (
        <section key={d.day} aria-labelledby={`day-${d.day}`}>
          <h2 id={`day-${d.day}`} className="flex flex-wrap items-baseline gap-x-3">
            <span className="sign text-[30px] text-ink">{fmtDayRelative(d.day)}</span>
            <span className="text-[15px] text-ink-3">{fmtLongDay(d.day)}</span>
          </h2>
          <div className="mt-3 grid gap-4 xl:grid-cols-3">
            {d.slots.map(s => (
              <SlotPanel key={s.slot} day={d.day} slot={s} drivers={drivers} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SlotPanel({ day, slot: s, drivers }: { day: string; slot: DispatchSlot; drivers: Driver[] }) {
  const planned = s.trips.filter(t => t.status === "PLANNED");
  const quiet = s.booked === 0 && s.trips.length === 0 && s.unassigned.length === 0 && s.stillPacking === 0;
  return (
    <div className="flex flex-col rounded-[var(--radius-card)] bg-paper ring-1 ring-inset ring-ice-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-ice-3 px-4 py-3">
        <h3 className="text-[15px] font-bold text-ink">{s.slot}</h3>
        <p className="tabular text-[13px] text-ink-3">
          <span className={s.booked >= SLOT_CAPACITY ? "font-bold text-marker-deep" : ""}>
            {s.booked} of {SLOT_CAPACITY} booked
          </span>
          {s.stillPacking > 0 && ` · ${s.stillPacking} not packed yet`}
        </p>
      </div>
      {quiet ? (
        <p className="px-4 py-5 text-sm text-ink-3">Nothing booked yet.</p>
      ) : (
        <div className="flex flex-col gap-4 p-4">
          {s.unassigned.length > 0 && <Unassigned orders={s.unassigned} planned={planned} />}
          {s.trips.map(t => (
            <TripBlock key={t.id} trip={t} drivers={drivers} siblings={planned.filter(p => p.id !== t.id)} />
          ))}
          {(s.unassigned.length > 0 || s.trips.length === 0) && (
            <DraftForm day={day} slot={s.slot} drivers={drivers} count={s.unassigned.length} hasPlanned={planned.length > 0} />
          )}
        </div>
      )}
    </div>
  );
}

function Unassigned({ orders, planned }: { orders: DispatchOrder[]; planned: TripView[] }) {
  const { act, pending } = useAct();
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-ink-2">
        <PackageCheck className="size-4" aria-hidden /> Packed, no trip yet · {orders.length}
      </p>
      <ul className="mt-2 flex flex-col divide-y divide-ice-2 rounded-lg ring-1 ring-inset ring-ice-3">
        {orders.map(o => (
          <li key={o.id} className="flex items-center gap-2 px-3 py-2">
            <Link href={`/admin/orders?open=${o.code}`} className="min-w-0 flex-1">
              <span className="font-mono text-[13px] font-bold text-ink">{o.code}</span>{" "}
              <span className="font-semibold text-ink">{o.firstName}</span>
              <span className="block truncate text-[12px] text-ink-3">
                {o.barangay} · {o.units} item{o.units === 1 ? "" : "s"} · {o.payment === "COD" ? `COD ${peso(o.total)}` : "GCash"}
              </span>
            </Link>
            {planned.map(t => (
              <Button key={t.id} size="sm" variant="outline" disabled={pending} onClick={() => act(() => setOrderTrip(o.id, t.id))}>
                <Plus className="size-3.5" aria-hidden /> {t.code}
              </Button>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DraftForm({
  day,
  slot,
  drivers,
  count,
  hasPlanned,
}: {
  day: string;
  slot: string;
  drivers: Driver[];
  count: number;
  hasPlanned: boolean;
}) {
  const { act, pending } = useAct();
  const [open, setOpen] = useState(!hasPlanned);
  const [driverId, setDriverId] = useState(drivers[0]?.id ?? "");
  const [vehicle, setVehicle] = useState<string>(hasPlanned ? VEHICLES[1] : VEHICLES[0]);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex h-9 items-center gap-1.5 self-start text-[13px] font-semibold text-teal-deep hover:underline">
        <Plus className="size-4" aria-hidden /> Plan another trip for this slot
      </button>
    );
  }
  const listId = `vehicles-${day}-${slot}`;
  return (
    <form
      className="flex flex-col gap-2 rounded-lg bg-ice p-3 ring-1 ring-inset ring-ice-3"
      onSubmit={e => {
        e.preventDefault();
        act(() => draftTrip({ day, slot, driverId: driverId || null, vehicle }), count ? `Trip drafted with ${count} stop${count === 1 ? "" : "s"}` : "Trip drafted");
      }}
    >
      <p className="text-[13px] font-semibold text-ink">
        New trip{count ? ` · takes the ${count} packed order${count === 1 ? "" : "s"} above, in route order` : ""}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Select aria-label="Driver" value={driverId} onChange={e => setDriverId(e.target.value)} className="h-10 text-sm">
          <option value="">No driver yet</option>
          {drivers.map(d => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
        <Input aria-label="Vehicle" list={listId} value={vehicle} onChange={e => setVehicle(e.target.value)} className="h-10 text-sm" />
        <datalist id={listId}>
          {VEHICLES.map(v => (
            <option key={v} value={v} />
          ))}
        </datalist>
      </div>
      <div className="flex justify-end gap-2">
        {hasPlanned && (
          <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" loading={pending}>
          <Truck className="size-4" aria-hidden /> Plan trip
        </Button>
      </div>
    </form>
  );
}

function TripBlock({ trip: t, drivers, siblings }: { trip: TripView; drivers: Driver[]; siblings: TripView[] }) {
  const { act, pending } = useAct();
  const meta = TRIP_STATUS_META[t.status];
  const editable = t.status === "PLANNED";
  const [vehicle, setVehicle] = useState(t.vehicle);
  const loaded = t.stops.filter(s => s.loaded).length;
  const delivered = t.stops.filter(s => s.status === "COMPLETED").length;

  return (
    <div className="rounded-lg ring-1 ring-inset ring-ice-3">
      <div className="flex flex-wrap items-center gap-2 border-b border-ice-2 px-3 py-2.5">
        <span className="font-mono text-[14px] font-bold text-ink">{t.code}</span>
        <Chip tone={meta.tone}>{meta.label}</Chip>
        <span className="ml-auto text-[12px] text-ink-3">
          {t.status === "PLANNED" && `${loaded}/${t.stops.length} loaded`}
          {t.status === "OUT" && `${delivered}/${t.stops.length} delivered${t.departedAt ? ` · left ${fmtTime(t.departedAt)}` : ""}`}
          {(t.status === "RETURNED" || t.status === "REMITTED") && t.returnedAt && `back ${fmtTime(t.returnedAt)}`}
        </span>
      </div>

      {editable ? (
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-3 pt-3">
          <Select
            aria-label={`Driver for ${t.code}`}
            value={t.driver?.id ?? ""}
            disabled={pending}
            onChange={e => act(() => updateTrip(t.id, { driverId: e.target.value || null }))}
            className="h-9 text-[13px]"
          >
            <option value="">No driver yet</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
          <Input
            aria-label={`Vehicle for ${t.code}`}
            value={vehicle}
            onChange={e => setVehicle(e.target.value)}
            onBlur={() => vehicle.trim() !== t.vehicle && act(() => updateTrip(t.id, { vehicle }))}
            className="h-9 text-[13px]"
          />
          <Button
            size="sm"
            variant="danger"
            className="h-9"
            disabled={pending}
            onClick={() => act(() => scrapTrip(t.id), `Plan for ${t.code} deleted; its bags wait for a trip again`)}
            aria-label={`Delete the plan for ${t.code}`}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      ) : (
        <p className="px-3 pt-2.5 text-[13px] text-ink-2">
          {t.vehicle} · {t.driver?.name ?? "No driver"}
        </p>
      )}

      {t.stops.length === 0 ? (
        <p className="px-3 py-3 text-[13px] text-ink-3">No stops. Add packed orders above.</p>
      ) : (
        <ol className="flex flex-col py-1.5">
          {t.stops.map((s, i) => (
            <li key={s.orderId} className="flex items-center gap-2 px-3 py-1.5">
              <span
                className={`tabular grid size-7 shrink-0 place-items-center rounded-md text-[13px] font-bold ${
                  s.status === "COMPLETED" ? "bg-leaf text-white" : "bg-ink text-white"
                }`}
                aria-label={`Stop ${s.stop}`}
              >
                {s.status === "COMPLETED" ? <Check className="size-4" aria-hidden /> : s.stop}
              </span>
              <Link href={`/admin/orders?open=${s.code}`} className="min-w-0 flex-1 text-[13px]">
                <span className="font-mono font-bold text-ink">{s.code}</span> <span className="font-semibold text-ink">{s.firstName}</span>
                <span className="block truncate text-[12px] text-ink-3">
                  {s.barangay}
                  {s.payment === "COD" ? ` · COD ${peso(s.total)}` : ""}
                  {s.status === "COMPLETED" && s.note ? ` · ${s.note}` : ""}
                </span>
              </Link>
              {editable && (
                <>
                  {s.loaded && <Check className="size-4 shrink-0 text-leaf" aria-label="Loaded" />}
                  <IconBtn label={`Move ${s.code} earlier`} disabled={pending || i === 0} onClick={() => act(() => moveStop(t.id, s.orderId, -1))}>
                    <ArrowUp className="size-4" />
                  </IconBtn>
                  <IconBtn
                    label={`Move ${s.code} later`}
                    disabled={pending || i === t.stops.length - 1}
                    onClick={() => act(() => moveStop(t.id, s.orderId, 1))}
                  >
                    <ArrowDown className="size-4" />
                  </IconBtn>
                  {siblings.length > 0 && (
                    <select
                      aria-label={`Move ${s.code} to another trip`}
                      value=""
                      disabled={pending}
                      onChange={e => e.target.value && act(() => setOrderTrip(s.orderId, e.target.value))}
                      className="h-8 w-[74px] cursor-pointer rounded-md bg-paper px-1 text-[12px] font-semibold text-ink-2 ring-1 ring-inset ring-ice-3"
                    >
                      <option value="">Move…</option>
                      {siblings.map(x => (
                        <option key={x.id} value={x.id}>
                          {x.code}
                        </option>
                      ))}
                    </select>
                  )}
                  <IconBtn label={`Take ${s.code} off ${t.code}`} disabled={pending} onClick={() => act(() => setOrderTrip(s.orderId, null))}>
                    <X className="size-4" />
                  </IconBtn>
                </>
              )}
            </li>
          ))}
        </ol>
      )}

      {(t.status === "RETURNED" || t.status === "REMITTED") && t.cashCollected > 0 && (
        <p className="border-t border-ice-2 px-3 py-2.5 text-[13px] text-ink-2">
          <Banknote className="mr-1 inline size-4 align-[-3px] text-leaf" aria-hidden />
          COD collected <strong className="tabular text-ink">{peso(t.cashCollected)}</strong>
        </p>
      )}
    </div>
  );
}

function IconBtn({ label, children, ...rest }: { label: string; children: ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className="grid size-8 shrink-0 place-items-center rounded-md text-ink-2 ring-1 ring-inset ring-ice-3 hover:bg-ice hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}

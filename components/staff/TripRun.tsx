"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, Banknote, Check, ChevronDown, KeyRound, MapPin, Navigation, Phone, RotateCcw, Smartphone, Undo2, WifiOff } from "lucide-react";
import { completeStop, failStop, returnTrip } from "@/lib/actions/trips";
import type { Stop, TripView } from "@/lib/trips-data";
import { FAILED_STOP_REASONS, HANDOFF_FALLBACK_REASONS, shortSlot, TRIP_STATUS_META } from "@/lib/meta";
import { peso } from "@/lib/money";
import { fmtDayRelative, fmtTime } from "@/lib/time";
import { Button, ButtonLink, Chip, Input, Textarea } from "@/components/ui/primitives";
import { Sheet, Stamp } from "@/components/ui/motion";
import { useToast } from "@/components/ui/toast";
import { PinPad } from "./PinPad";
import { ActionBar } from "./StaffShell";

const NO_SIGNAL = "No signal. Nothing was lost: check your connection and tap Try again.";

/**
 * Run a server action from a sheet without losing what was typed when the
 * phone drops signal at the door: a network failure comes back as a message
 * instead of throwing to the error page.
 */
async function safely<T>(work: () => Promise<T>): Promise<T | "offline"> {
  try {
    return await work();
  } catch {
    return "offline";
  }
}

/** "PIN verified · COD ₱580 collected" → "PIN checked · ₱580 cash". */
function humanNote(note: string | null) {
  if (!note) return "";
  return note
    .replace("PIN verified", "PIN checked")
    .replace(/^No PIN: (.+?) · received by (.+?)( · |$)/, "No PIN ($1) · given to $2$3")
    .replace(/ · COD (₱[\d,.]+) collected/, " · $1 cash");
}

/**
 * The driver's run. The next stop sits on top with everything needed at the
 * door; later stops wait below and finished ones fold away. Each stop ends
 * with the customer's 4-digit PIN (or a logged reason), or comes back.
 */
export function TripRun({ trip }: { trip: TripView }) {
  const toast = useToast();
  const [handoff, setHandoff] = useState<Stop | null>(null);
  const [failing, setFailing] = useState<Stop | null>(null);
  const [returning, startReturn] = useTransition();
  const [confirmReturn, setConfirmReturn] = useState(false);
  const meta = TRIP_STATUS_META[trip.status];
  const out = trip.status === "OUT";
  const onTruck = trip.stops.filter(s => s.status === "READY");
  const done = trip.stops.filter(s => s.status === "COMPLETED");
  const [next, ...later] = onTruck;

  function goBack() {
    startReturn(async () => {
      const res = await safely(() => returnTrip(trip.id));
      if (res === "offline") return toast({ title: "No signal", description: "Try again in a moment.", tone: "error" });
      if (!res.ok) return toast({ title: "Not yet", description: res.error, tone: "error" });
      setConfirmReturn(false);
      toast({
        title: "Trip closed",
        description: trip.cashCollected > 0 ? `COD collected: ${peso(trip.cashCollected)}.` : "Back at the stall.",
      });
    });
  }

  return (
    <div>
      <Link href="/staff/trip" className="-ml-1 inline-flex h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-ink-2">
        <ArrowLeft className="size-4" aria-hidden /> All trips
      </Link>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="sign text-[40px] leading-none text-ink">{trip.code}</h1>
        <Chip tone={meta.tone}>{meta.label}</Chip>
      </div>
      <p className="mt-1 text-[15px] text-ink-2">
        {fmtDayRelative(trip.day)}, {shortSlot(trip.slot)} · {trip.vehicle}
        {trip.departedAt && ` · left ${fmtTime(trip.departedAt)}`}
      </p>

      {trip.status === "PLANNED" && (
        <div className="mt-5 rounded-[var(--radius-card)] bg-tarp-soft p-4 ring-1 ring-inset ring-tarp-deep/40">
          <p className="font-bold text-ink">Load the truck first</p>
          <p className="mt-1 text-sm text-[#4a3700]">Tick every bag onto the truck, then start the trip from the loading screen.</p>
          <ButtonLink href={`/staff/load/${trip.id}`} variant="tarp" size="lg" className="mt-3 w-full">
            Open the loading list
          </ButtonLink>
        </div>
      )}

      {out && !next && trip.stops.length > 0 && (
        <div className="mt-5 rounded-[var(--radius-card)] bg-leaf-soft p-5 ring-1 ring-inset ring-leaf/40">
          <p className="text-[18px] font-bold text-[#14532f]">Every stop is done</p>
          <p className="mt-1 text-[15px] text-[#14532f]">Drive back to the stall, then tap “Back at the stall” below.</p>
        </div>
      )}

      {next && (
        <section className="mt-5" aria-label="Next stop">
          <h2 className="mb-2 text-[14px] font-bold text-teal-deep">Next stop</h2>
          <NextStop stop={next} active={out} onHandoff={() => setHandoff(next)} onFail={() => setFailing(next)} />
        </section>
      )}

      {later.length > 0 && (
        <section className="mt-6" aria-label="Later stops">
          <h2 className="mb-2 text-[14px] font-bold text-ink-2">
            After that · {later.length} stop{later.length === 1 ? "" : "s"}
          </h2>
          <ol className="flex flex-col gap-2">
            {later.map(s => (
              <LaterStop key={s.orderId} stop={s} active={out} onHandoff={() => setHandoff(s)} />
            ))}
          </ol>
        </section>
      )}

      {done.length > 0 && (
        <details className="group mt-6 rounded-[var(--radius-card)] bg-paper/60 ring-1 ring-inset ring-ice-3" open={!next}>
          <summary className="flex min-h-[52px] cursor-pointer list-none items-center gap-2 px-4 text-[15px] font-semibold text-ink-2 [&::-webkit-details-marker]:hidden">
            <Check className="size-5 text-leaf" aria-hidden />
            <span className="flex-1">Delivered · {done.length}</span>
            <ChevronDown className="size-5 text-ink-3 transition-transform duration-200 group-open:rotate-180" aria-hidden />
          </summary>
          <ol className="border-t border-ice-2 px-4 pb-2">
            {done.map(s => (
              <li key={s.orderId} className="flex items-start gap-3 border-b border-ice-2 py-2.5 last:border-b-0">
                <span className="tabular mt-0.5 w-6 shrink-0 text-[14px] font-bold text-ink-3">{s.stop}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">{s.contact?.name ?? s.firstName}</span>
                  <span className={`block text-[13px] ${s.note?.startsWith("PIN verified") ? "text-[#14532f]" : "text-[#5c4300]"}`}>
                    {s.deliveredAt ? `${fmtTime(s.deliveredAt)} · ` : ""}
                    {humanNote(s.note)}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </details>
      )}

      {trip.stops.length === 0 && <p className="mt-4 rounded-xl bg-paper p-5 text-ink-2 ring-1 ring-inset ring-ice-3">No stops on this trip.</p>}

      <ActionBar>
        {out && confirmReturn ? (
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-[14px] font-semibold text-ink">
              Back at the stall?{trip.cashCollected > 0 ? ` Total COD collected: ${peso(trip.cashCollected)}.` : ""} This closes the trip.
            </p>
            <div className="flex gap-2">
              <Button size="lg" variant="outline" className="h-14 text-[16px]" onClick={() => setConfirmReturn(false)} disabled={returning}>
                Not yet
              </Button>
              <Button size="lg" variant="ink" className="h-14 flex-1 text-[17px]" loading={returning} onClick={goBack}>
                Yes, I&apos;m back
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <p className="tabular text-[15px] font-bold text-ink">
                {done.length} of {trip.stops.length} delivered
              </p>
              <p className="tabular text-[13px] text-ink-2">
                Cash collected <strong className="text-ink">{peso(trip.cashCollected)}</strong>
                {trip.cashToCollect > 0 && <> · {peso(trip.cashToCollect)} still to collect</>}
              </p>
            </div>
            {out &&
              (onTruck.length > 0 ? (
                <p className="shrink-0 text-right text-[13px] font-semibold text-ink-3">
                  {onTruck.length} bag{onTruck.length === 1 ? "" : "s"}
                  <br />
                  still on the truck
                </p>
              ) : (
                <Button size="lg" variant="ink" className="h-14 shrink-0 px-5 text-[16px]" onClick={() => setConfirmReturn(true)}>
                  Back at the stall
                </Button>
              ))}
            {(trip.status === "RETURNED" || trip.status === "REMITTED") && (
              <p className="shrink-0 text-right text-[13px] text-ink-2">
                Trip closed
                {trip.cashCollected > 0 && (
                  <>
                    <br />
                    <strong className="tabular text-ink">{peso(trip.cashCollected)} COD</strong>
                  </>
                )}
              </p>
            )}
          </>
        )}
      </ActionBar>

      <HandoffSheet
        stop={handoff}
        onClose={() => setHandoff(null)}
        onFail={s => {
          setHandoff(null);
          setFailing(s);
        }}
      />
      <FailSheet stop={failing} tripCode={trip.code} onClose={() => setFailing(null)} />
    </div>
  );
}

function PaymentBand({ stop: s, big = false }: { stop: Stop; big?: boolean }) {
  return s.payment === "COD" ? (
    <div className={`flex items-center gap-2 rounded-lg bg-tarp px-3 text-ink ${big ? "py-3 text-[17px]" : "py-1.5 text-[14px]"}`}>
      <Banknote className="size-5 shrink-0" aria-hidden />
      <span>
        Collect <strong className="tabular">{peso(s.total)}</strong> cash
      </span>
    </div>
  ) : (
    <div className={`flex items-center gap-2 rounded-lg bg-ice px-3 text-ink-2 ${big ? "py-3 text-[16px]" : "py-1.5 text-[14px]"}`}>
      <Smartphone className="size-5 shrink-0" aria-hidden />
      <span>Paid by GCash · nothing to collect</span>
    </div>
  );
}

const mapsFor = (s: Stop) => {
  const where = s.contact ? `${s.contact.address}, ${s.barangay}` : s.barangay;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${where}, Dasmariñas, Cavite`)}`;
};

/** Everything for the door, in reach of a thumb. */
function NextStop({ stop: s, active, onHandoff, onFail }: { stop: Stop; active: boolean; onHandoff: () => void; onFail: () => void }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-paper p-4 shadow-[var(--shadow-lift)] ring-2 ring-inset ring-teal-deep" aria-current="step">
      <div className="flex items-start gap-3.5">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-teal-deep text-white" aria-label={`Stop ${s.stop}`}>
          <span className="tabular text-[22px] font-bold">{s.stop}</span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[20px] font-bold leading-tight text-ink">{s.contact?.name ?? s.firstName}</p>
          <p className="mt-1 flex items-start gap-1.5 text-[16px] text-ink-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
            {s.contact ? `${s.contact.address}, ${s.barangay}` : s.barangay}
          </p>
          <p className="mt-1 text-[14px] text-ink-3">
            {s.units} item{s.units === 1 ? "" : "s"}: {s.lines.map(l => `${l.qty}× ${l.name}`).join(", ")} · <span className="font-mono">{s.code}</span>
          </p>
        </div>
      </div>

      <div className="mt-3">
        <PaymentBand stop={s} big />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {s.contact && (
          <a
            href={`tel:${s.contact.phone.replace(/\s/g, "")}`}
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-ice text-[16px] font-semibold text-ink ring-1 ring-inset ring-ice-3 active:bg-ice-2"
          >
            <Phone className="size-5" aria-hidden /> Call
          </a>
        )}
        <a
          href={mapsFor(s)}
          target="_blank"
          rel="noreferrer"
          className={`flex h-14 items-center justify-center gap-2 rounded-xl bg-ice text-[16px] font-semibold text-ink ring-1 ring-inset ring-ice-3 active:bg-ice-2 ${s.contact ? "" : "col-span-2"}`}
        >
          <Navigation className="size-5" aria-hidden /> Maps
        </a>
      </div>

      {active && (
        <>
          <Button size="lg" className="mt-2 h-16 w-full text-[18px]" onClick={onHandoff}>
            <KeyRound className="size-5" aria-hidden /> Hand over the order
          </Button>
          <button
            type="button"
            onClick={onFail}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-marker-deep ring-1 ring-inset ring-marker/30 active:bg-marker-soft"
          >
            <Undo2 className="size-4" aria-hidden /> Couldn&apos;t deliver this one
          </button>
        </>
      )}
    </div>
  );
}

/** A stop further down the route: enough to recognise it, one tap to finish it early. */
function LaterStop({ stop: s, active, onHandoff }: { stop: Stop; active: boolean; onHandoff: () => void }) {
  return (
    <li className="flex items-center gap-3 rounded-[var(--radius-card)] bg-paper px-3 py-3 ring-1 ring-inset ring-ice-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-ink text-white" aria-label={`Stop ${s.stop}`}>
        <span className="tabular text-[17px] font-bold">{s.stop}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-bold text-ink">{s.contact?.name ?? s.firstName}</span>
        <span className="block truncate text-[13px] text-ink-3">
          {s.barangay} · {s.payment === "COD" ? `collect ${peso(s.total)}` : "GCash, paid"}
        </span>
      </span>
      {active && (
        <Button size="sm" variant="outline" className="h-11 shrink-0" onClick={onHandoff}>
          Hand over
        </Button>
      )}
    </li>
  );
}

// ── Handoff ─────────────────────────────────────────────────────────────────

type HandoffInput = Parameters<typeof completeStop>[1];

/**
 * Finishing a stop, one step at a time: (1) for cash orders, take the cash;
 * (2) type the customer's PIN, or (3) if there's no PIN, log why and who took
 * it. A dropped signal keeps everything typed and offers Try again.
 */
function HandoffSheet({ stop, onClose, onFail }: { stop: Stop | null; onClose: () => void; onFail: (s: Stop) => void }) {
  const toast = useToast();
  const [pin, setPin] = useState("");
  const [mode, setMode] = useState<"pin" | "fallback">("pin");
  const [cod, setCod] = useState(false);
  const [reason, setReason] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState<HandoffInput | null>(null);
  const [shake, setShake] = useState(0);
  const [triesLeft, setTriesLeft] = useState<number>(stop?.triesLeft ?? 0);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  // A different stop starts fresh (reset during render, not in an effect).
  const [forId, setForId] = useState(stop?.orderId);
  if (forId !== stop?.orderId) {
    setForId(stop?.orderId);
    setPin("");
    setCod(false);
    setReason("");
    setReceivedBy("");
    setError(null);
    setRetry(null);
    setTriesLeft(stop?.triesLeft ?? 0);
    setDone(false);
    setMode(stop && (!stop.hasPin || stop.pinLocked) ? "fallback" : "pin");
  }

  const needCash = stop?.payment === "COD";
  const cashStep = needCash && !cod;
  const pinUsable = !!stop?.hasPin && !stop.pinLocked && triesLeft > 0;
  const reasons = HANDOFF_FALLBACK_REASONS.filter(r => (stop?.hasPin ? r !== "Order placed before PINs" : true));
  const missing = [
    reason.trim().length < 3 && "Pick or type why there's no PIN",
    receivedBy.trim().length < 2 && "Type who received it",
  ].filter(Boolean) as string[];

  function submit(input: HandoffInput) {
    if (!stop) return;
    setError(null);
    setRetry(null);
    start(async () => {
      const res = await safely(() => completeStop(stop.orderId, input));
      if (res === "offline") {
        setError(NO_SIGNAL);
        setRetry(input);
        return;
      }
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (res.data.wrongPin) {
        setPin("");
        setShake(n => n + 1);
        setTriesLeft(res.data.triesLeft);
        if (res.data.triesLeft === 0) {
          setMode("fallback");
          setReason("PIN locked after wrong tries");
          setError("That PIN is locked after too many wrong tries. Finish with a reason instead.");
        } else {
          setError(`Wrong PIN. Ask them to check it: ${res.data.triesLeft} ${res.data.triesLeft === 1 ? "try" : "tries"} left.`);
        }
        return;
      }
      // The action already refreshed the trip behind the sheet: show the
      // stamp for a moment, then close.
      setDone(true);
      toast({ title: `Stop ${stop.stop} delivered`, description: input.kind === "pin" ? "PIN checked." : "Logged without a PIN." });
      window.setTimeout(onClose, 900);
    });
  }

  function onPin(v: string) {
    setPin(v);
    setError(null);
    setRetry(null);
    if (v.length === 4) submit({ kind: "pin", pin: v, codCollected: cod });
  }

  return (
    <Sheet
      open={!!stop}
      onClose={onClose}
      title={stop ? `Stop ${stop.stop} · ${stop.contact?.name ?? stop.firstName}` : ""}
      description={
        !stop
          ? undefined
          : cashStep
            ? "Step 1: take the cash."
            : mode === "pin" && pinUsable
              ? `${needCash ? "Step 2: " : ""}ask for the 4-digit PIN. It's on their order page in the Hook & Box account.`
              : "No PIN: say why and who took the order."
      }
    >
      {stop && done ? (
        <div className="flex flex-col items-center py-14">
          <Stamp tone="leaf" rotate={-8} className="text-[46px]">
            Delivered
          </Stamp>
        </div>
      ) : stop ? (
        <div className="flex flex-col gap-5">
          {cashStep ? (
            <>
              <p className="text-center text-[15px] text-ink-2">Count it before you hand over the bag.</p>
              <Button size="lg" variant="tarp" className="h-20 text-[20px]" onClick={() => setCod(true)}>
                <Banknote className="size-6" aria-hidden /> I collected {peso(stop.total)}
              </Button>
            </>
          ) : (
            <>
              {needCash && (
                <p className="flex items-center justify-between gap-3 rounded-xl bg-leaf-soft px-4 py-3 text-[15px] font-semibold text-[#14532f] ring-1 ring-inset ring-leaf/40">
                  <span className="flex items-center gap-2">
                    <Check className="size-5" aria-hidden /> {peso(stop.total)} cash collected
                  </span>
                  <button type="button" className="h-10 px-2 text-[14px] underline underline-offset-4" onClick={() => setCod(false)} disabled={pending}>
                    Change
                  </button>
                </p>
              )}

              {mode === "pin" && pinUsable ? (
                <>
                  <PinPad value={pin} onChange={onPin} disabled={pending} shake={shake} />
                  <p className="text-center text-[13px] text-ink-3" aria-live="polite">
                    {pending ? "Checking…" : `${triesLeft} ${triesLeft === 1 ? "try" : "tries"} before the PIN locks`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("fallback");
                      setError(null);
                    }}
                    className="mx-auto h-11 text-[15px] font-semibold text-teal-deep underline underline-offset-4"
                  >
                    Customer can&apos;t give the PIN?
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  {!stop.hasPin && <p className="text-sm text-ink-2">This order was placed before PINs, so it finishes with a reason.</p>}
                  <fieldset>
                    <legend className="text-[14px] font-semibold text-ink-2">Why no PIN?</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {reasons.map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setReason(r)}
                          aria-pressed={reason === r}
                          className={`min-h-11 rounded-full px-4 text-[14px] font-semibold ring-1 ring-inset ${reason === r ? "bg-ink text-white ring-ink" : "bg-paper text-ink-2 ring-ice-3"}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="received-by" className="text-[14px] font-semibold text-ink-2">
                      Who received it?
                    </label>
                    <Input id="received-by" value={receivedBy} onChange={e => setReceivedBy(e.target.value)} placeholder="Name, e.g. Lola Nena (mother)" className="h-12 text-[16px]" />
                  </div>
                  <Button
                    size="lg"
                    className="h-14 text-[17px]"
                    loading={pending}
                    disabled={missing.length > 0}
                    onClick={() => submit({ kind: "fallback", reason, receivedBy, codCollected: cod })}
                  >
                    Confirm delivery without PIN
                  </Button>
                  {missing.length > 0 && <p className="text-center text-[13px] text-ink-3">Still needed: {missing.join(" · ")}</p>}
                  {pinUsable && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("pin");
                        setError(null);
                      }}
                      className="mx-auto h-11 text-[15px] font-semibold text-teal-deep underline underline-offset-4"
                    >
                      Back to the PIN
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {error && (
            <div role="alert" className="flex flex-col gap-2 rounded-lg bg-marker-soft px-3 py-2.5 text-[15px] font-semibold text-marker-deep">
              <p className="flex items-start gap-2">
                {retry && <WifiOff className="mt-0.5 size-4 shrink-0" aria-hidden />}
                {error}
              </p>
              {retry && (
                <Button variant="marker" className="h-12" loading={pending} onClick={() => submit(retry)}>
                  <RotateCcw className="size-4" aria-hidden /> Try again
                </Button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => onFail(stop)}
            className="mx-auto h-11 text-[14px] font-semibold text-marker-deep underline underline-offset-4"
            disabled={pending}
          >
            Couldn&apos;t deliver this one?
          </button>
        </div>
      ) : null}
    </Sheet>
  );
}

function FailSheet({ stop, tripCode, onClose }: { stop: Stop | null; tripCode: string; onClose: () => void }) {
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [forId, setForId] = useState(stop?.orderId);
  if (forId !== stop?.orderId) {
    setForId(stop?.orderId);
    setReason("");
    setError(null);
  }
  return (
    <Sheet
      open={!!stop}
      onClose={onClose}
      title={stop ? `Couldn't deliver stop ${stop.stop}?` : ""}
      description="The bag comes back with the truck and the office sends it again later."
      footer={
        <Button
          size="lg"
          variant="marker"
          className="h-14 w-full text-[17px]"
          loading={pending}
          disabled={reason.trim().length < 3}
          onClick={() =>
            stop &&
            start(async () => {
              setError(null);
              const res = await safely(() => failStop(stop.orderId, reason));
              if (res === "offline") return setError(NO_SIGNAL);
              if (!res.ok) return toast({ title: "Couldn't update the stop", description: res.error, tone: "error" });
              toast({ title: `${stop.code} is coming back`, description: `Taken off ${tripCode}. Bring the bag to the stall.` });
              onClose();
            })
          }
        >
          {error ? "Try again" : "Bring it back"}
        </Button>
      }
    >
      <fieldset>
        <legend className="text-[14px] font-semibold text-ink-2">What happened?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {FAILED_STOP_REASONS.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              aria-pressed={reason === r}
              className={`min-h-11 rounded-full px-4 text-[14px] font-semibold ring-1 ring-inset ${reason === r ? "bg-ink text-white ring-ink" : "bg-paper text-ink-2 ring-ice-3"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </fieldset>
      <Textarea className="mt-4" value={reason} onChange={e => setReason(e.target.value)} placeholder="Or say what happened" rows={3} />
      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-marker-soft px-3 py-2.5 text-[15px] font-semibold text-marker-deep">
          <WifiOff className="mt-0.5 size-4 shrink-0" aria-hidden /> {error}
        </p>
      )}
    </Sheet>
  );
}

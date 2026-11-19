import { KeyRound, Search } from "lucide-react";
import { verifyTrack } from "@/lib/actions/track";
import { Button } from "@/components/ui/primitives";

const inputClass =
  "h-12 w-full rounded-xl bg-paper text-ink ring-1 ring-inset ring-ice-3 outline-none placeholder:text-ink-3/80 focus:ring-2 focus:ring-teal-deep aria-invalid:ring-2 aria-invalid:ring-marker";

/**
 * Code + last 4 phone digits. Posts to `verifyTrack`, which lets the order's
 * owner and staff straight through and hands anyone else the order's
 * shareable tracking link once the digits match.
 */
export function TrackLookup({
  code = "",
  miss = false,
  dest,
  signedIn,
}: {
  code?: string;
  miss?: boolean;
  dest?: "receipt";
  signedIn: boolean;
}) {
  return (
    <form action={verifyTrack} className="mt-6 max-w-xl" aria-describedby="track-hint">
      {dest && <input type="hidden" name="dest" value={dest} />}
      <div className="grid gap-3 sm:grid-cols-[1.3fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="code" className="text-[13px] font-semibold text-ink-2">
            Order code
          </label>
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
            <input
              id="code"
              name="code"
              defaultValue={code}
              placeholder="HB-0003"
              autoCapitalize="characters"
              required
              aria-invalid={miss || undefined}
              className={`${inputClass} pl-10 pr-3 font-mono text-[17px] uppercase tracking-wide`}
            />
          </div>
        </div>
        <div>
          <label htmlFor="last4" className="text-[13px] font-semibold text-ink-2">
            Last 4 digits of phone
          </label>
          <div className="relative mt-1.5">
            <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
            <input
              id="last4"
              name="last4"
              inputMode="numeric"
              autoComplete="off"
              pattern="\d{4}"
              maxLength={4}
              placeholder="4567"
              required={!signedIn}
              autoFocus={!!code}
              aria-invalid={miss || undefined}
              className={`${inputClass} tabular pl-10 pr-3 text-[17px] tracking-[0.2em]`}
            />
          </div>
        </div>
        <Button type="submit" size="lg" className="h-12">
          {dest ? "Open receipt" : "Track"}
        </Button>
      </div>
      <p id="track-hint" className="mt-2.5 text-[13px] text-ink-3">
        Use the phone number you gave at checkout.
        {signedIn ? " Your own orders open without it." : " Signed in? Your own orders open without it."}
      </p>
    </form>
  );
}

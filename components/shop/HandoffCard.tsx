import { KeyRound, Truck } from "lucide-react";
import type { OwnerExtras } from "@/lib/orders";

/**
 * The customer's handoff PIN, shown only to the signed-in customer who placed
 * the order. The driver types it at the door; that's how the store knows the
 * order reached the right person.
 */
export function HandoffCard({ extras, onTruck }: { extras: OwnerExtras; onTruck: boolean }) {
  if (!extras.pin && !extras.driver) return null;
  return (
    <section
      aria-labelledby="handoff-title"
      className="grid gap-5 rounded-[var(--radius-card)] bg-tarp-soft p-5 ring-1 ring-inset ring-tarp-deep/40 sm:grid-cols-[auto_1fr] sm:items-center sm:p-6"
    >
      {extras.pin ? (
        <div className="flex flex-col items-start">
          <p id="handoff-title" className="flex items-center gap-1.5 text-[13px] font-bold text-[#5c4300]">
            <KeyRound className="size-4" aria-hidden /> Your handoff PIN
          </p>
          <p className="mt-1 font-marker text-[52px] leading-none tracking-[0.12em] text-ink" aria-label={`PIN ${extras.pin.split("").join(" ")}`}>
            {extras.pin}
          </p>
        </div>
      ) : (
        <p id="handoff-title" className="sr-only">
          Delivery
        </p>
      )}
      <div className="text-sm text-[#4a3700]">
        {extras.pin && (
          <p>
            Tell this PIN to the driver when your order arrives. Don&apos;t share it before then: it&apos;s how we know the
            right person received it.
          </p>
        )}
        {onTruck && extras.driver && (
          <p className="mt-2 flex items-center gap-2 font-semibold text-ink">
            <Truck className="size-4 shrink-0" aria-hidden />
            {extras.driver.name} is bringing it on {extras.driver.vehicle}.
          </p>
        )}
      </div>
    </section>
  );
}

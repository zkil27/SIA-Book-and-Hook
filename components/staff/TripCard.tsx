import Link from "next/link";
import { ChevronRight, Truck } from "lucide-react";
import type { TripView } from "@/lib/trips-data";
import { TRIP_STATUS_META } from "@/lib/meta";
import { fmtDayRelative } from "@/lib/time";
import { Chip } from "@/components/ui/primitives";

/** A trip in a staff list: code, when, vehicle, driver and progress. */
export function TripCard({ trip, href, progress }: { trip: TripView; href: string; progress: string }) {
  const meta = TRIP_STATUS_META[trip.status];
  return (
    <Link
      href={href}
      className="flex min-h-[84px] items-center gap-4 rounded-[var(--radius-card)] bg-paper px-4 py-3 ring-1 ring-inset ring-ice-3 transition-colors active:bg-ice"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-ice text-ink-2" aria-hidden>
        <Truck className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[15px] font-bold text-ink">{trip.code}</span>
          <Chip tone={meta.tone}>{meta.label}</Chip>
        </span>
        <span className="mt-0.5 block truncate text-[16px] font-bold text-ink">
          {fmtDayRelative(trip.day)} · {trip.slot}
        </span>
        <span className="block truncate text-[14px] text-ink-3">
          {trip.vehicle} · {trip.driver?.name ?? "No driver yet"} · {progress}
        </span>
      </span>
      <ChevronRight className="size-6 shrink-0 text-ink-3" aria-hidden />
    </Link>
  );
}

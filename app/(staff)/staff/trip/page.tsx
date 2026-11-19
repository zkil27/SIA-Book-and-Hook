import { peso } from "@/lib/money";
import { requireRole } from "@/lib/session";
import { openTripsFor } from "@/lib/trips-data";
import { StaffEmpty } from "@/components/staff/StaffShell";
import { TripCard } from "@/components/staff/TripCard";

export const metadata = { title: "Deliver" };

export default async function TripsPage() {
  const me = await requireRole(["ADMIN", "DRIVER"], "/staff/trip");
  const trips = await openTripsFor(me.role === "ADMIN" ? null : me.id);
  return (
    <div>
      <h1 className="sign text-[40px] leading-none text-ink">{me.role === "ADMIN" ? "Every driver's trips" : "Deliver"}</h1>
      <p className="mt-2 text-[15px] text-ink-2">
        {me.role === "ADMIN" ? "What each driver sees on their phone." : "Your trips. A trip still being loaded opens the loading list; one on the road opens its stops."}
      </p>
      {trips.length === 0 ? (
        <StaffEmpty title={<p className="sign text-[30px] text-ink">No trips yet</p>}>
          When the office puts you on a trip, it shows up here with its stops in route order.
        </StaffEmpty>
      ) : (
        <ul className="mt-5 flex flex-col gap-2">
          {trips.map(t => {
            const delivered = t.stops.filter(s => s.status === "COMPLETED").length;
            const loaded = t.stops.filter(s => s.loaded).length;
            return (
              <li key={t.id}>
                <TripCard
                  trip={t}
                  href={t.status === "PLANNED" ? `/staff/load/${t.id}` : `/staff/trip/${t.id}`}
                  progress={
                    t.status === "PLANNED"
                      ? `Load first: ${loaded} of ${t.stops.length} bags on`
                      : t.status === "REMITTED" && t.remit
                        ? `Done · cash confirmed ${peso(t.remit.received)}`
                        : t.status === "RETURNED"
                          ? `Back · hand ${peso(t.cashCollected)} to the office`
                          : `${delivered} of ${t.stops.length} delivered`
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

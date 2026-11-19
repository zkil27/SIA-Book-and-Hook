import { requireRole } from "@/lib/session";
import { tripsToLoad } from "@/lib/trips-data";
import { StaffEmpty } from "@/components/staff/StaffShell";
import { TripCard } from "@/components/staff/TripCard";

export const metadata = { title: "Load the truck" };

export default async function LoadPage() {
  const me = await requireRole(["ADMIN", "PACKER", "DRIVER"], "/staff/load");
  // A driver loads their own truck; packers and the office see every trip.
  const trips = await tripsToLoad(me.role === "DRIVER" ? me.id : null);
  return (
    <div>
      <h1 className="sign text-[40px] leading-none text-ink">Load the truck</h1>
      <p className="mt-2 text-[15px] text-ink-2">Pick a trip, then tick each bag as it goes on the truck. The trip leaves once every bag is loaded.</p>
      {trips.length === 0 ? (
        <StaffEmpty title={<p className="sign text-[30px] text-ink">No trips to load</p>}>
          The office puts packed bags on a trip in Dispatch. Trips show up here to load.
        </StaffEmpty>
      ) : (
        <ul className="mt-5 flex flex-col gap-2">
          {trips.map(t => (
            <li key={t.id}>
              <TripCard
                trip={t}
                href={`/staff/load/${t.id}`}
                progress={`${t.stops.filter(s => s.loaded).length} of ${t.stops.length} bags loaded`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

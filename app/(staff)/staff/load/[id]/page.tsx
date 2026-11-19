import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { getTrip } from "@/lib/trips-data";
import { LoadList } from "@/components/staff/LoadList";

export const metadata = { title: "Load the truck" };

export default async function LoadTripPage(props: PageProps<"/staff/load/[id]">) {
  const me = await requireRole(["ADMIN", "PACKER", "DRIVER"], "/staff/load");
  const { id } = await props.params;
  // Loading needs no customer contact details: first names and barangays only.
  const trip = await getTrip(id, false);
  if (!trip) notFound();
  if (trip.status !== "PLANNED") {
    redirect(me.role === "PACKER" ? "/staff/load" : `/staff/trip/${trip.id}`);
  }
  const canStart = me.role === "ADMIN" || (me.role === "DRIVER" && trip.driver?.id === me.id);
  return <LoadList trip={trip} canStart={canStart && !!trip.driver} />;
}

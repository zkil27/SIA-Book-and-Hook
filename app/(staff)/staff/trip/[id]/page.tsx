import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { getTrip } from "@/lib/trips-data";
import { TripRun } from "@/components/staff/TripRun";

export const metadata = { title: "Trip" };

export default async function TripPage(props: PageProps<"/staff/trip/[id]">) {
  const me = await requireRole(["ADMIN", "DRIVER"], "/staff/trip");
  const { id } = await props.params;
  const trip = await getTrip(id, true);
  if (!trip) notFound();
  // Customer names, phones and addresses reach only the trip's own driver (or
  // an admin): anyone else is sent away before anything renders.
  if (me.role !== "ADMIN" && trip.driver?.id !== me.id) redirect("/staff/trip");
  return <TripRun trip={trip} />;
}

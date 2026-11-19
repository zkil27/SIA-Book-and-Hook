import { requireRole } from "@/lib/session";
import { packedBags, packQueue, pullTotals } from "@/lib/trips-data";
import { PackBoard } from "@/components/staff/PackBoard";

export const metadata = { title: "Pack" };

export default async function PackPage() {
  await requireRole(["ADMIN", "PACKER"], "/staff/pack");
  const [queue, pull, packed] = await Promise.all([packQueue(), pullTotals(), packedBags()]);
  return <PackBoard queue={queue} pull={pull} packed={packed} />;
}

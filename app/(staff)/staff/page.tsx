import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import { homeFor } from "@/lib/roles";

/** /staff sends each staff member to their own screen. */
export default async function StaffHome() {
  const me = await getUser();
  redirect(me ? homeFor(me.role) : "/login?next=/staff");
}

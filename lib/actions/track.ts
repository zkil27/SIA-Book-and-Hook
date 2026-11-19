"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { orderCode, parseOrderCode } from "@/lib/meta";
import { isStaff } from "@/lib/roles";
import { getUser } from "@/lib/session";
import { sameLast4, trackToken } from "@/lib/track-access";

/**
 * The /track and /receipt lookup form. The order's owner and staff go straight
 * through; anyone else must match the last 4 digits of the delivery phone,
 * then gets the shareable tracking link (`?t=`). A wrong code and wrong digits
 * get the same answer, so the form never reveals which orders exist.
 */
export async function verifyTrack(form: FormData): Promise<void> {
  const rawCode = String(form.get("code") ?? "").trim();
  const last4 = String(form.get("last4") ?? "").replace(/\D/g, "");
  const toReceipt = form.get("dest") === "receipt";
  const n = parseOrderCode(rawCode);

  const back = (flag: string) =>
    `/track?${new URLSearchParams({ code: n ? orderCode(n) : rawCode, [flag]: "1", ...(toReceipt ? { dest: "receipt" } : {}) })}`;
  const open = (code: string, t?: string) =>
    toReceipt ? `/receipt/${code}${t ? `?t=${t}` : ""}` : `/track?code=${code}${t ? `&t=${t}` : ""}`;

  if (!n) redirect(back("bad"));

  let found: { customerId: string; deliveryPhone: string } | null;
  try {
    found = await prisma.order.findUnique({ where: { orderNumber: n }, select: { customerId: true, deliveryPhone: true } });
  } catch {
    redirect(back("offline"));
  }

  const user = await getUser();
  const code = orderCode(n);
  if (found && user && (user.id === found.customerId || isStaff(user.role))) redirect(open(code));
  if (!found || !sameLast4(found.deliveryPhone, last4)) redirect(back("miss"));
  redirect(open(code, trackToken(n)));
}

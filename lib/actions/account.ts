"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/lib/session";
import type { DeliveryContact } from "@/lib/meta";
import { ContactSchema } from "@/lib/orders-core";
import { dbError, fail, invalidate, ok, type ActionResult } from "./util";

/** Save the signed-in customer's delivery details. Past orders keep their own copy. */
export async function saveDeliveryDetails(input: DeliveryContact): Promise<ActionResult<DeliveryContact>> {
  const user = await getUser();
  if (!user) return fail("Please sign in to save your details.");

  const parsed = ContactSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check your details.");

  try {
    await prisma.user.update({ where: { id: user.id }, data: parsed.data });
    invalidate("orders");
    return ok(parsed.data);
  } catch (err) {
    return dbError(err);
  }
}

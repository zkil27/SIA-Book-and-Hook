import "server-only";
import prisma from "@/lib/prisma";
import type { DeliveryContact } from "@/lib/meta";

/**
 * The delivery details saved on an account, or null when there are none yet.
 * Read from the database on purpose: they stay out of the JWT, which would go
 * stale after an edit and has no reason to carry an address.
 */
export async function getDeliveryProfile(userId: string): Promise<DeliveryContact | null | "offline"> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true, address: true, barangay: true },
    });
    if (!user?.phone || !user.address || !user.barangay) return null;
    return { phone: user.phone, address: user.address, barangay: user.barangay };
  } catch {
    return "offline";
  }
}

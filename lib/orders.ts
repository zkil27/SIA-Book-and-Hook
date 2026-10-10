import "server-only";
import prisma from "@/lib/prisma";
import { orderCode, type OrderStatusKey } from "@/lib/meta";

export type TrackedOrder = {
  code: string;
  status: OrderStatusKey;
  createdAt: Date;
  slot: string;
  payment: "GCASH" | "COD";
  total: number;
  fee: number;
  items: { name: string; variant: string; qty: number; price: number; image: string | null }[];
  events: { to: OrderStatusKey; at: Date; note: string | null }[];
};

const include = {
  items: { include: { variant: { include: { product: { select: { name: true, imageUrl: true } } } } } },
  statusEvents: { orderBy: { createdAt: "asc" as const } },
};

type Row = NonNullable<Awaited<ReturnType<typeof findRow>>>;
function findRow(orderNumber: number) {
  return prisma.order.findUnique({ where: { orderNumber }, include });
}

function shape(o: Row): TrackedOrder {
  return {
    code: orderCode(o.orderNumber),
    status: o.status,
    createdAt: o.createdAt,
    slot: o.deliverySlot,
    payment: o.paymentMethod,
    total: o.totalCentavos,
    fee: o.deliveryFeeCentavos,
    items: o.items.map(i => ({
      name: i.variant.product.name,
      variant: i.variant.name,
      qty: i.quantity,
      price: i.priceAtTime,
      image: i.variant.product.imageUrl,
    })),
    events: o.statusEvents.map(e => ({ to: e.toStatus, at: e.createdAt, note: e.note })),
  };
}

/** Public lookup by code. Shows status and items only, never delivery details. */
export async function findOrderByNumber(orderNumber: number): Promise<TrackedOrder | null | "offline"> {
  try {
    const o = await findRow(orderNumber);
    return o ? shape(o) : null;
  } catch {
    return "offline";
  }
}

export async function listMyOrders(customerId: string): Promise<TrackedOrder[] | "offline"> {
  try {
    const rows = await prisma.order.findMany({ where: { customerId }, include, orderBy: { createdAt: "desc" }, take: 50 });
    return rows.map(shape);
  } catch {
    return "offline";
  }
}

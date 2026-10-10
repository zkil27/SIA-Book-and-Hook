import { Suspense } from "react";
import { listOrders, orderCounts } from "@/lib/admin-data";
import { STATUS_META, type OrderStatusKey } from "@/lib/meta";
import { PageHeader } from "@/components/admin/kit";
import { OrdersBoard } from "@/components/admin/OrdersBoard";

export const metadata = { title: "Orders" };

export default async function OrdersPage(props: PageProps<"/admin/orders">) {
  const sp = await props.searchParams;
  const raw = typeof sp.status === "string" ? sp.status : "";
  const openCode = typeof sp.open === "string" ? sp.open.toUpperCase() : null;
  const counts = await orderCounts();
  const status: OrderStatusKey | "ALL" =
    raw === "ALL" || raw in STATUS_META ? (raw as OrderStatusKey | "ALL") : counts.PENDING > 0 ? "PENDING" : "ALL";

  // An order opened by code (from search or the inbox) must be in the list even
  // when it isn't in the current tab.
  let orders = await listOrders(status);
  if (openCode && !orders.some(o => o.code === openCode)) {
    const all = await listOrders("ALL");
    const hit = all.find(o => o.code === openCode);
    if (hit) orders = [hit, ...orders];
  }

  return (
    <>
      <PageHeader title="Orders" sub="Confirm, pack and send out. Every status change is logged on the order's timeline." />
      <Suspense>
        <OrdersBoard orders={orders} counts={counts} status={status} openCode={openCode} />
      </Suspense>
    </>
  );
}

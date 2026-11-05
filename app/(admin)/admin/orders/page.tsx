import { Suspense } from "react";
import { getAdminOrder, listOrders, orderCounts } from "@/lib/admin-data";
import { parseOrderCode, STATUS_META, type OrderStatusKey } from "@/lib/meta";
import { PageHeader } from "@/components/admin/kit";
import { OrdersBoard } from "@/components/admin/OrdersBoard";

export const metadata = { title: "Orders" };

export default async function OrdersPage(props: PageProps<"/admin/orders">) {
  const sp = await props.searchParams;
  const raw = typeof sp.status === "string" ? sp.status : "";
  const openCode = typeof sp.open === "string" ? sp.open.toUpperCase() : null;
  const openNumber = openCode ? parseOrderCode(openCode) : null;
  const explicit = raw === "ALL" || raw in STATUS_META ? (raw as OrderStatusKey | "ALL") : null;

  // Without an explicit tab, default to Pending when any are waiting. Fetch the
  // Pending list in parallel with the counts and only fall back to All after.
  const [counts, firstList, opened] = await Promise.all([
    orderCounts(),
    listOrders(explicit ?? "PENDING"),
    openNumber ? getAdminOrder(openNumber) : Promise.resolve(null),
  ]);
  const status: OrderStatusKey | "ALL" = explicit ?? (counts.PENDING > 0 ? "PENDING" : "ALL");
  let orders = status === (explicit ?? "PENDING") ? firstList : await listOrders(status);

  // An order opened by code (from search or the inbox) must be in the list even
  // when it isn't in the current tab.
  if (opened && !orders.some(o => o.id === opened.id)) orders = [opened, ...orders];

  return (
    <>
      <PageHeader title="Orders" sub="Confirm, pack and send out. Every status change is logged on the order's timeline." />
      <Suspense>
        <OrdersBoard orders={orders} counts={counts} status={status} openCode={opened?.code ?? openCode} />
      </Suspense>
    </>
  );
}

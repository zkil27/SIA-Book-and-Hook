import { Suspense } from "react";
import { getAdminOrder, listOrders, orderCounts } from "@/lib/admin-data";
import { orderCode, parseOrderCode, STATUS_META, type OrderStatusKey } from "@/lib/meta";
import { PageHeader } from "@/components/admin/kit";
import { OrdersBoard } from "@/components/admin/OrdersBoard";

export const metadata = { title: "Orders" };

export default async function OrdersPage(props: PageProps<"/admin/orders">) {
  const sp = await props.searchParams;
  const raw = typeof sp.status === "string" ? sp.status : "";
  const openNumber = typeof sp.open === "string" ? parseOrderCode(sp.open) : null;
  const openCode = openNumber ? orderCode(openNumber) : null; // "hb5" → "HB-0005"
  const explicit = raw === "ALL" || raw in STATUS_META ? (raw as OrderStatusKey | "ALL") : null;

  // Without an explicit tab, show To confirm when anything is waiting, else
  // All. Both candidate lists load in parallel with the counts (each list is
  // one joined query), instead of a second list after the counts.
  const [counts, first, fallback] = await Promise.all([
    orderCounts(),
    listOrders(explicit ?? "PENDING"),
    explicit ? Promise.resolve(null) : listOrders("ALL"),
  ]);
  const status: OrderStatusKey | "ALL" = explicit ?? (counts.PENDING > 0 ? "PENDING" : "ALL");
  let orders = status === "ALL" && fallback ? fallback : first;

  // An order opened by code (search, palette, inbox) must be in the list even
  // when it isn't in this tab: fetch it only when it's missing.
  if (openNumber && !orders.some(o => o.code === openCode)) {
    const opened = await getAdminOrder(openNumber);
    if (opened) orders = [opened, ...orders];
  }

  return (
    <>
      <PageHeader
        title="Orders"
        sub="COD orders confirm automatically to packing; GCash orders wait here on hold until verified. Confirming prints the bag label, packing assigns a trip, and drivers deliver with the PIN."
      />
      <Suspense>
        <OrdersBoard orders={orders} counts={counts} status={status} openCode={openCode} />
      </Suspense>
    </>
  );
}

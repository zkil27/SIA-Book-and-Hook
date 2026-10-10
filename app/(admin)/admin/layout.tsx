import type { Metadata } from "next";
import type { ReactNode } from "react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { getAdminCounts, loadInventory, sellable } from "@/lib/admin-data";
import { orderCode, STATUS_META } from "@/lib/meta";
import { AdminShell, type Counts, type PaletteItem } from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/ui/toast";
import { DbOffline } from "@/components/admin/kit";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Hook & Box admin" } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Second line of defence after proxy.ts: customers never render admin UI.
  const admin = await requireAdmin();

  let counts: Counts = { pending: 0, out: 0, low: 0, toSale: 0 };
  let palette: PaletteItem[] = [];
  let offline = false;
  try {
    const [c, inv, openOrders] = await Promise.all([
      getAdminCounts(),
      loadInventory(),
      prisma.order.findMany({
        where: { status: { in: ["PENDING", "CONFIRMED", "READY"] } },
        orderBy: { createdAt: "asc" },
        select: { orderNumber: true, status: true, deliveryName: true },
        take: 60,
      }),
    ]);
    counts = c;
    const vs = sellable(inv);
    palette = [
      ...openOrders.map(o => ({
        label: `${orderCode(o.orderNumber)} · ${o.deliveryName || "Customer"}`,
        hint: STATUS_META[o.status].label,
        href: `/admin/orders?open=${orderCode(o.orderNumber)}`,
        group: "Orders to handle",
        keywords: `${orderCode(o.orderNumber)} ${o.orderNumber}`,
      })),
      ...vs.map(v => ({
        label: `Adjust stock · ${v.product.name} ${v.name}`,
        hint: `${v.stock} on hand`,
        href: `/admin/stock?v=${v.id}`,
        group: "Stock",
        keywords: v.sku,
      })),
      ...vs.map(v => ({
        label: `Walk-in sale · ${v.product.name} ${v.name}`,
        href: `/admin/stock?mode=walkin&v=${v.id}`,
        group: "Walk-in sale",
        keywords: `${v.sku} sell counter`,
      })),
      ...vs.map(v => ({
        label: `Ledger · ${v.product.name} ${v.name}`,
        href: `/admin/ledger?v=${v.id}`,
        group: "Stock ledger",
        keywords: `${v.sku} history movements`,
      })),
      ...inv.map(p => ({
        label: `Edit · ${p.name}${p.active ? "" : " (archived)"}`,
        href: `/admin/products/${p.id}`,
        group: "Products",
        keywords: p.category.name,
      })),
    ];
  } catch {
    offline = true;
  }

  return (
    <ToastProvider>
      <AdminShell counts={counts} palette={palette} userName={admin.name ?? admin.email}>
        {offline ? <DbOffline /> : children}
      </AdminShell>
    </ToastProvider>
  );
}

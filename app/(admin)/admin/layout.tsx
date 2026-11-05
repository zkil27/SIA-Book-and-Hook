import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { isDevEmail } from "@/lib/dev/access";
import { getAdminCounts, loadInventory, sellable } from "@/lib/admin-data";
import { orderCode, STATUS_META } from "@/lib/meta";
import { AdminShell, type ShellData } from "@/components/admin/AdminShell";
import { AdminShellSkeleton } from "@/components/admin/skeletons";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Hook & Box admin" } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <Suspense fallback={<AdminShellSkeleton />}>
        <AdminGate>{children}</AdminGate>
      </Suspense>
    </ToastProvider>
  );
}

/**
 * Second line of defence after proxy.ts: customers never render admin UI.
 * Only the session check is awaited; badge counts and palette data stream in
 * as a promise so the page doesn't wait on them.
 */
async function AdminGate({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const data = loadShellData();
  return (
    <AdminShell data={data} userName={admin.name ?? admin.email} isDev={isDevEmail(admin.email)}>
      {children}
    </AdminShell>
  );
}

const EMPTY: ShellData = { counts: { pending: 0, out: 0, low: 0, toSale: 0 }, orders: [], variants: [], products: [] };

async function loadShellData(): Promise<ShellData> {
  try {
    const [counts, inv, openOrders] = await Promise.all([
      getAdminCounts(),
      loadInventory(),
      prisma.order.findMany({
        where: { status: { in: ["PENDING", "CONFIRMED", "READY"] } },
        orderBy: { createdAt: "asc" },
        select: { orderNumber: true, status: true, deliveryName: true },
        take: 60,
      }),
    ]);
    return {
      counts,
      orders: openOrders.map(o => ({
        code: orderCode(o.orderNumber),
        number: o.orderNumber,
        name: o.deliveryName || "Customer",
        status: STATUS_META[o.status].label,
      })),
      variants: sellable(inv).map(v => ({ id: v.id, label: `${v.product.name} ${v.name}`, sku: v.sku, stock: v.stock })),
      products: inv.map(p => ({ id: p.id, name: p.name, active: p.active, category: p.category.name })),
    };
  } catch {
    // The page itself reports the outage (admin error boundary); the shell
    // just shows no badges.
    return EMPTY;
  }
}

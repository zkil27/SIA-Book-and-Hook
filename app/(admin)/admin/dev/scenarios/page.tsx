import { MAX_RUSH_ORDERS, MAX_TEST_ORDERS, openTestOrders, safeVariants } from "@/lib/dev/scenarios";
import { PageHeader } from "@/components/admin/kit";
import { ScenariosPanel } from "@/components/dev/ScenariosPanel";

export const metadata = { title: "Test scenarios" };

export default async function DevScenariosPage() {
  const [pool, open] = await Promise.all([safeVariants(), openTestOrders()]);
  return (
    <>
      <PageHeader
        title="Test scenarios"
        sub="Rehearse orders and a morning rush on the live build. Add-only: clean-up cancels with compensating ledger entries."
      />
      <ScenariosPanel
        spareItems={pool.length}
        maxSpare={pool[0] ? { label: pool[0].label, spare: pool[0].spare } : null}
        openCount={open.orders.length}
        heldUnits={open.held}
        maxOrders={MAX_TEST_ORDERS}
        maxRush={MAX_RUSH_ORDERS}
      />
    </>
  );
}

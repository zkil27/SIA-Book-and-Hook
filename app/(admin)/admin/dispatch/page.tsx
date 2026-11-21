import { dispatchBoard } from "@/lib/trips-data";
import { PageHeader } from "@/components/admin/kit";
import { DispatchBoard } from "@/components/admin/DispatchBoard";
import { ButtonLink } from "@/components/ui/primitives";

export const metadata = { title: "Dispatch" };

export default async function DispatchPage() {
  const { days, drivers } = await dispatchBoard();
  return (
    <>
      <PageHeader
        title="Dispatch"
        sub="Packed orders are automatically grouped into a morning trip per slot in route order. Adjust drivers, vehicles or stops here when needed."
        actions={
          <>
            <ButtonLink href="/staff/load" variant="outline">
              Loading screen
            </ButtonLink>
            <ButtonLink href="/staff/trip" variant="outline">
              Driver view
            </ButtonLink>
          </>
        }
      />
      <DispatchBoard days={days} drivers={drivers} />
    </>
  );
}

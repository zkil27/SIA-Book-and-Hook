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
        sub="Plan each morning slot's truck run, then count the cash when it comes back. Drivers finish every stop with the customer's PIN."
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

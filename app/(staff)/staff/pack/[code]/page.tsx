import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { parseOrderCode, STATUS_META } from "@/lib/meta";
import { packOrder } from "@/lib/trips-data";
import { PickList } from "@/components/staff/PickList";
import { StaffEmpty } from "@/components/staff/StaffShell";
import { ButtonLink } from "@/components/ui/primitives";

export const metadata = { title: "Pack an order" };

export default async function PickPage(props: PageProps<"/staff/pack/[code]">) {
  await requireRole(["ADMIN", "PACKER"], "/staff/pack");
  const { code } = await props.params;
  const n = parseOrderCode(code);
  if (!n) notFound();
  const order = await packOrder(n);
  if (!order) notFound();

  if (order.status !== "CONFIRMED" && order.status !== "PACKED") {
    return (
      <StaffEmpty title={<p className="sign text-[30px] text-ink">{order.code} isn&apos;t for packing</p>}>
        <p>Its step now: {STATUS_META[order.status].label}. Nothing to pack here.</p>
        <ButtonLink href="/staff/pack" size="lg" className="mt-5">
          Back to the queue
        </ButtonLink>
      </StaffEmpty>
    );
  }
  return <PickList order={order} />;
}

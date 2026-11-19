import { firstName, shortSlot, splitName } from "@/lib/meta";
import { peso } from "@/lib/money";
import { fmtDateTime, fmtDay } from "@/lib/time";

/**
 * Everything a bag label shows. Deliberately no phone, street address, stop
 * number or handoff PIN: the label rides on the outside of the bag, stop
 * numbers change when trips are re-planned, and the PIN belongs to the
 * customer alone. The driver's phone has the full address.
 */
export type LabelData = {
  code: string;
  firstName: string;
  barangay: string;
  day: string | null; // delivery day key
  slot: string;
  payment: "GCASH" | "COD";
  total: number; // centavos
  lines: { name: string; variant: string; qty: number }[];
  placedAt: string;
};

/** From an admin Orders row. */
export function labelFromAdmin(o: {
  code: string;
  createdAt: string;
  delivery: { name: string; barangay: string; slot: string; day: string | null };
  payment: "GCASH" | "COD";
  total: number;
  items: { name: string; variant: string; qty: number }[];
}): LabelData {
  return {
    code: o.code,
    firstName: firstName(o.delivery.name),
    barangay: o.delivery.barangay,
    day: o.delivery.day,
    slot: o.delivery.slot,
    payment: o.payment,
    total: o.total,
    lines: o.items.map(i => ({ name: splitName(i.name).local, variant: i.variant, qty: i.qty })),
    placedAt: o.createdAt,
  };
}

/** From a packer's pick list order (lines already use the local name). */
export function labelFromPack(o: {
  code: string;
  firstName: string;
  barangay: string;
  day: string | null;
  slot: string;
  payment: "GCASH" | "COD";
  total: number;
  lines: { name: string; variant: string; qty: number }[];
  placedAt: string;
}): LabelData {
  return { ...o, lines: o.lines.map(l => ({ ...l })) };
}

const MAX_LINES = 9;

/**
 * One 100×150 mm thermal label, black on white. Sizes are in print units so
 * it measures the same on every printer; the order code is the bag's ID and
 * reads from arm's length.
 */
export function BagLabel({ label }: { label: LabelData }) {
  const units = label.lines.reduce((s, l) => s + l.qty, 0);
  const shown = label.lines.slice(0, MAX_LINES);
  const more = label.lines.length - shown.length;
  return (
    <div className="bag-label flex flex-col bg-white p-[5mm] font-sans text-black">
      <div className="flex items-baseline justify-between border-b-[0.6mm] border-black pb-[1.5mm] text-[9pt] font-bold uppercase tracking-wide">
        <span>Hook &amp; Box</span>
        <span>Fresh seafood · Dasmariñas</span>
      </div>

      <p className="mt-[2.5mm] text-[38pt] font-black leading-none tracking-tight">{label.code}</p>

      <p className="mt-[2mm] text-[24pt] font-extrabold leading-tight">{label.firstName}</p>
      <p className="text-[15pt] font-semibold leading-tight">{label.barangay}</p>

      <div className="mt-[3mm] flex items-center justify-between rounded-[1.5mm] border-[0.6mm] border-black px-[3mm] py-[1.8mm] text-[14pt] font-extrabold leading-none">
        <span>{label.day ? fmtDay(label.day) : "No date"}</span>
        <span>{shortSlot(label.slot)}</span>
      </div>

      {label.payment === "COD" ? (
        <p className="mt-[2.5mm] rounded-[1.5mm] bg-black px-[3mm] py-[2.2mm] text-center text-[17pt] font-black uppercase leading-none text-white">
          Collect {peso(label.total)} cash
        </p>
      ) : (
        <p className="mt-[2.5mm] rounded-[1.5mm] border-[0.6mm] border-dashed border-black px-[3mm] py-[2mm] text-center text-[15pt] font-extrabold uppercase leading-none">
          Paid · GCash
        </p>
      )}

      <ul className="mt-[3mm] flex flex-col gap-[1.2mm] text-[11pt] leading-tight">
        {shown.map((l, i) => (
          <li key={i} className="flex items-center gap-[2mm]">
            <span className="size-[3.6mm] shrink-0 rounded-[0.6mm] border-[0.45mm] border-black" aria-hidden />
            <span className="tabular w-[9mm] shrink-0 font-black">{l.qty} ×</span>
            <span className="min-w-0 truncate">
              <span className="font-bold">{l.name}</span> · {l.variant}
            </span>
          </li>
        ))}
        {more > 0 && <li className="pl-[5.6mm] text-[10pt] font-semibold">+ {more} more on the pick list</li>}
      </ul>

      <div className="mt-auto flex items-baseline justify-between border-t-[0.4mm] border-black pt-[1.5mm] text-[9pt]">
        <span className="font-bold">
          {units} item{units === 1 ? "" : "s"}
        </span>
        <span>Placed {fmtDateTime(label.placedAt)}</span>
      </div>
    </div>
  );
}

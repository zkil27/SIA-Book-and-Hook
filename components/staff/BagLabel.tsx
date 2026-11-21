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

/**
 * Compact 100×150 mm (4×6 in) thermal label, black on white. Uses adaptive
 * typography and a 2-column switch above 26 lines so every line item fits on
 * the label without truncating to "+ N more".
 */
export function BagLabel({ label }: { label: LabelData }) {
  const units = label.lines.reduce((s, l) => s + l.qty, 0);
  const n = label.lines.length;
  const twoCol = n >= 27;
  const listClass = twoCol
    ? "mt-[2mm] grid grid-cols-2 gap-x-[2.5mm] gap-y-[0.5mm] text-[7pt] leading-[1.12]"
    : n >= 16
      ? "mt-[2mm] flex flex-col gap-[0.55mm] text-[8pt] leading-[1.15]"
      : "mt-[2mm] flex flex-col gap-[0.85mm] text-[9.5pt] leading-[1.2]";
  const boxClass = twoCol
    ? "size-[2mm] shrink-0 rounded-[0.4mm] border-[0.35mm] border-black"
    : n >= 16
      ? "size-[2.4mm] shrink-0 rounded-[0.45mm] border-[0.4mm] border-black"
      : "size-[3mm] shrink-0 rounded-[0.5mm] border-[0.45mm] border-black";
  const qtyWidth = twoCol ? "w-[6mm]" : n >= 16 ? "w-[7mm]" : "w-[8mm]";

  return (
    <div className="bag-label flex flex-col bg-white p-[3.5mm] font-sans text-black">
      <div className="flex items-baseline justify-between border-b-[0.5mm] border-black pb-[1mm] text-[7.5pt] font-bold uppercase tracking-wide">
        <span>Hook &amp; Box</span>
        <span>Fresh seafood · Dasmariñas</span>
      </div>

      <div className="mt-[1.5mm] flex items-center justify-between gap-[2mm]">
        <p className="text-[26pt] font-black leading-none tracking-tight">{label.code}</p>
        <div className="shrink-0 rounded-[1.2mm] border-[0.5mm] border-black px-[2mm] py-[1mm] text-right leading-tight">
          <p className="text-[9pt] font-extrabold">{label.day ? fmtDay(label.day) : "No date"}</p>
          <p className="text-[9pt] font-bold">{shortSlot(label.slot)}</p>
        </div>
      </div>

      <div className="mt-[1.5mm] flex items-baseline justify-between gap-[2mm]">
        <p className="min-w-0 truncate text-[14pt] font-extrabold leading-tight">{label.firstName}</p>
        <p className="shrink-0 text-[11pt] font-semibold leading-tight">{label.barangay}</p>
      </div>

      {label.payment === "COD" ? (
        <p className="mt-[1.5mm] rounded-[1.2mm] bg-black px-[2.5mm] py-[1.4mm] text-center text-[12.5pt] font-black uppercase leading-none text-white">
          Collect {peso(label.total)} cash
        </p>
      ) : (
        <p className="mt-[1.5mm] rounded-[1.2mm] border-[0.5mm] border-dashed border-black px-[2.5mm] py-[1.2mm] text-center text-[11.5pt] font-extrabold uppercase leading-none">
          Paid · GCash
        </p>
      )}

      <ul className={listClass}>
        {label.lines.map((l, i) => (
          <li key={i} className="flex min-w-0 items-center gap-[1.3mm]">
            <span className={boxClass} aria-hidden />
            <span className={`tabular ${qtyWidth} shrink-0 font-black`}>{l.qty} ×</span>
            <span className="min-w-0 truncate">
              <span className="font-bold">{l.name}</span> · {l.variant}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-baseline justify-between border-t-[0.4mm] border-black pt-[1mm] text-[7.5pt]">
        <span className="font-bold">
          {units} item{units === 1 ? "" : "s"} ({n} {n === 1 ? "line" : "lines"})
        </span>
        <span>Placed {fmtDateTime(label.placedAt)}</span>
      </div>
    </div>
  );
}

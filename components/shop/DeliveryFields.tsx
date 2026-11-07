"use client";

import { BARANGAYS, PHONE_RE, type DeliveryContact } from "@/lib/meta";
import { Field, Input } from "@/components/ui/primitives";

export type ContactErrors = Partial<Record<keyof DeliveryContact, string>>;

export function validateContact(c: DeliveryContact): ContactErrors {
  const e: ContactErrors = {};
  if (!PHONE_RE.test(c.phone.trim())) e.phone = "Enter a mobile number like 0917 123 4567.";
  if (c.address.trim().length < 5) e.address = "Enter a street address or house number.";
  if (c.barangay.trim().length < 2) e.barangay = "Enter your barangay.";
  return e;
}

/**
 * Phone, address and barangay inputs for a two-column grid. Checkout follows
 * the name field, so phone goes first there; on its own, `addressFirst` leaves
 * phone and barangay sharing a row with no gap.
 */
export function DeliveryFields({
  idPrefix,
  value,
  errors,
  onChange,
  addressFirst = false,
}: {
  idPrefix: string;
  value: DeliveryContact;
  errors: ContactErrors;
  onChange: (patch: Partial<DeliveryContact>) => void;
  addressFirst?: boolean;
}) {
  const phone = (
    <Field label="Mobile number" htmlFor={`${idPrefix}-phone`} error={errors.phone} hint="The rider calls this number on arrival.">
      <Input id={`${idPrefix}-phone`} inputMode="tel" autoComplete="tel" placeholder="0917 123 4567" value={value.phone} aria-invalid={!!errors.phone} onChange={e => onChange({ phone: e.target.value })} />
    </Field>
  );
  const address = (
    <Field label="House no. and street" htmlFor={`${idPrefix}-address`} error={errors.address} className="sm:col-span-2">
      <Input id={`${idPrefix}-address`} autoFocus={addressFirst} autoComplete="street-address" placeholder="Blk 5 Lot 12, Mabini St." value={value.address} aria-invalid={!!errors.address} onChange={e => onChange({ address: e.target.value })} />
    </Field>
  );
  const barangay = (
    <Field label="Barangay" htmlFor={`${idPrefix}-brgy`} error={errors.barangay} hint="Dasmariñas City, Cavite">
      <Input id={`${idPrefix}-brgy`} list={`${idPrefix}-brgys`} placeholder="Salawag" value={value.barangay} aria-invalid={!!errors.barangay} onChange={e => onChange({ barangay: e.target.value })} />
      <datalist id={`${idPrefix}-brgys`}>
        {BARANGAYS.map(b => <option key={b} value={b} />)}
      </datalist>
    </Field>
  );

  return addressFirst ? <>{address}{phone}{barangay}</> : <>{phone}{address}{barangay}</>;
}

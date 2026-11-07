"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { MapPin, Phone } from "lucide-react";
import { saveDeliveryDetails } from "@/lib/actions/account";
import type { DeliveryContact } from "@/lib/meta";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { DeliveryFields, validateContact, type ContactErrors } from "./DeliveryFields";

const BLANK: DeliveryContact = { phone: "", address: "", barangay: "" };

export function DeliveryDetailsCard({ saved, offline }: { saved: DeliveryContact | null; offline: boolean }) {
  const toast = useToast();
  const [current, setCurrent] = useState(saved);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DeliveryContact>(BLANK);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [pending, start] = useTransition();
  const opener = useRef<HTMLButtonElement>(null);

  function open() {
    setDraft(current ?? BLANK);
    setErrors({});
    setEditing(true);
  }

  // The opener only exists again once the form is gone, so commit before focusing.
  function close() {
    flushSync(() => setEditing(false));
    opener.current?.focus();
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const found = validateContact(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    start(async () => {
      const res = await saveDeliveryDetails(draft);
      if (!res.ok) {
        toast({ title: "We couldn't save your details", description: res.error, tone: "error", duration: 7000 });
        return;
      }
      setCurrent(res.data);
      close();
      toast({ title: "Delivery details saved" });
    });
  }

  return (
    <section aria-labelledby="delivery-details" className="rounded-card bg-paper p-5 ring-1 ring-inset ring-ice-3 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <h2 id="delivery-details" className="text-xl font-bold text-ink">
          Delivery details
        </h2>
        {!offline && !editing && (
          <Button ref={opener} variant="outline" size="sm" onClick={open}>
            {current ? "Edit" : "Add details"}
          </Button>
        )}
      </div>

      {offline ? (
        <p className="mt-3 text-ink-2">We can&apos;t load your saved details right now. Try again in a minute.</p>
      ) : editing ? (
        <form onSubmit={submit} noValidate className="mt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <DeliveryFields idPrefix="acct" addressFirst value={draft} errors={errors} onChange={patch => setDraft({ ...draft, ...patch })} />
          </div>
          <div className="mt-6 flex items-center gap-2">
            <Button type="submit" loading={pending}>
              Save details
            </Button>
            <Button type="button" variant="ghost" onClick={close} disabled={pending}>
              Cancel
            </Button>
          </div>
        </form>
      ) : current ? (
        <div className="mt-4 flex flex-col gap-2 text-ink">
          <p className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 size-4.5 shrink-0 text-ink-3" aria-hidden />
            <span className="min-w-0 break-words">
              {current.address}, {current.barangay}, Dasmariñas
            </span>
          </p>
          <p className="tabular flex items-center gap-2.5">
            <Phone className="size-4.5 shrink-0 text-ink-3" aria-hidden />
            {current.phone}
          </p>
        </div>
      ) : (
        <p className="mt-3 max-w-prose text-ink-2">
          Nothing saved yet. Your number and address can be saved at your first checkout, or add them now so it&apos;s quicker.
        </p>
      )}
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Banknote, Check, Smartphone, Upload } from "lucide-react";
import { useBasket, type BasketItem } from "./basket";
import { BasinIcon, FreeDeliveryMeter, QtyStepper } from "./BasketUI";
import { DeliveryFields, validateContact } from "./DeliveryFields";
import { ReceiptSlip } from "./ReceiptSlip";
import { placeOrder } from "@/lib/actions/checkout";
import { DELIVERY_SLOTS, type DeliveryContact } from "@/lib/meta";
import { deliveryFeeFor, peso } from "@/lib/money";
import { Button, ButtonLink, Field, Input, buttonClass } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";

const STEPS = ["Review", "Delivery", "Payment", "Receipt"] as const;

type Delivery = DeliveryContact & { name: string; slot: (typeof DELIVERY_SLOTS)[number] };
type Receipt = { code: string; total: number; items: BasketItem[]; payment: "GCASH" | "COD"; slot: string; fee: number };

function validate(d: Delivery): Partial<Record<keyof Delivery, string>> {
  const e: Partial<Record<keyof Delivery, string>> = validateContact(d);
  if (d.name.trim().length < 2) e.name = "Enter the name of the person receiving the order.";
  return e;
}

export function CheckoutFlow({ defaultName, saved, offline }: { defaultName: string; saved: DeliveryContact | null; offline: boolean }) {
  const basket = useBasket();
  const toast = useToast();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [delivery, setDelivery] = useState<Delivery>({
    name: defaultName,
    phone: saved?.phone ?? "",
    address: saved?.address ?? "",
    barangay: saved?.barangay ?? "",
    slot: DELIVERY_SLOTS[0],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Delivery, string>>>({});
  // Ticked for a first save; off once details exist, so a one-off order can't replace them.
  const [saveDetails, setSaveDetails] = useState(!saved);
  const [payment, setPayment] = useState<"GCASH" | "COD" | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [pending, start] = useTransition();

  const fee = deliveryFeeFor(basket.subtotal);
  const differsFromSaved =
    !saved ||
    delivery.phone.trim() !== saved.phone ||
    delivery.address.trim() !== saved.address ||
    delivery.barangay.trim() !== saved.barangay;
  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  if (!basket.ready) {
    return <div className="skeleton h-96 rounded-[var(--radius-card)]" />;
  }

  if (basket.items.length === 0 && !receipt) {
    return (
      <div className="flex flex-col items-center rounded-[var(--radius-card)] bg-paper px-6 py-16 text-center ring-1 ring-inset ring-ice-3">
        <BasinIcon className="h-16 w-20" />
        <p className="sign mt-5 text-[34px] text-ink">Your basket is empty</p>
        <p className="mt-2 text-sm text-ink-3">Add something from today&apos;s catch first.</p>
        <ButtonLink href="/#catch" variant="tarp" className="mt-6">
          See today&apos;s catch
        </ButtonLink>
      </div>
    );
  }

  function submit() {
    if (!payment) {
      toast({ title: "Choose how you'll pay", tone: "error" });
      return;
    }
    start(async () => {
      const items = basket.items.map(i => ({ variantId: i.variantId, qty: i.qty }));
      const res = await placeOrder({ items, delivery, payment, saveDetails: differsFromSaved && saveDetails });
      if (!res.ok) {
        toast({ title: "We couldn't place your order", description: res.error, tone: "error", duration: 7000 });
        return;
      }
      setReceipt({ code: res.data.code, total: res.data.total, items: basket.items, payment, slot: delivery.slot, fee });
      basket.clear();
      go(3);
    });
  }

  const slide = {
    initial: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: d * 40 }),
    animate: { opacity: 1, x: 0 },
    exit: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: d * -40 }),
  };

  return (
    <div>
      {/* Step rail */}
      <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Checkout steps">
        {STEPS.map((label, i) => {
          const done = i < step;
          const on = i === step;
          return (
            <li key={label} className="flex flex-col gap-2" aria-current={on ? "step" : undefined}>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-ice-3">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-teal-deep"
                  initial={false}
                  animate={{ width: done || on ? "100%" : "0%" }}
                  transition={{ type: "spring", stiffness: 200, damping: 30 }}
                />
              </div>
              <span className={`flex items-center gap-1.5 text-[13px] font-semibold ${on ? "text-ink" : done ? "text-teal-deep" : "text-ink-3"}`}>
                {done && <Check className="size-3.5" aria-hidden />}
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className={`grid gap-8 ${step < 3 ? "lg:grid-cols-[1fr_340px]" : ""}`}>
        <div className="min-w-0">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.section
              key={step}
              custom={dir}
              variants={slide}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
            >
              {step === 0 && (
                <Panel title="Check your basket">
                  <ul className="flex flex-col divide-y divide-ice-3">
                    {basket.items.map(item => (
                      <li key={item.variantId} className="flex items-center gap-4 py-4 first:pt-0">
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-ice-2">
                          {item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-ink">{item.name}</p>
                          <p className="text-[13px] text-ink-3">
                            {item.variantName} · {peso(item.price)}
                          </p>
                        </div>
                        <QtyStepper value={item.qty} max={item.stock} onChange={q => basket.setQty(item.variantId, q)} label={item.name} />
                        <span className="tabular hidden w-20 text-right font-semibold text-ink sm:block">{peso(item.price * item.qty)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5">
                    <FreeDeliveryMeter subtotal={basket.subtotal} />
                  </div>
                  <StepNav next={() => go(1)} nextLabel="Delivery details" />
                </Panel>
              )}

              {step === 1 && (
                <Panel title="Where should we deliver?">
                  {saved && !differsFromSaved && <p className="-mt-3 mb-5 text-sm text-ink-3">Filled in from your account.</p>}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Receiver's name" htmlFor="d-name" error={errors.name}>
                      <Input id="d-name" autoComplete="name" value={delivery.name} aria-invalid={!!errors.name} onChange={e => setDelivery({ ...delivery, name: e.target.value })} />
                    </Field>
                    <DeliveryFields idPrefix="d" value={delivery} errors={errors} onChange={patch => setDelivery({ ...delivery, ...patch })} />
                  </div>
                  <fieldset className="mt-6">
                    <legend className="text-[13px] font-semibold text-ink-2">Morning delivery slot</legend>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      {DELIVERY_SLOTS.map(s => (
                        <label
                          key={s}
                          className={`flex cursor-pointer items-center justify-center rounded-xl px-3 py-3 text-sm font-semibold ring-inset transition-[box-shadow,background-color] ${
                            delivery.slot === s ? "bg-mint-soft text-teal-ink ring-2 ring-teal-deep" : "bg-ice text-ink-2 ring-1 ring-ice-3 hover:ring-ink-3"
                          }`}
                        >
                          <input type="radio" name="slot" value={s} className="sr-only" checked={delivery.slot === s} onChange={() => setDelivery({ ...delivery, slot: s })} />
                          {s}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {differsFromSaved && (
                    <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-ice p-3.5 ring-1 ring-inset ring-ice-3">
                      <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-teal-deep" checked={saveDetails} onChange={e => setSaveDetails(e.target.checked)} />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink">
                          {saved ? "Update my account with these details" : "Save these details to my account"}
                        </span>
                        <span className="block text-[13px] text-ink-3">
                          {saved ? "Leave this off if this order is going somewhere else." : "Your next checkout fills in by itself."}
                        </span>
                      </span>
                    </label>
                  )}
                  <StepNav
                    back={() => go(0)}
                    next={() => {
                      const e = validate(delivery);
                      setErrors(e);
                      if (Object.keys(e).length === 0) go(2);
                    }}
                    nextLabel="Payment"
                  />
                </Panel>
              )}

              {step === 2 && (
                <Panel title="How will you pay?">
                  <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
                    {(
                      [
                        { id: "GCASH", title: "GCash", desc: "Send to our GCash number, then show the reference to the rider.", icon: Smartphone },
                        { id: "COD", title: "Cash on delivery", desc: "Pay the rider in cash when your box arrives.", icon: Banknote },
                      ] as const
                    ).map(m => {
                      const on = payment === m.id;
                      return (
                        <button
                          key={m.id}
                          role="radio"
                          aria-checked={on}
                          onClick={() => setPayment(m.id)}
                          className={`relative flex items-start gap-3 rounded-xl p-4 text-left ring-inset transition-[box-shadow,background-color] ${
                            on ? "bg-mint-soft ring-2 ring-teal-deep" : "bg-ice ring-1 ring-ice-3 hover:ring-ink-3"
                          }`}
                        >
                          <span className={`grid size-11 shrink-0 place-items-center rounded-lg transition-colors ${on ? "bg-teal-deep text-white" : "bg-paper text-ink-2"}`}>
                            <m.icon className="size-5" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1 pr-7">
                            <span className="block font-bold text-ink">{m.title}</span>
                            <span className="mt-0.5 block text-[13px] text-ink-3">{m.desc}</span>
                          </span>
                          <span
                            className={`absolute right-3.5 top-3.5 grid size-6 place-items-center rounded-full transition-all duration-200 ${
                              on ? "bg-teal-deep text-white shadow-sm ring-0" : "border-2 border-ice-3 bg-paper/60 text-transparent"
                            }`}
                          >
                            <AnimatePresence>
                              {on && (
                                <motion.span
                                  key={`check-${m.id}`}
                                  initial={reduce ? undefined : { scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={reduce ? undefined : { scale: 0, opacity: 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                                  className="grid place-items-center"
                                >
                                  <Check className="size-3.5 stroke-[2.5]" aria-hidden />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence mode="wait">
                    {payment === "GCASH" && (
                      <motion.div key="gcash" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="mt-4 grid gap-4 rounded-xl bg-paper p-4 ring-1 ring-inset ring-ice-3 sm:grid-cols-[auto_1fr]">
                          <div className="grid size-32 place-items-center rounded-lg bg-ice-2 text-center text-[12px] font-semibold text-ink-3 ring-1 ring-inset ring-ice-3">
                            GCash QR
                            <br />
                            (demo placeholder)
                          </div>
                          <div className="text-sm">
                            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                              <dt className="text-ink-3">Account</dt>
                              <dd className="font-semibold text-ink">Hook &amp; Box Seafood</dd>
                              <dt className="text-ink-3">Number</dt>
                              <dd className="tabular font-semibold text-ink">0917 XXX XXXX</dd>
                              <dt className="text-ink-3">Amount</dt>
                              <dd className="tabular font-bold text-ink">{peso(basket.subtotal + fee)}</dd>
                            </dl>
                            <div className="mt-3 flex items-center gap-2 rounded-lg border-2 border-dashed border-ice-3 px-3 py-2.5 text-[13px] text-ink-3">
                              <Upload className="size-4 shrink-0" aria-hidden />
                              Proof-of-payment upload is a placeholder in this demo. Nothing is uploaded or charged.
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {payment === "COD" && (
                      <motion.p key="cod" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden rounded-xl bg-paper p-4 text-sm text-ink-2 ring-1 ring-inset ring-ice-3">
                        Please have <strong className="tabular text-ink">{peso(basket.subtotal + fee)}</strong> ready for the rider.
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <p className="mt-5 text-[13px] text-ink-3">
                    Your order is saved as <strong>Pending</strong>. We confirm it before packing; payment is settled outside this site.
                  </p>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <Button variant="ghost" onClick={() => go(1)}>
                      <ArrowLeft className="size-4" aria-hidden /> Back
                    </Button>
                    <Button size="lg" onClick={submit} loading={pending} disabled={offline || !payment}>
                      {offline ? "Ordering paused" : `Place order · ${peso(basket.subtotal + fee)}`}
                    </Button>
                  </div>
                </Panel>
              )}

              {step === 3 && receipt && <OrderPlaced receipt={receipt} />}
            </motion.section>
          </AnimatePresence>
        </div>

        {step < 3 && (
          <aside className="h-fit rounded-[var(--radius-card)] bg-paper p-5 ring-1 ring-inset ring-ice-3 lg:sticky lg:top-24">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-ink-3">Order summary</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {basket.items.map(i => (
                <li key={i.variantId} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate text-ink-2">
                    {i.name} <span className="text-ink-3">· {i.variantName} × {i.qty}</span>
                  </span>
                  <span className="tabular text-ink">{peso(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-1 border-t border-ice-3 pt-4 text-sm">
              <dt className="text-ink-3">Subtotal</dt>
              <dd className="tabular text-right">{peso(basket.subtotal)}</dd>
              <dt className="text-ink-3">Delivery</dt>
              <dd className="tabular text-right">{fee === 0 ? "Free" : peso(fee)}</dd>
              <dt className="pt-2 font-bold text-ink">Total</dt>
              <dd className="tabular pt-2 text-right text-xl font-bold text-ink">{peso(basket.subtotal + fee)}</dd>
            </dl>
            <p className="mt-3 text-[12px] text-ink-3">Final prices and stock are checked again when you place the order.</p>
          </aside>
        )}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-paper p-5 ring-1 ring-inset ring-ice-3 sm:p-7">
      <h2 className="mb-5 text-xl font-bold text-ink">{title}</h2>
      {children}
    </div>
  );
}

function StepNav({ back, next, nextLabel }: { back?: () => void; next: () => void; nextLabel: string }) {
  return (
    <div className="mt-7 flex items-center justify-between gap-3">
      {back ? (
        <Button variant="ghost" onClick={back}>
          <ArrowLeft className="size-4" aria-hidden /> Back
        </Button>
      ) : (
        <Link href="/#catch" className="text-sm font-semibold text-ink-2 hover:text-ink hover:underline">
          Keep shopping
        </Link>
      )}
      <Button size="lg" onClick={next}>
        {nextLabel} <ArrowRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}

/** The last step: the slip printing out, then where to go next. */
function OrderPlaced({ receipt }: { receipt: Receipt }) {
  return (
    <div className="flex flex-col items-center">
      <ReceiptSlip
        code={receipt.code}
        lines={receipt.items.map(i => ({ key: i.variantId, label: `${i.name} ${i.variantName}`, qty: i.qty, price: i.price }))}
        fee={receipt.fee}
        total={receipt.total}
        payment={receipt.payment}
        slot={receipt.slot}
        status="PENDING"
        animated
      />
      <p className="mt-6 max-w-sm text-center text-sm text-ink-2">
        We&apos;ll confirm your order before packing. Keep your code to check its status anytime.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <ButtonLink href={`/track?code=${receipt.code}`}>Track this order</ButtonLink>
        <ButtonLink href={`/receipt/${receipt.code}`} variant="outline">
          Print or save receipt
        </ButtonLink>
        <Link href="/#catch" className={buttonClass("outline")}>
          Keep shopping
        </Link>
      </div>
    </div>
  );
}

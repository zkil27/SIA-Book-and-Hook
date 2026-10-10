"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Banknote, Check, Smartphone, Upload } from "lucide-react";
import { useBasket, type BasketItem } from "./basket";
import { BasinIcon, FreeDeliveryMeter, QtyStepper } from "./BasketUI";
import { placeOrder } from "@/lib/actions/checkout";
import { DELIVERY_SLOTS } from "@/lib/meta";
import { deliveryFeeFor, peso } from "@/lib/money";
import { Button, ButtonLink, Field, Input, buttonClass } from "@/components/ui/primitives";
import { Stamp } from "@/components/ui/motion";
import { useToast } from "@/components/ui/toast";

const STEPS = ["Review", "Delivery", "Payment", "Receipt"] as const;
const BARANGAYS = [
  "Burol", "Datu Esmael", "Emmanuel Bergado", "Fatima", "Langkaan", "Luzviminda", "Paliparan",
  "Sabang", "Salawag", "Salitran", "Sampaloc", "San Agustin", "San Jose", "San Miguel",
  "Santa Cruz", "Santa Fe", "Victoria Reyes", "Zone I", "Zone II", "Zone III", "Zone IV",
];

type Delivery = { name: string; phone: string; address: string; barangay: string; slot: (typeof DELIVERY_SLOTS)[number] };
type Receipt = { code: string; total: number; items: BasketItem[]; payment: "GCASH" | "COD"; slot: string; fee: number };

function validate(d: Delivery): Partial<Record<keyof Delivery, string>> {
  const e: Partial<Record<keyof Delivery, string>> = {};
  if (d.name.trim().length < 2) e.name = "Enter the name of the person receiving the order.";
  if (!/^(\+?63|0)9\d{2}[\s-]?\d{3}[\s-]?\d{4}$/.test(d.phone.trim())) e.phone = "Enter a mobile number like 0917 123 4567.";
  if (d.address.trim().length < 5) e.address = "Enter a street address or house number.";
  if (d.barangay.trim().length < 2) e.barangay = "Enter your barangay.";
  return e;
}

export function CheckoutFlow({ defaultName, offline }: { defaultName: string; offline: boolean }) {
  const basket = useBasket();
  const toast = useToast();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [delivery, setDelivery] = useState<Delivery>({
    name: defaultName,
    phone: "",
    address: "",
    barangay: "",
    slot: DELIVERY_SLOTS[0],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Delivery, string>>>({});
  const [payment, setPayment] = useState<"GCASH" | "COD" | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [pending, start] = useTransition();

  const fee = deliveryFeeFor(basket.subtotal);
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
      const res = await placeOrder({ items, delivery, payment });
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
                        <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-ice-2">
                          {item.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt="" className="size-full object-cover" />
                          )}
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
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Receiver's name" htmlFor="d-name" error={errors.name}>
                      <Input id="d-name" autoComplete="name" value={delivery.name} aria-invalid={!!errors.name} onChange={e => setDelivery({ ...delivery, name: e.target.value })} />
                    </Field>
                    <Field label="Mobile number" htmlFor="d-phone" error={errors.phone} hint="The rider calls this number on arrival.">
                      <Input id="d-phone" inputMode="tel" autoComplete="tel" placeholder="0917 123 4567" value={delivery.phone} aria-invalid={!!errors.phone} onChange={e => setDelivery({ ...delivery, phone: e.target.value })} />
                    </Field>
                    <Field label="House no. and street" htmlFor="d-address" error={errors.address} className="sm:col-span-2">
                      <Input id="d-address" autoComplete="street-address" placeholder="Blk 5 Lot 12, Mabini St." value={delivery.address} aria-invalid={!!errors.address} onChange={e => setDelivery({ ...delivery, address: e.target.value })} />
                    </Field>
                    <Field label="Barangay" htmlFor="d-brgy" error={errors.barangay} hint="Dasmariñas City, Cavite">
                      <Input id="d-brgy" list="brgys" placeholder="Salawag" value={delivery.barangay} aria-invalid={!!errors.barangay} onChange={e => setDelivery({ ...delivery, barangay: e.target.value })} />
                      <datalist id="brgys">
                        {BARANGAYS.map(b => <option key={b} value={b} />)}
                      </datalist>
                    </Field>
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

              {step === 3 && receipt && <ReceiptSlip receipt={receipt} />}
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

/** The receipt prints out of a slot, then gets stamped. */
function ReceiptSlip({ receipt }: { receipt: Receipt }) {
  const reduce = useReducedMotion();
  const subtotal = receipt.items.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div className="flex flex-col items-center">
      <div className="h-3 w-full max-w-md rounded-full bg-ink shadow-[inset_0_-3px_0_#000]" aria-hidden />
      <div className="w-full max-w-[400px] overflow-hidden">
        <motion.div
          initial={reduce ? false : { y: "-100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto bg-paper px-6 pb-10 pt-6"
        >
          <svg aria-hidden viewBox="0 0 120 6" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-2.5 w-full">
            <path d={`M0 6 ${Array.from({ length: 20 }, (_, i) => `L${i * 6 + 3} 0 L${i * 6 + 6} 6`).join(" ")} Z`} fill="var(--color-ice)" />
          </svg>
          <p className="sign text-center text-[22px] text-ink">Hook &amp; Box</p>
          <p className="text-center text-[12px] text-ink-3">Fresh seafood · Dasmariñas City</p>
          <div className="my-4 border-t-2 border-dashed border-ice-3" />
          <p className="text-center text-[13px] text-ink-3">Order code</p>
          <p className="font-marker text-center text-[44px] leading-tight text-marker-deep">{receipt.code}</p>
          <div className="my-4 border-t-2 border-dashed border-ice-3" />
          <ul className="flex flex-col gap-1.5 font-mono text-[13px]">
            {receipt.items.map(i => (
              <li key={i.variantId} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">
                  {i.qty} × {i.name} {i.variantName}
                </span>
                <span className="tabular">{peso(i.price * i.qty)}</span>
              </li>
            ))}
            <li className="mt-2 flex justify-between border-t border-dashed border-ice-3 pt-2">
              <span>Subtotal</span>
              <span className="tabular">{peso(subtotal)}</span>
            </li>
            <li className="flex justify-between">
              <span>Delivery</span>
              <span className="tabular">{receipt.fee === 0 ? "FREE" : peso(receipt.fee)}</span>
            </li>
            <li className="flex justify-between text-[15px] font-bold">
              <span>TOTAL</span>
              <span className="tabular">{peso(receipt.total)}</span>
            </li>
          </ul>
          <div className="my-4 border-t-2 border-dashed border-ice-3" />
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
            <dt className="text-ink-3">Payment</dt>
            <dd className="text-right font-semibold">{receipt.payment === "GCASH" ? "GCash" : "Cash on delivery"}</dd>
            <dt className="text-ink-3">Delivery slot</dt>
            <dd className="text-right font-semibold">{receipt.slot}</dd>
            <dt className="text-ink-3">Status</dt>
            <dd className="text-right font-semibold">Pending confirmation</dd>
          </dl>
          <div className="pointer-events-none mt-7 flex justify-center pb-2">
            <Stamp tone="marker" rotate={-8} delay={reduce ? 0 : 1.15} className="text-[28px]">
              Thank you!
            </Stamp>
          </div>
        </motion.div>
      </div>
      <p className="mt-6 max-w-sm text-center text-sm text-ink-2">
        We&apos;ll confirm your order before packing. Keep your code to check its status anytime.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <ButtonLink href={`/track?code=${receipt.code}`}>Track this order</ButtonLink>
        <Link href="/#catch" className={buttonClass("outline")}>
          Keep shopping
        </Link>
      </div>
    </div>
  );
}

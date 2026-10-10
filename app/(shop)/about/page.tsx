import type { Metadata } from "next";
import { Clock, MapPin, Phone, ScrollText } from "lucide-react";

export const metadata: Metadata = { title: "About & contact" };

const TEAM = [
  { name: "Pam", role: "The Visionary" },
  { name: "Ichan", role: "The Chef Brain" },
  { name: "Chels", role: "The Planner" },
  { name: "Kiel", role: "The Negotiator" },
  { name: "EJ", role: "The Tech Guy" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
      <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-end">
        <h1 className="sign text-[clamp(52px,8vw,104px)] text-ink">
          A fish stall that <span className="text-teal-deep">counts every kilo</span>
        </h1>
        <p className="max-w-[52ch] pb-2 text-[17px] leading-relaxed text-ink-2">
          Hook &amp; Box brings the Cavite fish port&apos;s morning catch to households in Dasmariñas City. We clean it
          free, pack it on crushed ice, and deliver it before lunch.
        </p>
      </div>

      <div className="mt-12 overflow-hidden rounded-[var(--radius-card)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/scenes/market-stall.jpg" alt="Fresh fish and shrimp displayed at a market" className="aspect-[21/9] w-full object-cover" />
      </div>

      <section className="mt-16 grid gap-10 md:grid-cols-[1fr_1.2fr]">
        <h2 className="sign text-[44px] text-ink">Why a ledger?</h2>
        <div className="flex flex-col gap-4 text-[17px] leading-relaxed text-ink-2">
          <p>
            Most stalls keep stock on a whiteboard. When Messenger orders and walk-in buyers want the same last kilo,
            someone goes home disappointed.
          </p>
          <p>
            Every fish we receive, sell, spoil or recount is written down as its own entry with a reason and a time.
            Nothing is erased. Mistakes are fixed with a new entry. That is why the stock on each price tag is the
            real count, live.
          </p>
          <p className="flex items-center gap-2 text-[15px] font-semibold text-teal-ink">
            <ScrollText className="size-5" aria-hidden /> Staff can trace any count back, entry by entry.
          </p>
        </div>
      </section>

      <section id="contact" className="mt-16 scroll-mt-24 rounded-[var(--radius-card)] bg-ink p-7 text-white sm:p-10">
        <h2 className="sign text-[44px] text-tarp">Talk to the stall</h2>
        <div className="mt-7 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Phone, t: "Call or text", d: "0917 XXX XXXX" },
            { icon: Clock, t: "Open", d: "Mon–Sat, 6:00 AM – 6:00 PM" },
            { icon: MapPin, t: "We deliver to", d: "All of Dasmariñas City, Cavite" },
          ].map(x => (
            <div key={x.t} className="flex gap-3">
              <x.icon className="mt-0.5 size-5 shrink-0 text-mint" aria-hidden />
              <div>
                <p className="font-bold">{x.t}</p>
                <p className="text-white/75">{x.d}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-7 text-sm text-white/60">
          For bulk or special-catch requests, call ahead. This demo site doesn&apos;t send messages or emails.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="sign text-[44px] text-ink">The capstone team</h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {TEAM.map(m => (
            <li key={m.name} className="rounded-xl bg-paper p-4 ring-1 ring-inset ring-ice-3">
              <p className="font-marker text-[28px] leading-none text-marker-deep">{m.name}</p>
              <p className="mt-2 text-sm text-ink-3">{m.role}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-3">
          Hook &amp; Box is a fictional business built for an academic capstone (SIA). All products, orders and people in
          the data are made up.
        </p>
      </section>
    </div>
  );
}

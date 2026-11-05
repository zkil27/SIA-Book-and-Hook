import Image from "next/image";
import type { ReactNode } from "react";

/** Split layout for sign-in pages: the catch on ice beside the form. */
export function AuthShell({ title, lede, children }: { title: string; lede: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-8 sm:px-6 sm:pt-12 md:grid-cols-[1fr_440px] md:items-start">
      <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] md:block">
        {/*
          Hidden below md. `sizes` reports 1px there, so phones only fetch the
          smallest variant instead of the 600 KB original they never see.
        */}
        <Image
          src="/scenes/catch-on-ice.jpg"
          alt="Assorted fresh seafood on crushed ice"
          fill
          sizes="(min-width: 1152px) 600px, (min-width: 768px) 50vw, 1px"
          className="object-cover"
        />
      </div>
      <div className="rounded-[var(--radius-card)] bg-paper p-6 ring-1 ring-inset ring-ice-3 sm:p-8">
        <h1 className="sign text-[48px] text-ink">{title}</h1>
        <div className="mt-2 mb-6 text-ink-2">{lede}</div>
        {children}
      </div>
    </div>
  );
}

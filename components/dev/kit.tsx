import type { ReactNode } from "react";
import { Chip } from "@/components/ui/primitives";

/**
 * Shared bits for /admin/dev. Same ice/paper/ink admin world; the only dev
 * identity is the ink band. Results always pair colour with a text label.
 */

export type Outcome = "pass" | "warn" | "fail";

const OUTCOME: Record<Outcome, { tone: "green" | "yellow" | "red"; label: string }> = {
  pass: { tone: "green", label: "Pass" },
  warn: { tone: "yellow", label: "Warn" },
  fail: { tone: "red", label: "Fail" },
};

export function OutcomeChip({ outcome, children }: { outcome: Outcome; children?: ReactNode }) {
  const o = OUTCOME[outcome];
  return (
    <Chip tone={o.tone}>
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {children ?? o.label}
    </Chip>
  );
}

/** Label / value rows for environment facts. */
export function Facts({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-6 gap-y-2.5 text-sm">
      {rows.map(([k, v], i) => (
        <div key={i} className="contents">
          <dt className="text-ink-3">{k}</dt>
          <dd className="min-w-0 break-words font-medium text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Milliseconds in tabular mono, tinted when slow. */
export function Ms({ value, slowAt = 300 }: { value: number; slowAt?: number }) {
  return (
    <span className={`tabular font-mono text-[13px] ${value > slowAt ? "font-bold text-marker-deep" : "text-ink"}`}>
      {value} ms
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-ink-3">{children}</p>;
}

"use client";

import { useEffect, type ComponentProps } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Delete } from "lucide-react";

/**
 * Glove-sized numeric keypad for the customer's 4-digit handoff PIN. Digits
 * can also be typed on a keyboard. `shake` (a counter) wobbles the boxes
 * after a wrong PIN.
 */
export function PinPad({
  value,
  onChange,
  disabled = false,
  shake = 0,
  label = "Customer's PIN",
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  shake?: number;
  label?: string;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (disabled) return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (/^\d$/.test(e.key) && value.length < 4) {
        e.preventDefault();
        onChange(value + e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        onChange(value.slice(0, -1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [value, onChange, disabled]);

  const press = (d: string) => !disabled && value.length < 4 && onChange(value + d);

  return (
    <div>
      <p className="text-center text-[13px] font-bold uppercase tracking-wider text-ink-2" aria-hidden>
        {label}
      </p>
      <motion.div
        key={shake}
        initial={false}
        animate={shake && !reduce ? { x: [0, -12, 12, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: 0.38 }}
        className="mx-auto mt-2 flex w-fit gap-2.5"
        role="img"
        aria-label={`${label}: ${value.length} of 4 digits entered`}
      >
        {[0, 1, 2, 3].map(i => {
          const filled = i < value.length;
          return (
            <span
              key={i}
              className={`tabular grid h-16 w-14 place-items-center rounded-xl text-[32px] font-black leading-none transition-[box-shadow,background-color] ${
                filled ? "bg-paper text-ink ring-2 ring-ink" : i === value.length ? "bg-paper ring-2 ring-teal-deep" : "bg-ice-2 ring-1 ring-ice-3"
              }`}
            >
              {filled ? value[i] : ""}
            </span>
          );
        })}
      </motion.div>
      <div className="mx-auto mt-4 grid max-w-[320px] grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(d => (
          <Key key={d} onClick={() => press(d)} disabled={disabled}>
            {d}
          </Key>
        ))}
        <Key onClick={() => onChange("")} disabled={disabled || !value} aria-label="Clear">
          <span className="text-[15px] font-semibold">Clear</span>
        </Key>
        <Key onClick={() => press("0")} disabled={disabled}>
          0
        </Key>
        <Key onClick={() => onChange(value.slice(0, -1))} disabled={disabled || !value} aria-label="Delete last digit">
          <Delete className="size-6" aria-hidden />
        </Key>
      </div>
    </div>
  );
}

function Key({ children, ...rest }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      {...rest}
      className="tabular grid h-16 place-items-center rounded-xl bg-paper text-[26px] font-bold text-ink ring-1 ring-inset ring-ice-3 shadow-[0_2px_0_var(--color-ice-3)] transition-[transform,box-shadow] active:translate-y-[2px] active:shadow-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

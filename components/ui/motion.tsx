"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";

export const SPRING = { type: "spring", stiffness: 420, damping: 30 } as const;
export const SPRING_SOFT = { type: "spring", stiffness: 260, damping: 26 } as const;

// ── Stamp ────────────────────────────────────────────────────────────────────
// An ink stamp that thumps onto the surface: lands big and settles at a tilt.

const STAMP_TONE = {
  marker: "text-marker border-marker",
  teal: "text-teal-deep border-teal-deep",
  leaf: "text-leaf border-leaf",
  ink: "text-ink border-ink",
};

export function Stamp({
  children,
  tone = "marker",
  rotate = -8,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof STAMP_TONE;
  rotate?: number;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      initial={reduce ? false : { scale: 2.4, opacity: 0, rotate: rotate - 14 }}
      animate={{ scale: 1, opacity: 1, rotate }}
      transition={{ type: "spring", stiffness: 600, damping: 17, mass: 0.9, delay }}
      className={`sign inline-block rounded-md border-[3px] px-3 pb-1 pt-1.5 outline-2 outline-offset-2 outline-current/50 [outline-style:solid] mix-blend-multiply opacity-90 ${STAMP_TONE[tone]} ${className}`}
    >
      {children}
    </motion.span>
  );
}

// ── Odometer ─────────────────────────────────────────────────────────────────
// Digits roll to their new value like a mechanical counter.

export function Odometer({ value, className = "" }: { value: string | number; className?: string }) {
  const chars = String(value).split("");
  return (
    <span className={`inline-flex tabular leading-none ${className}`} aria-label={String(value)} role="img">
      {chars.map((ch, i) => {
        const key = chars.length - i; // key from the right so columns stay put
        if (!/\d/.test(ch)) {
          return (
            <span key={`s${key}`} aria-hidden>
              {ch}
            </span>
          );
        }
        return <DigitColumn key={`d${key}`} digit={Number(ch)} />;
      })}
    </span>
  );
}

function DigitColumn({ digit }: { digit: number }) {
  const reduce = useReducedMotion();
  return (
    <span aria-hidden className="relative inline-block h-[1em] overflow-hidden">
      <span className="invisible">0</span>
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={false}
        animate={{ y: `${-digit}em` }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28 }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="h-[1em] leading-none">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

// ── Sheet ────────────────────────────────────────────────────────────────────
// Side panel (bottom sheet on phones) for tasks that keep page context.

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const wide = useMediaQuery("(min-width: 640px)");

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => panelRef.current?.focus(), 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      prevFocus?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`absolute inset-x-0 bottom-0 top-auto flex max-h-[92dvh] flex-col rounded-t-2xl bg-ice shadow-[var(--shadow-sheet)] outline-none sm:inset-y-0 sm:left-auto sm:right-0 sm:top-0 sm:max-h-none sm:w-full sm:rounded-none ${width}`}
            initial={reduce ? { opacity: 0 } : wide ? { x: "100%" } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { x: 0, y: 0 }}
            exit={reduce ? { opacity: 0 } : wide ? { x: "100%" } : { y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-ice-3 px-5 pb-4 pt-5">
              <div className="min-w-0">
                <h2 id={titleId} className="text-lg font-bold text-ink">
                  {title}
                </h2>
                {description && <p className="mt-0.5 text-sm text-ink-3">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="-mr-1.5 -mt-1 grid size-9 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-ice-2 hover:text-ink"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer && <div className="border-t border-ice-3 bg-paper px-5 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatch(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return match;
}

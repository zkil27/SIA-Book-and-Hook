"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { CircleAlert, CircleCheck, Undo2, X } from "lucide-react";

type ToastInput = {
  title: string;
  description?: string;
  tone?: "success" | "error" | "info";
  /** Shows an Undo button; the callback runs the compensating action. */
  undo?: () => void | Promise<void>;
  duration?: number;
};
type ToastItem = ToastInput & { id: number };

const ToastContext = createContext<(t: ToastInput) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const reduce = useReducedMotion();

  const dismiss = useCallback((id: number) => setItems(list => list.filter(t => t.id !== id)), []);

  const push = useCallback(
    (t: ToastInput) => {
      const id = ++seq.current;
      const duration = t.duration ?? (t.undo ? 6500 : 4000);
      setItems(list => [...list.slice(-2), { ...t, id, duration }]);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:bottom-4"
      >
        <AnimatePresence initial={false}>
          {items.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
              className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-xl bg-ink text-white shadow-[var(--shadow-sheet)]"
              role="status"
            >
              <div className="flex items-start gap-3 px-4 py-3">
                {t.tone === "error" ? (
                  <CircleAlert className="mt-0.5 size-5 shrink-0 text-[#ff8a98]" aria-hidden />
                ) : (
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-mint" aria-hidden />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-[13px] text-white/75">{t.description}</p>}
                </div>
                {t.undo && (
                  <button
                    onClick={async () => {
                      dismiss(t.id);
                      await t.undo?.();
                    }}
                    className="-my-1 inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/12 px-3 text-[13px] font-semibold text-tarp transition-colors hover:bg-white/20"
                  >
                    <Undo2 className="size-4" aria-hidden /> Undo
                  </button>
                )}
                <button
                  onClick={() => dismiss(t.id)}
                  className="-my-1 -mr-2 grid size-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
                  aria-label="Dismiss"
                >
                  <X className="size-4" />
                </button>
              </div>
              {t.undo && !reduce && (
                <motion.div
                  className="absolute bottom-0 left-0 h-[3px] bg-tarp"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: (t.duration ?? 6500) / 1000, ease: "linear" }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

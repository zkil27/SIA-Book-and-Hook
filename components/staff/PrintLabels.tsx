"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { BagLabel, type LabelData } from "./BagLabel";

/**
 * Print bag labels from the page you're on: mounts an off-screen label sheet
 * (one 100×150 mm page per order, see `.label-sheet` in globals.css) and opens
 * the browser's print dialog. No new tab, so popup blockers never get in the
 * way, and no PDF library or printer driver integration.
 */
export function usePrintLabels() {
  const [labels, setLabels] = useState<LabelData[] | null>(null);

  useEffect(() => {
    if (!labels) return;
    const done = () => setLabels(null);
    window.addEventListener("afterprint", done, { once: true });
    // One frame so the sheet is laid out (and fonts applied) before printing.
    const t = window.setTimeout(() => window.print(), 60);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("afterprint", done);
    };
  }, [labels]);

  const sheet =
    labels && labels.length > 0
      ? createPortal(
          <div className="print-area label-sheet" aria-hidden>
            {labels.map(l => (
              <BagLabel key={l.code} label={l} />
            ))}
          </div>,
          document.body
        )
      : null;

  const print = useCallback((next: LabelData[]) => setLabels(next.length ? next : null), []);
  return { print, sheet };
}

// ── "Print a label when confirming" (per device) ─────────────────────────────

const KEY = "hb:print-on-confirm";
const listeners = new Set<() => void>();
/** Fallback when storage is blocked (private mode): lasts until reload. */
let memory: boolean | null = null;

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function read(): boolean {
  if (memory !== null) return memory;
  try {
    return window.localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

/**
 * Whether confirming an order also prints its label. On by default; a
 * counter without a label printer (or a demo laptop) can switch it off.
 */
export function usePrintOnConfirm(): [boolean, (on: boolean) => void] {
  const on = useSyncExternalStore(subscribe, read, () => true);
  const set = (next: boolean) => {
    try {
      window.localStorage.setItem(KEY, next ? "on" : "off");
      memory = null;
    } catch {
      memory = next;
    }
    listeners.forEach(l => l());
  };
  return [on, set];
}

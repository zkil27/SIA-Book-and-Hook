"use client";

import { animate } from "motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

/**
 * Client-side basket (scope: the cart lives in the browser). Items keep a
 * snapshot for display; checkout re-reads every price and stock level from
 * the database, so a stale snapshot can never undercharge.
 */

export type BasketItem = {
  variantId: string;
  productId: string;
  name: string;
  variantName: string;
  price: number; // centavos, display snapshot only
  image: string | null;
  qty: number;
  stock: number;
};

type BasketCtx = {
  items: BasketItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: Omit<BasketItem, "qty">, qty?: number, from?: HTMLElement | null) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  qtyOf: (variantId: string) => number;
  targetRef: RefObject<HTMLButtonElement | null>;
  bump: number;
};

const Ctx = createContext<BasketCtx | null>(null);
const KEY = "hb-basket-v1";

export function useBasket(): BasketCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBasket must be used inside <BasketProvider>");
  return ctx;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Arc a copy of the product photo from the card into the basket. */
function tossIntoBasket(from: HTMLElement, target: HTMLElement): Promise<void> {
  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const size = Math.min(a.width, a.height, 132);
  const ghost = document.createElement("div");
  const img = from instanceof HTMLImageElement ? from.currentSrc || from.src : null;
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${a.left + a.width / 2 - size / 2}px`,
    top: `${a.top + a.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "18px",
    backgroundColor: "#cfe0e6",
    backgroundImage: img ? `url("${img}")` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 18px 40px -12px rgba(19,25,28,.45), 0 0 0 3px #fff",
    zIndex: "70",
    pointerEvents: "none",
    willChange: "transform",
  });
  document.body.appendChild(ghost);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const lift = Math.min(-80, dy * 0.35 - 120); // peak of the arc above both points

  return animate(
    ghost,
    {
      x: [0, dx * 0.45, dx],
      y: [0, lift, dy],
      scale: [1, 0.72, 0.16],
      rotate: [0, -16, 24],
      borderRadius: ["18px", "24px", "999px"],
    },
    { duration: 0.72, ease: [0.33, 0, 0.2, 1], times: [0, 0.45, 1] }
  ).then(() => ghost.remove());
}

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const targetRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BasketItem[];
        // Reading localStorage is an external system and must wait for mount
        // (the server has no storage), so this one setState-in-effect is intended.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (Array.isArray(parsed)) setItems(parsed.filter(i => i && i.variantId && i.qty > 0));
      }
    } catch {
      /* storage unavailable: basket still works for this visit */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, ready]);

  const add = useCallback<BasketCtx["add"]>((item, qty = 1, from) => {
    setItems(list => {
      const existing = list.find(i => i.variantId === item.variantId);
      if (existing) {
        return list.map(i =>
          i.variantId === item.variantId ? { ...i, ...item, qty: Math.min(i.qty + qty, item.stock) } : i
        );
      }
      return [...list, { ...item, qty: Math.min(qty, item.stock) }];
    });
    const target = targetRef.current;
    if (from && target && !prefersReducedMotion()) {
      void tossIntoBasket(from, target).then(() => setBump(b => b + 1));
    } else {
      setBump(b => b + 1);
    }
  }, []);

  const setQty = useCallback((variantId: string, qty: number) => {
    setItems(list =>
      qty <= 0
        ? list.filter(i => i.variantId !== variantId)
        : list.map(i => (i.variantId === variantId ? { ...i, qty: Math.min(qty, i.stock) } : i))
    );
  }, []);

  const remove = useCallback((variantId: string) => setItems(list => list.filter(i => i.variantId !== variantId)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<BasketCtx>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    return {
      items,
      count,
      subtotal,
      ready,
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
      qtyOf: (id: string) => items.find(i => i.variantId === id)?.qty ?? 0,
      targetRef,
      bump,
    };
  }, [items, ready, open, add, setQty, remove, clear, bump]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

"use client";

import { animate } from "motion";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
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

const KEY = "hb-basket-v1";

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

// ── Store ────────────────────────────────────────────────────────────────────
// An external store instead of a context value, so a component can subscribe
// to just the slice it shows. A product card listens to its own variant's
// quantity only; adding one item no longer re-renders every card on the page.

type State = { items: BasketItem[]; ready: boolean; open: boolean; bump: number };
const EMPTY: State = { items: [], ready: false, open: false, bump: 0 };
const serverState = () => EMPTY;

type Actions = Pick<BasketCtx, "setOpen" | "add" | "setQty" | "remove" | "clear">;

function createBasketStore(persist: boolean) {
  let state = EMPTY;
  const listeners = new Set<() => void>();
  const targetRef: RefObject<HTMLButtonElement | null> = { current: null };

  function set(patch: (s: State) => Partial<State>) {
    const next = { ...state, ...patch(state) };
    if (persist && next.ready && next.items !== state.items) {
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next.items));
      } catch {
        /* storage full or blocked: the basket still works for this visit */
      }
    }
    state = next;
    listeners.forEach(l => l());
  }

  const actions: Actions = {
    setOpen: open => set(() => ({ open })),
    add(item, qty = 1, from) {
      set(s => {
        const existing = s.items.find(i => i.variantId === item.variantId);
        return {
          items: existing
            ? s.items.map(i => (i.variantId === item.variantId ? { ...i, ...item, qty: Math.min(i.qty + qty, item.stock) } : i))
            : [...s.items, { ...item, qty: Math.min(qty, item.stock) }],
        };
      });
      const target = targetRef.current;
      const bumpIt = () => set(s => ({ bump: s.bump + 1 }));
      if (from && target && !prefersReducedMotion()) void tossIntoBasket(from, target).then(bumpIt);
      else bumpIt();
    },
    setQty: (variantId, qty) =>
      set(s => ({
        items:
          qty <= 0
            ? s.items.filter(i => i.variantId !== variantId)
            : s.items.map(i => (i.variantId === variantId ? { ...i, qty: Math.min(qty, i.stock) } : i)),
      })),
    remove: variantId => set(s => ({ items: s.items.filter(i => i.variantId !== variantId) })),
    clear: () => set(() => ({ items: [] })),
  };

  return {
    getState: () => state,
    subscribe(l: () => void) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    targetRef,
    actions,
    /** Load the saved basket. Runs after mount: the server has no storage. */
    restore() {
      let items: BasketItem[] = [];
      if (persist) {
        try {
          const raw = window.localStorage.getItem(KEY);
          const parsed = raw ? (JSON.parse(raw) as BasketItem[]) : [];
          if (Array.isArray(parsed)) items = parsed.filter(i => i && i.variantId && i.qty > 0);
        } catch {
          /* storage unavailable: basket still works for this visit */
        }
      }
      set(() => ({ items, ready: true }));
    },
  };
}

type BasketStore = ReturnType<typeof createBasketStore>;

const Ctx = createContext<BasketStore | null>(null);

function useStore(): BasketStore {
  const store = useContext(Ctx);
  if (!store) throw new Error("useBasket must be used inside <BasketProvider>");
  return store;
}

/**
 * `persist={false}` keeps the basket in memory only (the dev UI gallery uses
 * this so previews never touch a shopper's saved basket).
 */
export function BasketProvider({ children, persist = true }: { children: ReactNode; persist?: boolean }) {
  const [store] = useState(() => createBasketStore(persist));
  useEffect(() => {
    store.restore();
  }, [store]);
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

/** The whole basket: for the basket button, sheet and checkout. */
export function useBasket(): BasketCtx {
  const store = useStore();
  const s = useSyncExternalStore(store.subscribe, store.getState, serverState);
  return useMemo(() => {
    const count = s.items.reduce((n, i) => n + i.qty, 0);
    const subtotal = s.items.reduce((n, i) => n + i.price * i.qty, 0);
    return {
      ...s,
      ...store.actions,
      count,
      subtotal,
      qtyOf: (id: string) => s.items.find(i => i.variantId === id)?.qty ?? 0,
      targetRef: store.targetRef,
    };
  }, [s, store]);
}

/** How many of one variant are in the basket. Re-renders only when that number changes. */
export function useBasketQty(variantId: string): number {
  const store = useStore();
  return useSyncExternalStore(
    store.subscribe,
    () => store.getState().items.find(i => i.variantId === variantId)?.qty ?? 0,
    () => 0
  );
}

/** Basket actions without subscribing to its contents. */
export function useBasketActions(): Actions {
  return useStore().actions;
}

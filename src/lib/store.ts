import { useSyncExternalStore } from "react";

export type BagItem = {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  image: string;
  price: number;
  size: string;
  color: string;
  qty: number;
};

type State = { bag: BagItem[]; wishlist: string[]; recent: string[]; bagOpen: boolean };
let state: State = { bag: [], wishlist: [], recent: [], bagOpen: false };
const listeners = new Set<() => void>();
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem("fabrico_store");
    if (raw) state = { ...state, ...JSON.parse(raw), bagOpen: false };
  } catch {}
}
function set(p: Partial<State>) {
  state = { ...state, ...p };
  try {
    const { bagOpen, ...persist } = state;
    localStorage.setItem("fabrico_store", JSON.stringify(persist));
  } catch {}
  listeners.forEach((l) => l());
}
const empty: State = { bag: [], wishlist: [], recent: [], bagOpen: false };

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => {
      hydrate();
      listeners.add(l);
      l();
      return () => listeners.delete(l);
    },
    () => sel(state),
    () => sel(empty),
  );
}

export const store = {
  addToBag(item: BagItem) {
    const i = state.bag.findIndex((b) => b.productId === item.productId && b.size === item.size && b.color === item.color);
    const bag = [...state.bag];
    if (i >= 0) bag[i] = { ...bag[i]!, qty: Math.min(10, bag[i]!.qty + item.qty) };
    else bag.push(item);
    set({ bag, bagOpen: true });
  },
  setQty(idx: number, qty: number) {
    const bag = [...state.bag];
    if (qty <= 0) bag.splice(idx, 1);
    else bag[idx] = { ...bag[idx]!, qty: Math.min(10, qty) };
    set({ bag });
  },
  clearBag() {
    set({ bag: [] });
  },
  setBagOpen(bagOpen: boolean) {
    set({ bagOpen });
  },
  toggleWishlist(id: string): boolean {
    const has = state.wishlist.includes(id);
    set({ wishlist: has ? state.wishlist.filter((w) => w !== id) : [id, ...state.wishlist] });
    return !has;
  },
  pushRecent(id: string) {
    set({ recent: [id, ...state.recent.filter((r) => r !== id)].slice(0, 12) });
  },
};

export function getSessionId() {
  if (typeof window === "undefined") return "ssr";
  let id = sessionStorage.getItem("fabrico_sid");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("fabrico_sid", id);
  }
  return id;
}

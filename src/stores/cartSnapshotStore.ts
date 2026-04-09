import { create } from "zustand";
import type { CartSnapshotData } from "../types/cartWs";

interface CartSnapshotState {
  snapshot: CartSnapshotData | null;
  setSnapshot: (data: CartSnapshotData | null) => void;
  /** 장바구니에 담긴 항목 수 (수량 합) */
  itemCount: number;
}

export const useCartSnapshotStore = create<CartSnapshotState>((set) => ({
  snapshot: null,
  itemCount: 0,
  setSnapshot: (data) =>
    set({
      snapshot: data,
      itemCount: data?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0,
    }),
}));

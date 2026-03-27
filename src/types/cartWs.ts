/**
 * 실시간 장바구니 WebSocket payload 타입 (v3)
 * WS URL: /ws/django/cart/{table_usage_id}/
 */

export type CartWsEventType =
  | "CART_SNAPSHOT"
  | "CART_ITEM_ADDED"
  | "CART_ITEM_UPDATED"
  | "CART_ITEM_DELETED"
  | "CART_COUPON_APPLIED"
  | "CART_COUPON_CANCELLED"
  | "CART_PAYMENT_PENDING"
  | "CART_RESET"
  | "ERROR";

export interface CartWsPayload<T = CartSnapshotData> {
  type: CartWsEventType;
  timestamp: string;
  message: string;
  data: T;
}

export interface TableUsage {
  id: number;
  table_id: number;
  table_num: number;
  booth_id: number;
  group_id: number | null;
  started_at: string;
  ended_at: string | null;
}

export interface CartInfo {
  id: number;
  table_usage_id: number;
  status: string;
  cart_price: number;
  pending_expires_at: string | null;
  round: number;
  created_at: string;
}

export interface CartItem {
  id: number;
  type: "menu" | "setmenu";
  menu_id: number | null;
  set_menu_id: number | null;
  name: string;
  unit_price: number;
  quantity: number;
  line_price: number;
  is_sold_out: boolean;
}

export interface CartCoupon {
  applied: boolean;
  coupon_id: number | null;
  coupon_code: string | null;
  discount_type: string | null;
  discount_value: number | null;
  discount_amount: number;
}

export interface CartSummary {
  subtotal: number;
  discount_total: number;
  total: number;
}

export interface CartSnapshotData {
  table_usage: TableUsage;
  cart: CartInfo;
  items: CartItem[];
  coupon: CartCoupon;
  summary: CartSummary;
}

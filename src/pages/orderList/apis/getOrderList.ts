// src/pages/orderList/apis/getOrderList.ts
import axios from "axios";

/**
 * v3 주문 내역 API 응답 타입
 * GET /api/v3/django/order/table/{table_usage_id}/
 */
export interface V3OrderItem {
  id: number;
  menu_id: number;
  name: string;
  image: string | null;
  quantity: number;
  fixed_price: number;
  item_total_price: number;
  from_set: boolean;
  status?: string;
}

export interface V3Order {
  order_id: number;
  order_status: string;
  created_at: string;
  has_coupon: boolean;
  coupon_name: string | null;
  table_coupon_id: number | null;
  order_discount_price: number;
  order_fixed_price: number;
  order_items: V3OrderItem[];
}

export interface V3OrderListResponse {
  message: string;
  data: {
    table_usage_id: number;
    table_number: string;
    table_total_price: number;
    total_original_price: number;
    total_discount_price: number;
    order_list: V3Order[];
  };
}

/**
 * 프론트에서 쓰기 쉬운 정규화된 아이템 타입
 */
export type NormalizedOrderItem = {
  id: number;
  name: string;
  price: number; // fixed_price (단가)
  image: string | null;
  quantity: number;
};

export function toAbsoluteUrl(path?: string | null): string | null {
  if (!path) return null;

  const trimmed = String(path).trim();
  if (!trimmed || trimmed.toLowerCase() === "null") return null; // 🔒 "null" 문자열 방어

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const base = (import.meta.env.VITE_BASE_URL ?? "").replace(/\/+$/, "");
  const rel = trimmed.replace(/^\/+/, "");
  return base ? `${base}/${rel}` : `/${rel}`;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL ?? "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/**
 * v3 주문 내역 조회 후, UI에서 쓰기 쉬운 형태로 변환한 응답 타입
 */
export interface OrderListUiResponse {
  status: "success" | "error";
  code: number;
  data?: {
    order_amount: number;
    orders: NormalizedOrderItem[];
  };
  message?: string;
}

export async function getOrderList(tableUsageId: number): Promise<OrderListUiResponse> {
  if (!tableUsageId) {
    return {
      status: "error",
      code: 400,
      message: "유효한 table_usage_id가 필요합니다.",
    };
  }

  const res = await api.get<V3OrderListResponse>(
    `/api/v3/django/order/table/${tableUsageId}/`
  );

  const raw = res.data;
  const orders: NormalizedOrderItem[] =
    raw.data.order_list.flatMap((order) =>
      order.order_items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.fixed_price,
        image: toAbsoluteUrl(item.image),
        quantity: item.quantity,
      }))
    );

  return {
    status: "success",
    code: 200,
    data: {
      order_amount: raw.data.table_total_price,
      orders,
    },
    message: raw.message,
  };
}

import { useEffect, useRef } from "react";
import type { CartWsPayload, CartSnapshotData } from "../types/cartWs";
import { useCartSnapshotStore } from "@stores/cartSnapshotStore";

const AUTH_FAILURE_CLOSE_CODE = 4001;

function getWsBaseUrl(): string {
  const base = (import.meta.env.VITE_BASE_URL ?? "").replace(/\/+$/, "");
  if (base.startsWith("https://")) return base.replace("https://", "wss://");
  if (base.startsWith("http://")) return base.replace("http://", "ws://");
  return base;
}

/**
 * 실시간 장바구니 WebSocket 연결.
 * table_usage_id가 있을 때만 연결하며, 수신한 스냅샷으로 cartSnapshotStore를 갱신한다.
 */
export function useCartWebSocket(tableUsageId: string | null) {
  const setSnapshot = useCartSnapshotStore((s) => s.setSnapshot);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    const raw = tableUsageId?.trim();
    const id = raw && /^\d+$/.test(raw) ? raw : null;
    if (!id) {
      setSnapshot(null);
      return;
    }

    const baseUrl = getWsBaseUrl();
    const wsUrl = `${baseUrl}/ws/django/cart/${id}/`;

    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data as string) as CartWsPayload;
          if (payload?.data && typeof payload.data === "object") {
            setSnapshot(payload.data as CartSnapshotData);
          }
        } catch {
          // ignore parse error
        }
      };

      ws.onclose = (e) => {
        wsRef.current = null;
        if (e.code === AUTH_FAILURE_CLOSE_CODE) {
          setSnapshot(null);
          return;
        }
        // 재연결 (최대 5회, 지수 백오프)
        const maxAttempts = 5;
        if (reconnectAttempts.current < maxAttempts) {
          const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
          reconnectAttempts.current += 1;
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        // onclose에서 정리
      };
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setSnapshot(null);
    };
  }, [tableUsageId, setSnapshot]);
}

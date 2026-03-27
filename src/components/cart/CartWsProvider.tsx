import { useCartWebSocket } from '@hooks/useCartWebSocket';

/**
 * table_usage_id가 localStorage에 있으면 실시간 장바구니 WebSocket에 연결합니다.
 * DefaultLayout 하위에서 사용합니다.
 */
export function CartWsProvider({ children }: { children: React.ReactNode }) {
  const tableUsageId =
    typeof window !== 'undefined' ? localStorage.getItem('tableUsageId') : null;
  useCartWebSocket(tableUsageId);
  return <>{children}</>;
}

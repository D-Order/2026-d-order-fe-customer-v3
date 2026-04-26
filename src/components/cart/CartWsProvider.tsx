import { useCartWebSocket } from '@hooks/useCartWebSocket';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * table_usage_id가 localStorage에 있으면 실시간 장바구니 WebSocket에 연결합니다.
 * DefaultLayout 하위에서 사용합니다.
 */
export function CartWsProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [tableUsageId, setTableUsageId] = useState<string | null>(() => {
    return typeof window !== 'undefined'
      ? localStorage.getItem('tableUsageId')
      : null;
  });

  // 같은 탭에서 localStorage가 갱신돼도 re-render가 안 나기 때문에,
  // 라우트 이동 시점에 다시 읽어 WS를 즉시 연결한다.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setTableUsageId(localStorage.getItem('tableUsageId'));
  }, [location.key]);

  // 다른 탭에서 변경된 경우 반영
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'tableUsageId') setTableUsageId(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useCartWebSocket(tableUsageId);
  return <>{children}</>;
}

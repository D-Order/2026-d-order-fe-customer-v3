import { enterTable } from '@pages/login/_api/LoginAPI';
import { useCartSnapshotStore } from '@stores/cartSnapshotStore';

/**
 * 테이블 초기화(BE의 reset_tables) 발생 시 자동으로 같은 테이블에 재입장하기 위한 유틸.
 *
 * 호출 지점:
 *  - useCartWebSocket.ts: WS로 `CART_RESET` + `data.ended === true` 수신 시
 *  - services/instance.ts: API가 410(Gone)을 반환했을 때 fallback
 *
 * BE의 `init_or_enter_table`은 idempotent (이미 IN_USE면 기존 active usage 반환)이므로
 * 여러 탭/유저가 동시에 호출해도 안전하다.
 *
 * 동시에 두 경로(WS + 410)에서 호출되는 race를 막기 위해 inFlight 플래그를 둔다.
 */

let inFlight = false;

export async function attemptTableReEntry(): Promise<boolean> {
  if (inFlight) return true; // 이미 다른 트리거가 처리 중
  inFlight = true;

  try {
    const boothId = localStorage.getItem('boothId');
    const tableNum = localStorage.getItem('tableNum');
    if (!boothId || !tableNum) {
      // localStorage가 비어 있으면 재입장 불가능 → 호출자가 로그인 페이지 폴백
      return false;
    }

    const res = await enterTable(boothId, tableNum);
    const newUsageId = res.data?.data?.table_usage_id;
    if (typeof newUsageId !== 'number') return false;

    // 이전 세션 정리 + 새 세션 반영
    localStorage.setItem('tableUsageId', String(newUsageId));
    localStorage.setItem('tableNum', String(res.data.data.table_num));
    localStorage.removeItem('cartId');
    useCartSnapshotStore.getState().setSnapshot(null);

    // 어떤 페이지에 있든 메뉴리스트로 이동시켜 fresh round로 시작.
    // 결제대기/주문완료 같은 중간 상태 페이지에 남아있으면 UX가 어색하므로 강제 이동.
    if (window.location.pathname !== '/menu-list') {
      window.location.href = '/menu-list';
    } else {
      // 이미 menu-list면 새로고침해서 새 tableUsageId로 WS 재연결 보장
      window.location.reload();
    }
    return true;
  } catch (e) {
    console.error('[tableReEntry] 재입장 실패', e);
    return false;
  } finally {
    // location.href / reload가 동기적이지 않으니 일단 풀어둠.
    // 실제로는 페이지 이탈 직전이라 다시 호출될 일은 거의 없음.
    inFlight = false;
  }
}

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_CONSTANTS } from '@constants/RouteConstants';
import { accountInfoType, Menu } from '../types/types';
import { useCartSnapshotStore } from '@stores/cartSnapshotStore';
import { cartApiV3 } from '../_api/cartApiV3';
import type { CartItem } from '../../../types/cartWs';

function extractAccountFromObject(
  o: Record<string, unknown>,
): accountInfoType | null {
  const holder =
    o.account_holder ?? o.depositor ?? o.account_holder_name ?? o.name;
  const bank = o.bank_name ?? o.bank;
  const accountNum = o.account_number ?? o.account ?? o.account_num ?? o.number;

  const account_holder = holder != null ? String(holder).trim() : '';
  const bank_name = bank != null ? String(bank).trim() : '';
  const account_number = accountNum != null ? String(accountNum).trim() : '';

  if (!account_holder && !account_number) return null;
  return { account_holder, bank_name, account_number };
}

/** payment-info 응답: data 래핑·중첩·payment_info 등 */
function parsePaymentInfoResponse(response: unknown): accountInfoType | null {
  if (response == null || typeof response !== 'object') return null;
  const root = response as Record<string, unknown>;
  const dataObj = root.data as Record<string, unknown> | undefined;
  const candidates: unknown[] = [
    root,
    root.data,
    dataObj?.data,
    /** API: { data: { payment: { depositor, bank_name, account } } } */
    dataObj?.payment,
    dataObj?.payment_info,
    root.payment_info,
    root.payment,
    root.account,
  ];

  for (const cur of candidates) {
    if (!cur || typeof cur !== 'object') continue;
    const hit = extractAccountFromObject(cur as Record<string, unknown>);
    if (hit) return hit;
  }

  return null;
}

/** v3 CartItem → 장바구니 UI용 Menu 형태로 변환 */
function cartItemToMenu(item: CartItem): Menu {
  return {
    id: item.id,
    is_soldout: item.is_sold_out,
    menu_amount: 99,
    menu_name: item.name,
    menu_price: item.unit_price,
    min_menu_amount: 1,
    discounted_price: item.unit_price,
    original_price: item.unit_price,
    quantity: item.quantity,
  };
}

const useShoppingCartPage = () => {
  const navigate = useNavigate();
  const snapshot = useCartSnapshotStore((s) => s.snapshot);
  const setSnapshot = useCartSnapshotStore((s) => s.setSnapshot);

  /** GET /api/v3/django/cart/detail/ 로 스냅샷 동기화 */
  const refreshCartFromDetail = useCallback(async () => {
    try {
      const snap = await cartApiV3.getDetail();
      if (snap) setSnapshot(snap);
    } catch (e) {
      console.error('[cart/detail]', e);
    }
  }, [setSnapshot]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await cartApiV3.getDetail();
        if (cancelled) return;
        if (snap) setSnapshot(snap);
      } catch (e) {
        if (!cancelled) console.error('[cart/detail] mount', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setSnapshot]);

  const [errorMessage] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<accountInfoType | null>(null);
  const [isConfirmModal, setisConfirmModal] = useState<boolean>(false);
  const [isSendMoneyModal, setIsSendMoneyModal] = useState<boolean>(false);
  /** 입금 모달 안에서만 사용 (주문하기 직후 모달 먼저 띄우고 로딩) */
  const [paymentModalLoading, setPaymentModalLoading] = useState(false);
  const [paymentModalError, setPaymentModalError] = useState<string | null>(
    null,
  );
  const [isCouponModal, setIsCouponModal] = useState<boolean>(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(
    null,
  );

  /** payment-info 중복 호출 방지(더블탭 등). 닫기 시 generation 올려서 늦게 도착한 응답 무시 */
  const paymentInfoRequestId = useRef(0);
  const paymentInfoInFlight = useRef(false);

  const menusFromSnapshot = useMemo(
    () =>
      (snapshot?.items ?? [])
        .filter((i) => i.type === 'menu' || i.type === 'fee')
        .map(cartItemToMenu),
    [snapshot?.items],
  );
  const setMenusFromSnapshot = useMemo(
    () =>
      (snapshot?.items ?? [])
        .filter((i) => i.type === 'setmenu')
        .map(cartItemToMenu),
    [snapshot?.items],
  );

  const totalPrice = snapshot?.summary?.total ?? 0;
  const originalPrice = snapshot?.summary?.subtotal ?? 0;
  const appliedCoupon = snapshot?.coupon?.applied ?? false;
  const couponName = snapshot?.coupon?.coupon_code ?? undefined;
  const discountAmount = snapshot?.coupon?.discount_amount ?? 0;
  const discountType = snapshot?.coupon?.discount_type ?? 'percent';
  const cartStatus = String(snapshot?.cart?.status ?? '').toLowerCase();
  const isOrderable = cartStatus === 'active';

  const shoppingItemResponse = useMemo(() => {
    if (!snapshot) return undefined;
    return {
      data: {
        cart: {
          menus: menusFromSnapshot,
          set_menus: setMenusFromSnapshot,
          booth_id: snapshot.table_usage.booth_id,
          id: snapshot.cart.id,
          table_num: snapshot.table_usage.table_num,
        },
        subtotal: snapshot.summary.subtotal,
        table_fee: 0,
        total_price: snapshot.summary.total,
      },
    };
  }, [snapshot, menusFromSnapshot, setMenusFromSnapshot]);

  const FetchShoppingItems = () => {
    void refreshCartFromDetail();
  };

  const increaseQuantity = async (id: number) => {
    const item = snapshot?.items?.find((i) => i.id === id);
    if (!item || item.quantity < 1) return;
    try {
      await cartApiV3.updateQuantity(id, item.quantity + 1);
      await refreshCartFromDetail();
    } catch (err) {
      console.error(err);
    }
  };

  const decreaseQuantity = async (id: number) => {
    const item = snapshot?.items?.find((i) => i.id === id);
    if (!item || item.quantity <= 1) return;
    try {
      await cartApiV3.updateQuantity(id, item.quantity - 1);
      await refreshCartFromDetail();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (id: number) => {
    try {
      await cartApiV3.deleteItem(id);
      await refreshCartFromDetail();
    } catch (err) {
      console.error(err);
    }
  };

  const CheckAccount = async () => {
    if (!isOrderable) return;
    if (paymentInfoInFlight.current) return;
    paymentInfoInFlight.current = true;
    const reqId = ++paymentInfoRequestId.current;

    setIsSendMoneyModal(true);
    setPaymentModalLoading(true);
    setPaymentModalError(null);
    setAccountInfo(null);
    try {
      const response = await cartApiV3.getPaymentInfo();
      if (reqId !== paymentInfoRequestId.current) return;
      const info = parsePaymentInfoResponse(response);
      if (info) {
        setAccountInfo(info);
        return;
      }
      setPaymentModalError(
        '계좌 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
      );
    } catch (err: unknown) {
      if (reqId !== paymentInfoRequestId.current) return;
      const msg =
        (err as { response?: { data?: { message?: string }; status?: number } })
          ?.response?.data?.message ||
        (err as Error)?.message ||
        '알 수 없는 오류가 발생했습니다.';
      setPaymentModalError(msg);
    } finally {
      paymentInfoInFlight.current = false;
      if (reqId === paymentInfoRequestId.current) {
        setPaymentModalLoading(false);
      }
    }
  };

  const CloseModal = () => setisConfirmModal(false);
  const CloseAcoountModal = () => {
    paymentInfoRequestId.current += 1;
    paymentInfoInFlight.current = false;
    setIsSendMoneyModal(false);
    setPaymentModalLoading(false);
    setPaymentModalError(null);
    setAccountInfo(null);
  };

  const Pay = (price: number, code?: string) => {
    const cartId = snapshot?.cart?.id;
    const params = new URLSearchParams();
    if (code?.trim()) params.set('code', code.trim());
    params.set('price', String(price));
    if (cartId != null) params.set('cart_id', String(cartId));
    paymentInfoRequestId.current += 1;
    paymentInfoInFlight.current = false;
    setIsSendMoneyModal(false);
    setPaymentModalLoading(false);
    setPaymentModalError(null);
    setAccountInfo(null);
    navigate(`${ROUTE_CONSTANTS.STAFFCODE}?${params.toString()}`);
  };

  const CheckCoupon = async (code: string) => {
    if (!code?.trim()) throw new Error('쿠폰 번호를 입력해주세요.');
    try {
      const res = await cartApiV3.applyCoupon(code);
      setAppliedCouponCode(code.trim());
      return res;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      throw new Error(msg || '해당 번호의 쿠폰이 존재하지 않아요!');
    }
  };

  /** 송금 확인 요청 — 직원 호출용 API (모달 2단계에서 호출) */
  const requestPaymentConfirmation = useCallback(async () => {
    const tableId = snapshot?.table_usage?.table_id;
    const cartId = snapshot?.cart?.id;
    if (tableId == null || cartId == null) {
      throw new Error('테이블 또는 장바구니 정보가 없습니다.');
    }

    return await cartApiV3.requestPaymentConfirmation({
      tableId,
      cartId,
      category: 'GENERAL',
    });
  }, [snapshot?.table_usage?.table_id, snapshot?.cart?.id]);

  return {
    shoppingItemResponse,
    isConfirmModal,
    isSendMoneyModal,
    setIsSendMoneyModal,
    totalPrice,
    originalPrice,
    discountAmount,
    appliedCoupon,
    discountType,
    couponName,
    CloseModal,
    CloseAcoountModal,
    Pay,
    errorMessage,
    CheckAccount,
    requestPaymentConfirmation,
    accountInfo,
    paymentModalLoading,
    paymentModalError,
    FetchShoppingItems,
    increaseQuantity,
    decreaseQuantity,
    deleteItem,
    setIsCouponModal,
    isCouponModal,
    CheckCoupon,
    setAppliedCoupon: () => {
      setAppliedCouponCode(null);
      cartApiV3.cancelCoupon().catch(console.error);
    },
    appliedCouponCode,
    cartStatus,
    isOrderable,
  };
};

export default useShoppingCartPage;

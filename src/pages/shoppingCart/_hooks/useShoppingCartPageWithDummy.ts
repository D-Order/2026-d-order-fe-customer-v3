import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_CONSTANTS } from "@constants/RouteConstants";
import { Menu, ShoppingItemResponseType } from "../types/types";
import { ShoppingCartPageService } from "../_Dummy/ShoppingCartPageService";

/**
 * 장바구니 페이지 - 더미 데이터 전용 훅.
 * 실제 API 연결 시 useShoppingCartPage 로 import 변경하면 됨.
 */
const useShoppingCartPageWithDummy = () => {
  const [shoppingItemResponse, setShoppingItemResponse] = useState<
    ShoppingItemResponseType | undefined
  >();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<ReturnType<
    typeof ShoppingCartPageService.getDummyAccountInfo
  > | null>(null);
  const navigate = useNavigate();
  const [isConfirmModal, setisConfirmModal] = useState<boolean>(false);
  const [isSendMoneyModal, setIsSendMoneyModal] = useState<boolean>(false);
  const [isCouponModal, setIsCouponModal] = useState<boolean>(false);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<string>("fixed");
  const [appliedCoupon, setAppliedCoupon] = useState<boolean>(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(
    null
  );

  const calculateTotalPrice = (menus?: Menu[], setMenus?: Menu[]) => {
    const menusTotal = (Array.isArray(menus) ? menus : []).reduce(
      (total, item) => total + item.menu_price * item.quantity,
      0
    );
    const setMenusTotal = (Array.isArray(setMenus) ? setMenus : []).reduce(
      (total, item) => total + item.discounted_price * item.quantity,
      0
    );
    return menusTotal + setMenusTotal;
  };

  const getItemContext = (
    id: number
  ): { type: "menu" | "set_menu"; currentItem: Menu | undefined } => {
    const currentMenu = shoppingItemResponse?.data?.cart?.menus?.find(
      (item) => item.id === id
    );
    const currentSet = shoppingItemResponse?.data?.cart?.set_menus?.find(
      (item: Menu) => item.id === id
    );
    if (currentSet) return { type: "set_menu", currentItem: currentSet };
    return { type: "menu", currentItem: currentMenu };
  };

  const FetchShoppingItems = () => {
    const data = ShoppingCartPageService.fetchCart();
    setShoppingItemResponse(data);
  };

  const increaseQuantity = (id: number) => {
    if (!shoppingItemResponse?.data?.cart) return;
    const { type, currentItem } = getItemContext(id);
    if (!currentItem) return;
    if (currentItem.menu_name === "테이블 이용료(테이블당)") return;

    const newQuantity = currentItem.quantity + 1;
    setShoppingItemResponse((prev) => {
      if (!prev) return prev;
      const updatedMenus = (prev.data.cart.menus || []).map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      const updatedSets = (prev.data.cart.set_menus || []).map((item: Menu) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      return {
        ...prev,
        data: {
          ...prev.data,
          cart: {
            ...prev.data.cart,
            menus: type === "menu" ? updatedMenus : prev.data.cart.menus,
            set_menus:
              type === "set_menu" ? updatedSets : prev.data.cart.set_menus,
          },
        },
      };
    });
  };

  const decreaseQuantity = (id: number) => {
    if (!shoppingItemResponse?.data?.cart) return;
    const { type, currentItem } = getItemContext(id);
    if (!currentItem || currentItem.quantity <= 1) return;

    const newQuantity = currentItem.quantity - 1;
    setShoppingItemResponse((prev) => {
      if (!prev) return prev;
      const updatedMenus = (prev.data.cart.menus || []).map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      const updatedSets = (prev.data.cart.set_menus || []).map((item: Menu) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      return {
        ...prev,
        data: {
          ...prev.data,
          cart: {
            ...prev.data.cart,
            menus: type === "menu" ? updatedMenus : prev.data.cart.menus,
            set_menus:
              type === "set_menu" ? updatedSets : prev.data.cart.set_menus,
          },
        },
      };
    });
  };

  const deleteItem = (id: number) => {
    const { type } = getItemContext(id);
    setShoppingItemResponse((prev) => {
      if (!prev) return prev;
      const updatedMenus = (prev.data.cart.menus || []).filter(
        (item) => item.id !== id
      );
      const updatedSets = (prev.data.cart.set_menus || []).filter(
        (item: Menu) => item.id !== id
      );
      return {
        ...prev,
        data: {
          ...prev.data,
          cart: {
            ...prev.data.cart,
            menus: type === "menu" ? updatedMenus : prev.data.cart.menus,
            set_menus:
              type === "set_menu" ? updatedSets : prev.data.cart.set_menus,
          },
        },
      };
    });
  };

  const CheckAccount = () => {
    setAccountInfo(ShoppingCartPageService.getDummyAccountInfo());
  };

  const CloseModal = () => setisConfirmModal(false);
  const CloseAcoountModal = () => setIsSendMoneyModal(false);

  const Pay = (price: number, code?: string) => {
    setIsSendMoneyModal(false);
    navigate(
      `${ROUTE_CONSTANTS.STAFFCODE}?code=${code ?? ""}&price=${price}`
    );
  };

  const CheckCoupon = async (code: string) => {
    if (!code?.trim()) throw new Error("쿠폰 번호를 입력해주세요.");
    // 더미: 잘못된 쿠폰 입력 시 에러 (토스트 확인용)
    const invalidCodes = ["안되는쿠폰", "안되는쿠폰 ", "invalid", "잘못된쿠폰"];
    if (invalidCodes.some((c) => code.trim().toLowerCase() === c.trim().toLowerCase())) {
      throw new Error("해당 번호의 쿠폰이 존재하지 않아요!");
    }
    setDiscountAmount(5000);
    setDiscountType("fixed");
    setAppliedCoupon(true);
    setAppliedCouponCode(code);
    return { data: { discount_value: 5000, discount_type: "fixed", coupon_name: "더미 쿠폰" } };
  };

  useEffect(() => {
    if (!shoppingItemResponse) return;
    const cart = shoppingItemResponse.data?.cart;
    const base = calculateTotalPrice(cart?.menus, cart?.set_menus);
    setOriginalPrice(base);
  }, [shoppingItemResponse]);

  useEffect(() => {
    if (!appliedCoupon) {
      setTotalPrice(originalPrice);
      return;
    }
    if (discountType === "percent") {
      setTotalPrice(
        Math.max(0, Math.floor(originalPrice * (1 - discountAmount / 100)))
      );
    } else {
      setTotalPrice(Math.max(0, originalPrice - discountAmount));
    }
  }, [originalPrice, appliedCoupon, discountType, discountAmount]);

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
    couponName: "더미 쿠폰",
    CloseModal,
    CloseAcoountModal,
    CheckAccount,
    accountInfo,
    FetchShoppingItems,
    increaseQuantity,
    decreaseQuantity,
    deleteItem,
    setIsCouponModal,
    isCouponModal,
    CheckCoupon,
    setAppliedCoupon,
    appliedCouponCode,
    errorMessage,
    Pay,
  };
};

export default useShoppingCartPageWithDummy;

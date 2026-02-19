import { ShoppingItemResponseType } from "../types/types";

/**
 * 장바구니 페이지 더미 데이터.
 * 실제 API 연결 시 useShoppingCartPage 로 전환하면 됨.
 */
export const ShoppingCartPageService = {
  fetchCart: (): ShoppingItemResponseType => {
    return {
      data: {
        cart: {
          booth_id: 1,
          id: 1,
          table_num: 1,
          menus: [
            {
              id: 10,
              is_soldout: false,
              menu_amount: 10,
              menu_image: "/images/pizza1.png",
              menu_name: "마르게리타 피자",
              menu_price: 18000,
              min_menu_amount: 1,
              discounted_price: 18000,
              original_price: 18000,
              quantity: 2,
            },
            {
              id: 20,
              is_soldout: false,
              menu_amount: 10,
              menu_image: "/images/coke.png",
              menu_name: "콜라 500ml",
              menu_price: 3000,
              min_menu_amount: 1,
              discounted_price: 3000,
              original_price: 3000,
              quantity: 1,
            },
          ],
          set_menus: [
            {
              id: 100,
              is_soldout: false,
              menu_amount: 5,
              menu_image: "/images/dinner.png",
              menu_name: "디너 세트",
              menu_price: 47000,
              min_menu_amount: 1,
              discounted_price: 47000,
              original_price: 50000,
              quantity: 1,
            },
          ],
        },
        subtotal: 71000,
        table_fee: 0,
        total_price: 71000,
      },
    };
  },

  getDummyAccountInfo: () => ({
    account_holder: "더미주",
    bank_name: "더미은행",
    account_number: "123-456-789012",
  }),
};

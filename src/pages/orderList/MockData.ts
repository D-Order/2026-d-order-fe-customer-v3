// src/pages/orderList/MockData.ts
import ACCO from "@assets/images/character.svg";

export const MOCK_ORDER_DATA = {
    status: "success",
    data: {
        order_amount: 42000,
        orders: [
        {
            id: 1,
            name: "치즈 듬뿍 떡볶이",
            price: 15000,
            quantity: 1,
            image: ACCO, // SVG 컴포넌트나 URL 모두 가능
        },
        {
            id: 2,
            name: "바삭바삭 모듬 튀김",
            price: 8000,
            quantity: 2,
            image: ACCO, // 테스트용 이미지 URL
        },
        {
            id: 3,
            name: "시원한 콜라",
            price: 2000,
            quantity: 3,
            image: null, // null일 경우 기본 이미지 처리 테스트
        },
        ],
    },
};
// 기존 코드 주석 ~~
// // src/pages/orderList/OrderListPage.tsx
// import * as S from "./OrderListPage.styled";
// import { useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import OrderListHeader from "./_components/OrderListHeader";
// import OrderListItems from "./_components/OrderListItems";
// import ACCO from "@assets/images/character.svg";
// import { ROUTE_CONSTANTS } from "@constants/RouteConstants";
// import { useOrderList } from "./hooks/useOrderList";
// import EmptyOrder from "./_components/EmptyOrder";
// import Loading from "@components/loading/Loading";
// import { normalizeOrder, type NormalizedOrderItem } from "./apis/getOrderList";

// interface OrderItem {
//   id: number;
//   name: string;
//   price: number;
//   image: string | React.ComponentType<React.SVGProps<SVGSVGElement>>;
//   quantity: number;
// }

// const OrderListPage = () => {
//   const tableNum = Number(localStorage.getItem("tableNum") || 0);
//   const boothId = Number(localStorage.getItem("boothId") || 0);

//   const { orderData, loading, error } = useOrderList(tableNum, boothId);
//   const [orderList, setOrderList] = useState<OrderItem[] | null>(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (orderData?.status === "success" && orderData.data) {
//       const normalized: NormalizedOrderItem[] =
//         (orderData.data.orders ?? []).map(normalizeOrder);

//       const mapped: OrderItem[] = normalized.map((n) => ({
//         id: n.id,
//         name: n.name,
//         price: n.price,
//         image: n.image ?? ACCO,
//         quantity: n.quantity,
//       }));

//       setOrderList(mapped);
//     } else {
//       setOrderList(null);
//     }
//   }, [orderData]);

//   if (loading) return <Loading />;

//   const shouldShowEmpty =
//     !!error ||
//     !orderData ||
//     orderData.status !== "success" ||
//     !orderData.data ||
//     (orderData.data.orders?.length ?? 0) === 0;

//   const totalPrice = orderData?.data?.order_amount ?? 0;

//   return (
//     <>
//     <S.Wrapper>
//       <S.HeaderWrapper>
//         <OrderListHeader
//           text="주문내역"
//           goBack={() => navigate(ROUTE_CONSTANTS.MENULIST)}
//           totalPrice={totalPrice}
//         />
//       </S.HeaderWrapper>

//       <S.PageWrapper>
//         <S.OrderListWrapper>
//           {shouldShowEmpty ? (
//             <EmptyOrder />
//           ) : (
//             orderList?.map((item) => (
//               <OrderListItems
//                 key={item.id}
//                 name={item.name}
//                 price={item.price}
//                 quantity={item.quantity}
//                 image={item.image}
//               />
//             ))
//           )}
//         </S.OrderListWrapper>
//       </S.PageWrapper>
//     </S.Wrapper>
      
//     </>
//   );
// };

// export default OrderListPage;

// 목업 데이터 연결~~
// src/pages/orderList/OrderListPage.tsx
import * as S from "./OrderListPage.styled";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import OrderListHeader from "./_components/OrderListHeader";
import OrderListItems from "./_components/OrderListItems";
import ACCO from "@assets/images/character.svg";
import { ROUTE_CONSTANTS } from "@constants/RouteConstants";
import { useOrderList } from "./hooks/useOrderList";
import EmptyOrder from "./_components/EmptyOrder";
import Loading from "@components/loading/Loading";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  image: string | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  quantity: number;
}

const OrderListPage = () => {
  const navigate = useNavigate();
  // 로컬스토리지 값은 유지 (UI 로직상 필요할 수 있음)
  const tableNum = Number(localStorage.getItem("tableNum") || 0);
  const boothId = Number(localStorage.getItem("boothId") || 0);

  const { orderData, loading, error } = useOrderList(tableNum, boothId);
  const [orderList, setOrderList] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (orderData?.status === "success" && orderData.data) {
      const mapped: OrderItem[] = orderData.data.orders.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image ?? ACCO, // 이미지 없으면 기본 캐릭터
        quantity: item.quantity,
      }));
      setOrderList(mapped);
    }
  }, [orderData]);

  if (loading) return <Loading />;

  // 데이터가 없거나 에러가 있는 경우
  const isListEmpty = !orderList || orderList.length === 0 || !!error;
  const totalPrice = orderData?.data?.order_amount ?? 0;

  return (
    <S.Wrapper>
      <S.HeaderWrapper>
        <OrderListHeader
          text="주문내역"
          goBack={() => navigate(ROUTE_CONSTANTS.MENULIST)}
          totalPrice={totalPrice}
        />
      </S.HeaderWrapper>

      <S.PageWrapper>
        <S.OrderListWrapper>
          {isListEmpty ? (
            <EmptyOrder />
          ) : (
            orderList.map((item) => (
              <OrderListItems
                key={item.id}
                name={item.name}
                price={item.price}
                quantity={item.quantity}
                image={item.image}
              />
            ))
          )}
        </S.OrderListWrapper>
      </S.PageWrapper>
    </S.Wrapper>
  );
};

export default OrderListPage;
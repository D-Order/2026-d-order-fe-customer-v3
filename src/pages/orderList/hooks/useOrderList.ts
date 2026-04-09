// 기존 코드 주석~~
// import { useEffect, useState } from "react";
// import { getOrderList, OrderListResponse } from "../apis/getOrderList";

// export const useOrderList = (tableNum: number, boothId: number) => {
//   const [orderData, setOrderData] = useState<OrderListResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let mounted = true;

//     const fetchOrders = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const data = await getOrderList(tableNum, boothId);
//         if (!mounted) return;

//         if (data.status === "success") {
//           setOrderData(data);
//         } else {
//           // 서버가 에러 포맷으로 응답하는 경우
//           setOrderData(null);
//           setError(data.message || `요청 실패 (code: ${data.code})`);
//         }
//       } catch (err: any) {
//         if (!mounted) return;
//         // 네트워크/예외 에러 처리
//         const msg =
//           err?.response?.data?.message ||
//           err?.message ||
//           "알 수 없는 오류가 발생했습니다.";
//         setError(msg);
//         setOrderData(null);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };

//     if (tableNum && boothId) {
//       fetchOrders();
//     } else {
//       setLoading(false);
//       setOrderData(null);
//       setError("유효한 tableNum/boothId가 필요합니다.");
//     }

//     return () => {
//       mounted = false;
//     };
//   }, [tableNum, boothId]);

//   return { orderData, loading, error };
// };

import { useEffect, useState } from "react";
import { getOrderList, type OrderListUiResponse } from "../apis/getOrderList";

export const useOrderList = (tableUsageId: number) => {
  const [orderData, setOrderData] = useState<OrderListUiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getOrderList(tableUsageId);
        if (!mounted) return;

        if (data.status === "success") {
          setOrderData(data);
        } else {
          setOrderData(null);
          setError(data.message || `요청 실패 (code: ${data.code})`);
        }
      } catch (err: any) {
        if (!mounted) return;
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "알 수 없는 오류가 발생했습니다.";
        setError(msg);
        setOrderData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (tableUsageId) {
      fetchOrders();
    } else {
      setLoading(false);
      setOrderData(null);
      setError("유효한 table_usage_id가 필요합니다.");
    }

    return () => {
      mounted = false;
    };
  }, [tableUsageId]);

  return { orderData, loading, error };
};
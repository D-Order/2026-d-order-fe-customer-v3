import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTE_CONSTANTS } from '@constants/RouteConstants';
import { MENULISTPAGE_CONSTANTS } from '../_constants/menulistpageconstants';
// import { useShoppingCartStore } from '@stores/shoppingCartStore';
// import { MenuListPageService } from '../_Dummy/MenuListPageService';
import { MenuListService } from '../_services/MenuListService';
import { cartApiV3 } from '@pages/shoppingCart/_api/cartApiV3';
import { useCartSnapshotStore } from '@stores/cartSnapshotStore';
import { sortByPriceDesc } from '../_utils/sortByPrice';

const SCROLL_OFFSET = 120;

type MenuCategory = 'tableFee' | 'set' | 'menu' | 'drink';
interface BaseMenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  soldOut: boolean;
  category: MenuCategory;
}

interface SetMenuItem extends BaseMenuItem {
  category: 'set';
  menuItems: {
    menu_id: number;
    quantity: number;
  }[];
}

// type MenuItem = BaseMenuItem | SetMenuItem;

const useMenuListPage = () => {
  const navigate = useNavigate();
  const itemCount = useCartSnapshotStore((s) => s.itemCount);
  const snapshot = useCartSnapshotStore((s) => s.snapshot);
  const cartCount = itemCount > 0;
  const isCartPending =
    String(snapshot?.cart?.status ?? '').toLowerCase() === 'pending_payment';

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [boothName, setBoothName] = useState<string>('');

  const tableFeeRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const drinkRef = useRef<HTMLDivElement>(null);

  const sectionRefs = {
    tableFee: tableFeeRef,
    set: setRef,
    menu: menuRef,
    drink: drinkRef,
  };

  const [selectedCategory, setSelectedCategory] = useState<
    'tableFee' | 'set' | 'menu' | 'drink'
  >('tableFee');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [tableNum, setTableNum] = useState<number | null>(null);

  const [count, setCount] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [pendingToast, setPendingToast] = useState(false);

  const resetCount = () => setCount(1);
  const isMin = count <= 1;
  // 최대 수량: 기본 99, 단 PT(테이블당) 테이블 이용료는 1개
  const isMax = selectedItem ? count > selectedItem.quantity : false;
  const isMax2 = selectedItem ? count >= selectedItem.quantity : false;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const boothId = localStorage.getItem('boothId');
        if (!boothId || !/^\d+$/.test(boothId)) {
          setIsLoading(false);
          // navigate(ROUTE_CONSTANTS.LOGIN);
          return;
        }

        const tableId = localStorage.getItem('tableNum');
        const boothIdNumber = parseInt(boothId, 10);
        const tableNumber = tableId ? parseInt(tableId, 10) : null;

        if (Number.isNaN(boothIdNumber)) throw new Error('Invalid boothId');

        // API 호출 (data.FEE / SET / MENU / DRINK 구조)
        const payload = await MenuListService.fetchAllMenus(boothIdNumber);

        const { data, booth_name, table_info } = payload;
        const seat_type =
          snapshot?.fee_policy?.seat_type ??
          (table_info as unknown as { seat_type?: string } | undefined)
            ?.seat_type;
        const NON_IMG = MENULISTPAGE_CONSTANTS.MENUITEMS.IMAGES.NONIMAGE;

        setTableNum(table_info?.table_number ?? tableNumber);
        setBoothName(booth_name ?? '');

        // 1) 테이블 이용료 (data.FEE)
        const feeItem = data?.FEE?.[0];
        let seatItem: BaseMenuItem | null = null;
        if (feeItem) {
          seatItem = {
            id: feeItem.id,
            name: feeItem.name,
            description: feeItem.description,
            price: feeItem.price,
            imageUrl: feeItem.image ?? NON_IMG,
            // 최대수량: 기본 99, 단 PT(테이블당) 테이블 이용료는 1개
            quantity:
              String(seat_type ?? '').toUpperCase() === 'PT' ||
              seat_type === 'table'
                ? 1
                : 99,
            soldOut: feeItem.is_soldout,
            category: 'tableFee',
          };
        }

        // 2) 세트 (data.SET)
        const mappedSets: SetMenuItem[] = sortByPriceDesc(
          data?.SET ?? [],
          (s) => s.price,
        ).map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          originprice: s.origin_price,
          price: s.price,
          imageUrl: s.image ?? undefined,
          quantity: 99,
          soldOut: !!s.is_soldout,
          category: 'set',
          menuItems: s.menu_items ?? [],
        }));

        // 3) 메뉴 (data.MENU)
        const mappedMenus: BaseMenuItem[] = sortByPriceDesc(
          data?.MENU ?? [],
          (m) => m.price,
        ).map((m) => ({
          id: m.id,
          name: m.name,
          description: m.description,
          price: m.price,
          imageUrl: m.image ?? undefined,
          quantity: 99,
          soldOut: !!m.is_soldout,
          category: 'menu' as const,
        }));

        // 4) 음료 (data.DRINK)
        const mappedDrinks: BaseMenuItem[] = sortByPriceDesc(
          data?.DRINK ?? [],
          (m) => m.price,
        ).map((m) => ({
          id: m.id,
          name: m.name,
          description: m.description,
          price: m.price,
          imageUrl: m.image ?? undefined,
          quantity: 99,
          soldOut: !!m.is_soldout,
          category: 'drink' as const,
        }));

        const allItems = [
          ...(seatItem ? [seatItem] : []),
          ...mappedSets,
          ...mappedMenus,
          ...mappedDrinks,
        ];

        const allItemsSorted = sortByPriceDesc(allItems, (i) => i.price);
        setMenuItems(allItemsSorted);

        const tu = localStorage.getItem('tableUsageId');
        if (tu && /^\d+$/.test(tu)) {
          try {
            const snap = await cartApiV3.getDetail();
            if (snap) useCartSnapshotStore.getState().setSnapshot(snap);
          } catch {
            /* 장바구니 없음·미생성 등 */
          }
        }
      } catch (e) {
        console.error(e);
        setMenuItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDecrease = () => {
    if (!isMin) setCount((prev) => prev - 1);
  };

  const handleIncrease = () => {
    if (isMax2) {
      setShowToast(true);
      return;
    }
    setCount((prev) => prev + 1);
  };

  useEffect(() => {
    if (showToast) {
      const timeout = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [showToast]);

  useEffect(() => {
    if (pendingToast) {
      const timeout = setTimeout(() => setPendingToast(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [pendingToast]);

  const handleScrollTo = (category: 'tableFee' | 'set' | 'menu' | 'drink') => {
    setSelectedCategory(category);
    const target = sectionRefs[category].current;
    if (target) {
      const top = target.offsetTop - SCROLL_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      let activeCategory: 'tableFee' | 'set' | 'menu' | 'drink' | null = null;
      let maxTop = -Infinity;

      const scrollTop = window.scrollY;
      const scrollBottom = scrollTop + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;

      if (pageHeight - scrollBottom < 10) {
        setSelectedCategory('drink');
        return;
      }

      Object.entries(sectionRefs).forEach(([key, ref]) => {
        if (ref.current) {
          const rectTop = ref.current.getBoundingClientRect().top;
          if (rectTop <= SCROLL_OFFSET && rectTop > maxTop) {
            maxTop = rectTop;
            activeCategory = key as 'tableFee' | 'set' | 'menu' | 'drink';
          }
        }
      });

      if (activeCategory && activeCategory !== selectedCategory) {
        setSelectedCategory(activeCategory);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedCategory]);

  const handleOpenModal = (item: any) => {
    if (item.category === 'tableFee' && item.soldOut) return;
    if (item.category === 'tableFee' && Number(item?.price ?? 0) === 0) return;
    setSelectedItem(item);
    resetCount();
    setIsModalOpen(true);
  };

  const [errorToast, setErrorToast] = useState<string | null>(null);

  const handleSubmitItem = async () => {
    if (!selectedItem) return;
    if (!tableNum) {
      setErrorToast('테이블 번호를 확인할 수 없어요.');
      return;
    }
    if (count <= 0) return;
    if (isCartPending) {
      setPendingToast(true);
      return;
    }

    try {
      await cartApiV3.add({
        type:
          selectedItem.category === 'set'
            ? 'setmenu'
            : selectedItem.category === 'tableFee'
              ? 'fee'
              : 'menu',
        ...(selectedItem.category === 'set'
          ? { set_menu_id: selectedItem.id }
          : { menu_id: selectedItem.id }),
        quantity: count,
      });

      try {
        const snap = await cartApiV3.getDetail();
        if (snap) useCartSnapshotStore.getState().setSnapshot(snap);
      } catch {
        /* WS로도 갱신될 수 있음 */
      }

      // 기존 UX 흐름 유지
      setIsClosing(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedItem(null);
        setIsClosing(false);
        setIsModalOpen2(true);
      }, 300);
    } catch (e: any) {
      console.error(e);
      setErrorToast(
        e?.response?.data?.message ||
          '장바구니 담기 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.',
      );
    } finally {
    }
  };

  const handleFirstModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleSecondModal = () => {
    setIsModalOpen2(false);
  };

  return {
    isLoading,
    menuItems,
    boothName,
    tableNum,
    cartCount,
    sectionRefs,
    selectedCategory,
    handleScrollTo,
    handleOpenModal,
    selectedItem,
    isModalOpen,
    isModalOpen2,
    isClosing,
    handleSubmitItem,
    handleFirstModal,
    handleSecondModal,
    handleNavigate: () => navigate(ROUTE_CONSTANTS.SHOPPINGCART),
    handleReceipt: () => navigate(ROUTE_CONSTANTS.ORDERLIST),
    count,
    isMin,
    isMax,
    showToast,
    handleDecrease,
    handleIncrease,
    errorToast,
    pendingToast,
    isCartPending,
  };
};

export default useMenuListPage;

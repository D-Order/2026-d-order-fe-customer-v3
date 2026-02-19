import * as S from './ShoppingCartPage.styled';
import { useNavigate } from 'react-router-dom';
import { ROUTE_CONSTANTS } from '@constants/RouteConstants';
import { IMAGE_CONSTANTS } from '@constants/ImageConstants';
import { toast } from 'react-toastify';
import ShoppingHeader from './_components/ShoppingHeader';
import Character from '@assets/images/character.svg';
import ShoppingItem from './_components/ShoppingItem';
import ShoppingFooter from './_components/ShoppingFooter';
import ConfirmModal from './_modal/ConfitmMotal';
import SendMoneyModal from './_modal/sendMoneyModal';
import { useEffect, useState } from 'react';
import { Menu } from './types/types';
import CouponModal from './_modal/CouponModal';
// 더미 사용 중. 실제 API 연결 시 useShoppingCartPage 로 변경
import useShoppingCartPage from './_hooks/useShoppingCartPageWithDummy';

const ShoppingCartPage = () => {
  const navigate = useNavigate();
  const [menus, setMenu] = useState<Menu[]>([]);
  const [setMenus, setSetMenu] = useState<Menu[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [usingCoupon, setUsingCoupon] = useState('');
  const [couponName, setCouponName] = useState('');
  const [couponType, setCouponType] = useState('');
  const {
    shoppingItemResponse,
    isConfirmModal,
    isSendMoneyModal,
    totalPrice,
    originalPrice,
    appliedCoupon,
    CloseModal,
    CloseAcoountModal,
    CheckAccount,
    setIsSendMoneyModal,
    Pay,
    errorMessage,
    accountInfo,
    FetchShoppingItems,
    increaseQuantity,
    decreaseQuantity,
    deleteItem,
    setIsCouponModal,
    isCouponModal,
    CheckCoupon,
    setAppliedCoupon,
  } = useShoppingCartPage();

  // 계좌 복사 버튼
  const CopyAccount = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('계좌번호가 복사되었어요!', {
        icon: <img src={IMAGE_CONSTANTS.CHECK} />,
        closeButton: false,
        style: {
          backgroundColor: '#FF6E3F',
          color: '#FAFAFA',
          fontSize: '1rem',
          fontWeight: '800',
          borderRadius: '8px',
          padding: '0.75rem 0.875rem',
          boxSizing: 'border-box',
        },
      });
    } catch {
      alert('다시 시도해주세요');
    }
  };

  useEffect(() => {
    FetchShoppingItems();
  }, []);

  useEffect(() => {
    if (shoppingItemResponse) {
      setMenu(shoppingItemResponse.data.cart.menus || []);
      setSetMenu(shoppingItemResponse.data.cart.set_menus || []);
    }
  }, [shoppingItemResponse]);
  return (
    <S.Wrapper>
      <ShoppingHeader
        text="장바구니"
        goBack={() => {
          navigate(ROUTE_CONSTANTS.MENULIST);
        }}
      />

      {menus.length === 0 && setMenus.length === 0 ? (
        <S.ShoppingListEmpty>
          <img src={Character} alt="이미지" />
          <p>아직 장바구니에 담긴 메뉴가 없어요.</p>
        </S.ShoppingListEmpty>
      ) : (
        <>
          <S.ShoppingListWrapper>
            {menus.map((item) => (
              <ShoppingItem
                key={item.id}
                item={item}
                onIncrease={() => increaseQuantity(item.id)}
                onDecrease={() => decreaseQuantity(item.id)}
                deleteItem={() => deleteItem(item.id)}
              />
            ))}
            {setMenus.map((item) => (
              <ShoppingItem
                key={item.id}
                item={item}
                onIncrease={() => increaseQuantity(item.id)}
                onDecrease={() => decreaseQuantity(item.id)}
                deleteItem={() => deleteItem(item.id)}
              />
            ))}
          </S.ShoppingListWrapper>
          <ShoppingFooter
            totalPrice={totalPrice}
            originalPrice={originalPrice}
            appliedCoupon={appliedCoupon}
            CheckShoppingItems={() => {
              CheckAccount();
              setIsSendMoneyModal(true);
            }}
            setIsCouponModal={setIsCouponModal}
          />
        </>
      )}

      {isConfirmModal && (
        <S.DarkWrapper>
          <ConfirmModal
            text={errorMessage || ''}
            confirm={CloseModal}
          ></ConfirmModal>
        </S.DarkWrapper>
      )}
      {isSendMoneyModal && accountInfo && (
        <S.DarkWrapper>
          <SendMoneyModal
            canclePay={CloseAcoountModal}
            pay={Pay}
            copyAccount={(text: string) => CopyAccount(text)}
            totalPrice={totalPrice}
            accountInfo={accountInfo}
            usingCoupon={usingCoupon}
            onAfterStaffRequest={() => navigate(ROUTE_CONSTANTS.ORDERCOMPLETE)}
          />
        </S.DarkWrapper>
      )}
      {isCouponModal && (
        <S.DarkWrapper>
          <CouponModal
            onClose={() => setIsCouponModal(false)}
            CheckCoupon={CheckCoupon}
            appliedCoupon={appliedCoupon}
            setAppliedCoupon={setAppliedCoupon}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            couponName={couponName}
            setCouponName={setCouponName}
            setUsingCoupon={setUsingCoupon}
            setCouponType={setCouponType}
            couponType={couponType}
          />
        </S.DarkWrapper>
      )}
    </S.Wrapper>
  );
};

export default ShoppingCartPage;

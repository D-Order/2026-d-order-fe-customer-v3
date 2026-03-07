import * as S from './MenuListPage.styled';
import { useNavigate } from 'react-router-dom';

// 더미 사용 중. 실제 API 연결 시 useMenuListPage 로 변경
// import useMenuListPage from './_hooks/useMenuListPageWithDummy';
import useMenuListPage from './_hooks/useMenuListPage';
import MenuListPageHeader from './_components/MenuListPageHeader/MenuListPageHeader';
import MenuList from './_components/MenuList/MenuList';
import MenuAssignModal from './_components/modals/MenuAssignModal/MenuAssignModal';
import MenuAssignSidModal from './_components/modals/menuAssignSideModal/MenuAssignSideModal';
import MenuListHeader from './_components/Header/MenuListHeader';

import Loading from '@components/loading/Loading';

import { IMAGE_CONSTANTS } from '@constants/ImageConstants';
import { ROUTE_CONSTANTS } from '@constants/RouteConstants';

const MenulistPage = () => {
  const {
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
    handleNavigate,
    handleReceipt,
    count,
    isMin,
    isMax,
    showToast,
    handleIncrease,
    handleDecrease,
  } = useMenuListPage();

  const navigate = useNavigate();

  if (isLoading) return <Loading />;
  return (
    <S.Wrapper>
      <MenuListHeader
        onNavigate={handleNavigate}
        onReceipt={handleReceipt}
        cartCount={cartCount}
      />
      {tableNum !== null && (
        <MenuListPageHeader
          title={boothName}
          tableNumber={tableNum}
          onSelectCategory={handleScrollTo}
          selectedCategory={selectedCategory}
        />
      )}
      <S.Container>
        <MenuList
          items={menuItems}
          sectionRefs={sectionRefs}
          selectedCategory={selectedCategory}
          onOpenModal={handleOpenModal}
        />
      </S.Container>
      {isModalOpen && selectedItem && (
        <MenuAssignModal
          item={selectedItem}
          onClose={handleFirstModal}
          onSubmit={handleSubmitItem}
          isClosing={isClosing}
          count={count}
          isMin={isMin}
          isMax={isMax}
          showToast={showToast}
          onIncrease={handleIncrease}
          onDecrease={handleDecrease}
        />
      )}
      {isModalOpen2 && (
        <MenuAssignSidModal
          onClose={handleSecondModal}
          onNavigate={handleNavigate}
        />
      )}
      <S.DorderDevelopers
        src={IMAGE_CONSTANTS.DORDER_DEVELOPERS}
        alt="Dorder Developers"
        onClick={() => navigate(ROUTE_CONSTANTS.DEVPAGE)}
      />
    </S.Wrapper>
  );
};

export default MenulistPage;

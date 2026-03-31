import * as S from './MenuListHeader.styled';
import * as ToastS from '../modals/MenuAssignModal/MenuAssignModal.styled';
import { useState, useEffect } from 'react';
import { MENULISTPAGE_CONSTANTS } from '../../_constants/menulistpageconstants';
import alram from '../../../../assets/icons/alram.svg';
import CallModal from '../modals/callmodal/CallModal';

interface MenuListHeaderProps {
  onNavigate: () => void;
  onReceipt: () => void;
  cartCount: boolean;
}

const MenuListHeader = ({
  onNavigate,
  onReceipt,
  cartCount,
}: MenuListHeaderProps) => {
  const [ismodalOpen, setIsModalOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!noticeMessage) return;
    const t = setTimeout(() => setNoticeMessage(null), 2000);
    return () => clearTimeout(t);
  }, [noticeMessage]);

  return (
    <S.Wrapper>
      <S.Logo src={MENULISTPAGE_CONSTANTS.HEADER.IMAGE.LOGOPNG} />
      <S.Icons>
        <S.Hochul onClick={() => setIsModalOpen(true)}>
          직원 호출
          <S.Icon src={alram} />
        </S.Hochul>
        <S.Icon
          src={MENULISTPAGE_CONSTANTS.HEADER.IMAGE.RECEIPT}
          onClick={onReceipt}
        />
        <S.IconWrap>
          <S.Icon
            src={MENULISTPAGE_CONSTANTS.HEADER.IMAGE.CART}
            onClick={onNavigate}
          />
          {cartCount && <S.Badge />}
        </S.IconWrap>
      </S.Icons>
      {noticeMessage && (
        <ToastS.Toast style={{ zIndex: 100 }}>
          <ToastS.ToastIcon
            src={MENULISTPAGE_CONSTANTS.ASSIGNMODAL.IMAGES.NOTICE}
            alt=""
          />
          {noticeMessage}
        </ToastS.Toast>
      )}
      {ismodalOpen && (
        <CallModal
          onClose={() => setIsModalOpen(false)}
          onNotify={setNoticeMessage}
        />
      )}
    </S.Wrapper>
  );
};

export default MenuListHeader;

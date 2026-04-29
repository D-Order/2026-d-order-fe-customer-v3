import React, { useMemo, useState } from 'react';
import * as S from './devPage.styled';
import DevCard, { Member } from './components/devCard';
import RoleFilter from './components/roleFilter';
import { useNavigate } from 'react-router-dom';
import { ROUTE_CONSTANTS } from '@constants/RouteConstants';

// 프로필 이미지 정의
import KGW from '@assets/images/KGW.png';
import HCM from '@assets/images/HCM.png';
import JHJ from '@assets/images/JHJ.png';
import KGM from '@assets/images/KGM.png';
import LDG from '@assets/images/LDG.png';
import LSB from '@assets/images/LSB.png';
import OTJ from '@assets/images/OTJ.png';
import PSJ from '@assets/images/PSJ.png';
import PSW from '@assets/images/PSW.png';
import LHW from '@assets/images/LHW.png';
import { IMAGE_CONSTANTS } from '@constants/ImageConstants';

const PMs: Member[] = [
  {
    name: '김강민',
    image: KGM,
    role: 'PM',
    major: '산업시스템공학과',
    instagram: 'smile.kmk',
  },
];

const FEs: Member[] = [
  {
    name: '이동건',
    image: LDG,
    role: 'FE',
    major: '컴퓨터공학전공',
    instagram: '11d_g20',
  },
  {
    name: '강근우',
    image: KGW,
    role: 'FE',
    major: '컴퓨터공학잔공',
    instagram: 'gn00py48',
  },
  {
    name: '박성재',
    image: PSJ,
    role: 'FE',
    major: '정보통신공학과',
    instagram: 'sjae_o',
  },
  {
    name: '오태준',
    image: OTJ,
    role: 'FE',
    major: '정보통신공학과',
    instagram: 'taejun_0',
  },
];

const BEs: Member[] = [
  {
    name: '박선우',
    image: PSW,
    role: 'BE',
    major: '컴퓨터공학전공',
    instagram: 'sunnraiin',
  },
  {
    name: '임수빈',
    image: LSB,
    role: 'BE',
    major: '화공생물공학과',
    instagram: 'so_ob452',
  },
  {
    name: '임현우',
    image: LHW,
    role: 'BE',
    major: '정보통신공학과',
    instagram: 'ooh._.99',
  },
];

const COOPs: Member[] = [
  {
    name: '하채민',
    image: HCM,
    role: 'COOP',
    major: '전기전자공학부',
    instagram: 'hachaennin',
  },
  {
    name: '전효준',
    image: JHJ,
    role: 'COOP',
    major: '산업시스템공학과',
    instagram: 'im_hyo125',
  },
];

const ALL: Member[] = [...PMs, ...FEs, ...BEs, ...COOPs];

const DevPage: React.FC = () => {
  const [role, setRole] = useState<'ALL' | 'PM' | 'FE' | 'BE' | 'COOP'>('ALL');

  // ✅ 전체 칭찬하기 트리거 키 (증가할 때마다 자식이 받아서 폭죽 실행)
  const [burstKey, setBurstKey] = useState(0);

  // (선택) 페이지 전체 Lottie 오버레이를 같이 쓰고 싶다면 true/false로 관리
  // import Lottie/fireWork + 스타일 준비되어 있으면 활성화
  // const [globalFx, setGlobalFx] = useState(false);

  const navigate = useNavigate();
  const list = useMemo(() => {
    return role === 'ALL'
      ? ALL
      : role === 'PM'
        ? PMs
        : role === 'FE'
          ? FEs
          : role === 'BE'
            ? BEs
            : COOPs;
  }, [role]);

  const fireAll = () => {
    setBurstKey((k) => k + 1); // ✅ 모든 카드에 신호 전달
    // setGlobalFx(true);            // (선택) 전역 오버레이도 함께 보이게
    // setTimeout(() => setGlobalFx(false), 1800);
  };

  return (
    <S.PageWrap>
      {/* (선택) 전역 오버레이를 쓰려면 아래 주석 해제
      {globalFx && (
        <S.GlobalFireworksLayer>
          <Lottie animationData={fireWork} loop={true} style={{ width: "100%", height: "100%" }} />
        </S.GlobalFireworksLayer>
      )} */}

      <S.Header>
        <img
          onClick={() => navigate(ROUTE_CONSTANTS.MENULIST)}
          src={IMAGE_CONSTANTS.BACKICON}
          alt="뒤로가기"
          style={{ cursor: 'pointer' }}
        />
        <p>Team D-Order</p>
      </S.Header>

      <S.Toolbar>
        <RoleFilter active={role} onChange={(r) => setRole(r as any)} />
      </S.Toolbar>

      <S.Grid>
        {list.map((m) => (
          <S.GridCol key={m.name}>
            {/* ✅ burstKey를 내려주면 전체 칭찬하기 시 각 카드가 동시에 폭죽 */}
            <DevCard member={m} burstKey={burstKey} />
          </S.GridCol>
        ))}
      </S.Grid>

      <S.EggBar>
        <button onClick={fireAll} title="모두 수고했어요!">
          모두 칭찬하기 🎊
        </button>
      </S.EggBar>
    </S.PageWrap>
  );
};

export default DevPage;

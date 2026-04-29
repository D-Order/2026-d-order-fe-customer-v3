import styled from 'styled-components';
import CharacterLogo from '@assets/images/characterV3.svg?react';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  min-height: calc(var(--vh, 1vh) * 100);

  position: relative; // 상대 위치 설정
  /* padding-top: 145px;
  padding-bottom: 23px; */
  /* box-sizing: border-box; */
`;

export const TitleWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 15px;

  margin-top: 15vh;
`;
export const CheckIcon = styled.img`
  display: flex;
  width: 33px;
  height: 33px;
`;
export const Title = styled.div`
  display: flex;
  height: 100%;
  color: ${({ theme }) => theme.colors.Black01};
  ${({ theme }) => theme.fonts.ExtraBold24};
`;
//아코로고 + 폭죽 로티부분
export const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center; // 세로 중앙 정렬 추가
  width: 100%;
  margin: 0 auto;
  position: relative; // 상대 위치 유지

  margin-top: 20vh;
`;

export const ToDevPageBtn = styled.button`
  width: 97%;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 100%;
  }
`;
export const LottieWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center; // 세로 중앙 정렬 추가
  position: absolute; // 절대 위치 유지
  top: 0;
  left: 0;
  width: 100%;
  height: 100%; // 높이 100% 추가
  z-index: 0;
`;

export const Logo = styled(CharacterLogo)`
  display: flex;
  width: 150px;
  height: auto;
  position: absolute; // 절대 위치로 변경
  top: 50%; // 상단에서 50% 위치
  left: 50%; // 좌측에서 50% 위치
  transform: translate(-50%, -50%); // 중앙 정확히 맞추기 위한 변환
  z-index: 1; // 로고를 앞쪽으로 유지
`;

export const BtnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;

  position: absolute;
  bottom: 25px;

  /* @media (min-height: 850px) {
    position: static; // position을 static으로 변경
    margin-top: 300px; // margin-top 추가
  } */
`;
export const Row = styled.div`
  display: flex;
  gap: 25px;
`;
export const Btn = styled.button<{ $moreMenu?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 150px;
  height: 50px;
  border-radius: 10px;
  ${({ theme }) => theme.fonts.Bold16};

  border: 1px solid ${({ theme }) => theme.colors.Orange01};

  background-color: ${({ theme, $moreMenu }) =>
    $moreMenu ? theme.colors.Orange01 : theme.colors.Bg};
  color: ${({ theme, $moreMenu }) =>
    $moreMenu ? theme.colors.Bg : theme.colors.Orange01};

  transition: transform 0.3s ease-in-out;
  &:hover {
    transform: scale(1.05);
  }
  @media (hover: none) {
    &:active {
      transform: scale(1.05);
    }
  }
`;

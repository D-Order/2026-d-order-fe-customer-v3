//로딩컴포넌트 로딩중일때 가져다 쓰세요

import styled, { keyframes } from 'styled-components';
import { IMAGE_CONSTANTS } from '@constants/ImageConstants';
const Loading = () => {
  return (
    <Wrapper>
      <ContentsWrapper>
        <LoadingSpinner
          src={IMAGE_CONSTANTS.LOADING_SPINNER}
          alt="로딩스피너"
        />
        <LoadingTextWrapper>
          <LoadingTitle>페이지가 로딩 중이에요.</LoadingTitle>
          <LoadingSubTitle>잠시만 기다려주세요!</LoadingSubTitle>
        </LoadingTextWrapper>
      </ContentsWrapper>
    </Wrapper>
  );
};

export default Loading;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: calc(var(--vh, 1vh) * 100);

  background-color: ${({ theme }) => theme.colors.Orange00};

  padding-bottom: 100px;
  box-sizing: border-box;
`;

export const ContentsWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 38px;
`;

const rotate = keyframes`
  0% {
    transform: rotate(360deg);
  }
  100% {
    transform: rotate(0deg);
  }
`;

export const LoadingSpinner = styled.img`
  display: flex;
  width: 30%;
  height: auto;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  animation: ${rotate} 1s linear infinite;
`;

export const LoadingTextWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 14px;
`;
export const LoadingTitle = styled.div`
  display: flex;
  color: ${({ theme }) => theme.colors.Orange01};
  ${({ theme }) => theme.fonts.Bold18};
`;
export const LoadingSubTitle = styled.div`
  display: flex;
  color: #8a8a8a;
  ${({ theme }) => theme.fonts.SemiBold14};
`;

import styled from 'styled-components';
import CharacterLogo from '@assets/images/characterV3.svg?react';
import TextLogo from '@assets/images/logoV3.svg?react';

interface LoginLogoProps {
  boothName: string;
}

const LoginLogo = ({ boothName }: LoginLogoProps) => {
  return (
    <LogoWrapper>
      <BoothName>{boothName || '부스 이름'}</BoothName>

      {/* img 태그 대신 컴포넌트로 사용 */}
      <TextLogo
        width='176px'
        style={{ marginBottom: '63px' }}
        aria-label='빨간글씨 디오더 로고'
        role='img'
      />

      <CharacterLogo width='192px' aria-label='디오더 아코 로고' role='img' />
    </LogoWrapper>
  );
};

export default LoginLogo;

const LogoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BoothName = styled.div`
  display: flex;
  ${({ theme }) => theme.fonts.ExtraBold18}
  color: ${({ theme }) => theme.colors.Orange01};
  margin-bottom: 10px;
`;

import styled from 'styled-components';

export const BackDrop = styled.div`
  position: absolute;

  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: rgba(0, 0, 0, 0.4);
  z-index: 2;
  cursor: pointer;
`;

export const ModalBox = styled.div`
  background-color: ${({ theme }) => theme.colors.Gray01};
  border-radius: 0.75rem;
  width: 70%;

  display: flex;
  flex-direction: column;
  gap: 2rem;
  z-index: 3;
  pointer-events: auto;
`;

export const Box1 = styled.div`
  ${({ theme }) => theme.fonts.Bold16};
  color: ${({ theme }) => theme.colors.Black};
  display: flex;
  justify-content: center;
  padding-top: 2rem;
`;

export const Box2 = styled.div`
  display: flex;
  flex-direction: row;
  border-top: 1px solid ${({ theme }) => theme.colors.Black02};
`;

export const Button1 = styled.div`
  ${({ theme }) => theme.fonts.Bold12};
  color: ${({ theme }) => theme.colors.Orange01};

  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 1rem;
  cursor: pointer;
`;

export const Button2 = styled.div`
  ${({ theme }) => theme.fonts.Bold12};
  color: ${({ theme }) => theme.colors.Orange01};
  border-left: 1px solid ${({ theme }) => theme.colors.Black02};

  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 1rem;
  cursor: pointer;
`;

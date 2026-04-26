import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 100%;
  height: calc(var(--vh, 1vh) * 100);
  position: relative;
`;

export const ShoppingListEmpty = styled.div`
  box-sizing: border-box;
  padding: 1em;

  display: flex;
  flex-direction: column;
  gap: 3rem;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: calc(var(--vh, 1vh) * 100 - 98px - 200px);

  img {
    width: 40%;
  }
  p {
    color: ${({ theme }) => theme.colors.Black01};
    ${({ theme }) => theme.fonts.Bold18}
  }
`;

export const ShoppingListWrapper = styled.div`
  box-sizing: border-box;
  padding: 0 1.25em;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(var(--vh, 1vh) * 100 - 200px - 100px - 2em);
  overflow-y: auto;
`;

export const DarkWrapper = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100vh;

  background-color: rgba(0, 0, 0, 0.4);
  z-index: 11;
`;

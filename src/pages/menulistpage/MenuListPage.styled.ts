import styled from 'styled-components';

export const Wrapper = styled.div`
  min-height: calc(var(--vh, 1vh) * 100);
`;

export const Container = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.875rem;
`;

export const DorderDevelopers = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;

  box-sizing: border-box;
  padding: 0rem 1rem 1rem 1rem;
`;

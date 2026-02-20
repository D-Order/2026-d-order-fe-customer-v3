import { useState, useEffect } from 'react';
import styled from 'styled-components';
import copy from '@assets/icons/copy.svg';

interface TotalAccount {
  depositor: string;
  account: string;
  totalPrice: number;
}

type Step = 'account' | 'confirm' | 'staffComing';

const SendMoneyModal = ({
  canclePay,
  pay: _pay,
  copyAccount,
  totalPrice,
  accountInfo,
  usingCoupon: _usingCoupon,
  onAfterStaffRequest,
}: {
  canclePay: () => void;
  pay: (totalPrice: number, code: string) => void;
  copyAccount: (text: string) => void;
  totalPrice: number;
  accountInfo: {
    account_holder: string;
    bank_name: string;
    account_number: string;
  };
  usingCoupon: string;
  /** 직원 이동 중 대기 후 호출 (모달 닫고 주문 완료 페이지 등으로 이동) */
  onAfterStaffRequest?: () => void;
}) => {
  const [step, setStep] = useState<Step>('account');

  if (!accountInfo) return null;

  const account: TotalAccount = {
    depositor: accountInfo.account_holder,
    account: `${accountInfo.bank_name} ${accountInfo.account_number}`,
    totalPrice,
  };

  const handleRequestConfirm = () => {
    setStep('staffComing');
  };

  useEffect(() => {
    if (step !== 'staffComing') return;
    const t = setTimeout(() => {
      canclePay();
      onAfterStaffRequest?.();
    }, 2500);
    return () => clearTimeout(t);
  }, [step, canclePay, onAfterStaffRequest]);

  // 1) 계좌 안내
  if (step === 'account') {
    return (
      <ModalContainer>
        <Modalhead>
          <p>
            입금 계좌 안내 <br />
            <span>송금 후 직원을 불러주세요!</span>
          </p>
        </Modalhead>
        <ModalBody>
          <div>
            <Text>예금주</Text>
            <Text2>{account.depositor}</Text2>
          </div>
          <div>
            <Text>계좌</Text>
            <div>
              <Text2>{account.account}</Text2>
              <button onClick={() => copyAccount(account.account)}>
                <img src={copy} alt="계좌 복사 버튼" />
              </button>
            </div>
          </div>
          <div>
            <Text>보낼 금액</Text>
            <Text2>{account.totalPrice.toLocaleString('ko-kr')}원</Text2>
          </div>
        </ModalBody>
        <ModalConfirm>
          <button onClick={() => canclePay()}>취소</button>
          <button onClick={() => setStep('confirm')}>송금 완료</button>
        </ModalConfirm>
      </ModalContainer>
    );
  }

  // 2) 송금 완료했는지 확인 모달
  if (step === 'confirm') {
    return (
      <ModalContainer $narrow>
        <ConfirmHead>
          <p>송금을 완료하셨나요?</p>
        </ConfirmHead>
        <ConfirmWarnings>
          <p>확인 요청 시 직원이 호출됩니다.</p>
          <p>요청 후 취소가 어려울 수 있습니다.</p>
        </ConfirmWarnings>
        <ModalConfirm>
          <button onClick={() => setStep('account')}>취소</button>
          <button onClick={handleRequestConfirm}>송금 확인 요청</button>
        </ModalConfirm>
      </ModalContainer>
    );
  }

  // 3) 직원 이동 중 안내 (버튼 없음)
  return (
    <ModalContainer $narrow>
      <StaffComingBody>
        <p>송금 확인을 위해</p>
        <p>직원이 이동 중입니다.</p>
        <p className="highlight">직원이 오면 송금 완료 화면을 보여주세요.</p>
      </StaffComingBody>
    </ModalContainer>
  );
};

export default SendMoneyModal;

const ModalContainer = styled.div<{ $narrow?: boolean }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  border-radius: 14px;
  width: ${({ $narrow }) => ($narrow ? '270px' : '270px')};
  min-height: ${({ $narrow }) => ($narrow ? 'auto' : '260px')};

  background-color: ${({ theme }) => theme.colors.Bg};
  display: grid;
  grid-template-rows: ${({ $narrow }) =>
    $narrow ? 'auto 1fr auto' : '1.2fr 2.4fr 0.9fr'};
  div {
    display: flex;
  }
`;

const ConfirmHead = styled.div`
  padding: 2.25rem 2rem 0;
  justify-content: center;
  text-align: center;
  p {
    color: ${({ theme }) => theme.colors.Black01};
    ${({ theme }) => theme.fonts.Bold14}
  }
`;

const ConfirmWarnings = styled.div`
  padding: 1rem 2rem 3rem 2rem;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
  justify-content: center;
  border-bottom: 1px solid #c0c0c0;
  p {
    color: ${({ theme }) => theme.colors.Orange01};
    ${({ theme }) => theme.fonts.SemiBold12}
  }
`;

const StaffComingBody = styled.div`
  display: flex;
  padding: 2rem 1.25rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  text-align: center;
  p {
    color: ${({ theme }) => theme.colors.Black01};
    ${({ theme }) => theme.fonts.SemiBold14}
  }
  p.highlight {
    color: ${({ theme }) => theme.colors.Orange01};
    ${({ theme }) => theme.fonts.SemiBold14}
  }
`;

const Modalhead = styled.div`
  grid-row: 1/2;
  text-align: center;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #c0c0c0;
  p {
    color: ${({ theme }) => theme.colors.Black01};
    ${({ theme }) => theme.fonts.Bold16}
  }
  span {
    color: ${({ theme }) => theme.colors.Orange01};
    ${({ theme }) => theme.fonts.Medium12}
  }
`;

const ModalBody = styled.div`
  box-sizing: border-box;
  padding: 1em;
  grid-row: 2/3;
  gap: 22px;
  border-bottom: 1px solid #c0c0c0;

  flex-direction: column;

  div {
    justify-content: space-between;
  }
`;

const ModalConfirm = styled.div`
  grid-row: 3/4;
  flex-direction: row;

  display: flex;
  justify-content: center;
  align-items: center;

  button {
    width: 50%;
    color: ${({ theme }) => theme.colors.Orange01};
    ${({ theme }) => theme.fonts.SemiBold16};
    padding: 1rem;
  }
  button:nth-child(1) {
    border-right: 1px solid #c0c0c0;
  }
`;

const Text = styled.p`
  color: ${({ theme }) => theme.colors.Black02};
  ${({ theme }) => theme.fonts.SemiBold14}
`;

const Text2 = styled.p`
  color: ${({ theme }) => theme.colors.Black01};
  ${({ theme }) => theme.fonts.Bold14}
`;

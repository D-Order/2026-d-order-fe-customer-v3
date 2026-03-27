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
  paymentLoading,
  paymentError,
  onRetryLoadAccount,
  usingCoupon: _usingCoupon,
  onRequestTransferConfirmation,
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
  } | null;
  paymentLoading: boolean;
  paymentError: string | null;
  onRetryLoadAccount: () => void;
  usingCoupon: string;
  /** 「송금 확인 요청」 시 서버에 직원 호출·주문 처리 요청 */
  onRequestTransferConfirmation?: () => Promise<void>;
  /** 사용자가 주문 완료 화면으로 이동할 때 */
  onAfterStaffRequest?: () => void;
}) => {
  const [step, setStep] = useState<Step>('account');
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    if (accountInfo) setStep('account');
  }, [accountInfo]);

  if (paymentLoading) {
    return (
      <ModalContainer $narrow>
        <ConfirmHead>
          <p>입금 계좌 안내</p>
        </ConfirmHead>
        <LoadingBody>계좌 정보를 불러오는 중이에요…</LoadingBody>
        <ModalConfirm>
          <button type="button" onClick={canclePay}>
            닫기
          </button>
        </ModalConfirm>
      </ModalContainer>
    );
  }

  if (paymentError) {
    return (
      <ModalContainer $narrow>
        <ConfirmHead>
          <p>입금 계좌 안내</p>
        </ConfirmHead>
        <ErrorBody>{paymentError}</ErrorBody>
        <ModalConfirm>
          <button type="button" onClick={canclePay}>
            닫기
          </button>
          <button type="button" onClick={onRetryLoadAccount}>
            다시 시도
          </button>
        </ModalConfirm>
      </ModalContainer>
    );
  }

  if (!accountInfo) return null;

  const account: TotalAccount = {
    depositor: accountInfo.account_holder,
    account: `${accountInfo.bank_name} ${accountInfo.account_number}`,
    totalPrice,
  };

  const handleRequestConfirm = async () => {
    setConfirmError(null);
    setConfirmSubmitting(true);
    try {
      if (onRequestTransferConfirmation) {
        await onRequestTransferConfirmation();
      }
      setStep('staffComing');
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (e as Error)?.message ||
        '요청에 실패했어요. 잠시 후 다시 시도해 주세요.';
      setConfirmError(msg);
    } finally {
      setConfirmSubmitting(false);
    }
  };

  const handleGoOrderComplete = () => {
    canclePay();
    onAfterStaffRequest?.();
  };

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

  // 2) 송금 완료 확인
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
        {confirmError && <ConfirmErrorText>{confirmError}</ConfirmErrorText>}
        <ModalConfirm>
          <button
            type="button"
            disabled={confirmSubmitting}
            onClick={() => setStep('account')}
          >
            취소
          </button>
          <button
            type="button"
            disabled={confirmSubmitting}
            onClick={() => void handleRequestConfirm()}
          >
            {confirmSubmitting ? '요청 중…' : '송금 확인 요청'}
          </button>
        </ModalConfirm>
      </ModalContainer>
    );
  }

  // 3) 직원 이동 중
  return (
    <ModalContainer $narrow>
      <StaffComingBody>
        <p>송금 확인을 위해</p>
        <p>직원이 이동 중입니다.</p>
        <p className="highlight">직원이 오면 송금 완료 화면을 보여주세요.</p>
      </StaffComingBody>
      <StaffComingFooter>
        <button type="button" onClick={handleGoOrderComplete}>
          주문 완료 화면으로
        </button>
      </StaffComingFooter>
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

const LoadingBody = styled.div`
  padding: 2rem 1.5rem 2.5rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.Black02};
  ${({ theme }) => theme.fonts.SemiBold14}
`;

const ErrorBody = styled.div`
  padding: 1.25rem 1.5rem 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.Black01};
  ${({ theme }) => theme.fonts.SemiBold14}
  border-bottom: 1px solid #c0c0c0;
  line-height: 1.45;
`;

const ConfirmErrorText = styled.p`
  padding: 0 1.5rem 0.75rem;
  margin: 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.Orange01};
  ${({ theme }) => theme.fonts.SemiBold12}
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

const StaffComingFooter = styled.div`
  display: flex;
  justify-content: center;
  padding: 0 1rem 1.25rem;
  border-top: 1px solid #c0c0c0;
  button {
    width: 100%;
    padding: 1rem;
    color: ${({ theme }) => theme.colors.Orange01};
    ${({ theme }) => theme.fonts.SemiBold16};
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
    flex: 1;
    color: ${({ theme }) => theme.colors.Orange01};
    ${({ theme }) => theme.fonts.SemiBold16};
    padding: 1rem;
  }
  button:only-child {
    flex: 1;
  }
  button:not(:only-child):first-of-type {
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

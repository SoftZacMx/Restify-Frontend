import { createContext, useContext } from 'react';
import type { PaymentState, OrderFormErrors, PosPaymentMethod } from '@/domain/types';

interface PosPaymentContextValue {
  paymentState: PaymentState;
  errors: OrderFormErrors;
  selectedMethod1: PosPaymentMethod | null;
  selectedMethod2: PosPaymentMethod | null;
  showSecondPaymentMethod: boolean;
  onShowSecondPaymentMethodChange: (show: boolean) => void;
  onPaymentAmountChange: (method: PosPaymentMethod, amount: number) => void;
  onMethod1Change: (method: PosPaymentMethod | null) => void;
  onMethod2Change: (method: PosPaymentMethod | null) => void;
  onProcessPayment?: () => void;
  isProcessPaymentEnabled: boolean;
}

const PosPaymentContext = createContext<PosPaymentContextValue | null>(null);

export function PosPaymentProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: PosPaymentContextValue;
}) {
  return (
    <PosPaymentContext.Provider value={value}>
      {children}
    </PosPaymentContext.Provider>
  );
}

export function usePosPaymentContext() {
  const ctx = useContext(PosPaymentContext);
  if (!ctx) {
    throw new Error('usePosPaymentContext must be used within PosPaymentProvider');
  }
  return ctx;
}

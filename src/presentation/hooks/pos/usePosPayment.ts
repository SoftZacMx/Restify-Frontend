import { useState, useCallback, useMemo, useEffect } from 'react';
import type {
  PosPaymentMethod,
  PaymentState,
  CartState,
} from '@/domain/types';
import { orderService } from '@/application/services';

interface UsePosPaymentOptions {
  cartState: CartState;
  paymentTotal: number;
}

/**
 * Hook para gestionar métodos de pago, montos y validación del pago en el POS.
 * El cobro contra el backend lo hace la página vía orderService.payOrder.
 */
export const usePosPayment = ({ cartState, paymentTotal }: UsePosPaymentOptions) => {
  // Montos por método
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [transferAmount, setTransferAmount] = useState<number>(0);

  // Métodos seleccionados
  const [selectedMethod1, setSelectedMethod1] = useState<PosPaymentMethod | null>(null);
  const [selectedMethod2, setSelectedMethod2] = useState<PosPaymentMethod | null>(null);
  const [showSecondPaymentMethod, setShowSecondPaymentMethodState] = useState(false);

  // Estado de pago calculado
  const paymentState: PaymentState = useMemo(() => {
    return orderService.calculatePaymentState(
      paymentTotal,
      cashAmount,
      cardAmount,
      transferAmount,
      selectedMethod1,
      selectedMethod2
    );
  }, [paymentTotal, cashAmount, cardAmount, transferAmount, selectedMethod1, selectedMethod2]);

  // Actualizar montos cuando cambia el total y hay un solo método
  useEffect(() => {
    if (selectedMethod1 && !selectedMethod2 && paymentTotal > 0) {
      if (selectedMethod1 === 'CASH') setCashAmount(paymentTotal);
      else if (selectedMethod1 === 'CARD') setCardAmount(paymentTotal);
      else if (selectedMethod1 === 'TRANSFER') setTransferAmount(paymentTotal);
    }
  }, [paymentTotal, selectedMethod1, selectedMethod2]);

  const handlePaymentAmountChange = useCallback(
    (method: PosPaymentMethod, amount: number) => {
      let finalAmount = amount;
      if (selectedMethod1 && selectedMethod2) {
        finalAmount = Math.min(amount, cartState.total);
      } else if ((method === 'CARD' || method === 'TRANSFER') && amount > cartState.total) {
        finalAmount = cartState.total;
      }

      switch (method) {
        case 'CASH': setCashAmount(finalAmount); break;
        case 'CARD': setCardAmount(finalAmount); break;
        case 'TRANSFER': setTransferAmount(finalAmount); break;
      }

      if (selectedMethod1 && selectedMethod2) {
        const otherMethod = selectedMethod1 === method ? selectedMethod2 : selectedMethod1;
        const remaining = Math.max(0, cartState.total - finalAmount);
        if (otherMethod === 'CASH') setCashAmount(Math.min(remaining, cartState.total));
        else if (otherMethod === 'CARD') setCardAmount(Math.min(remaining, cartState.total));
        else if (otherMethod === 'TRANSFER') setTransferAmount(Math.min(remaining, cartState.total));
      }
    },
    [cartState.total, selectedMethod1, selectedMethod2]
  );

  const handleMethod1Change = useCallback((method: PosPaymentMethod | null) => {
    setSelectedMethod1(method);
    if (method && method === selectedMethod2) {
      setSelectedMethod2(null);
    }
    setCashAmount(0);
    setCardAmount(0);
    setTransferAmount(0);
  }, [selectedMethod2]);

  const handleMethod2Change = useCallback(
    (method: PosPaymentMethod | null) => {
      setSelectedMethod2(method);
      if (method && method === selectedMethod1) return;

      if (method && selectedMethod1) {
        const amount1 = orderService.getPaymentAmount(
          selectedMethod1, cashAmount, cardAmount, transferAmount
        );
        const remaining = Math.max(0, paymentTotal - amount1);
        const diff = Math.min(remaining, paymentTotal);
        if (method === 'CASH') setCashAmount(diff);
        else if (method === 'CARD') setCardAmount(diff);
        else if (method === 'TRANSFER') setTransferAmount(diff);
      }
    },
    [selectedMethod1, paymentTotal, cashAmount, cardAmount, transferAmount]
  );

  const setShowSecondPaymentMethod = useCallback((show: boolean) => {
    if (!show) {
      if (selectedMethod2 === 'CASH') setCashAmount(0);
      else if (selectedMethod2 === 'CARD') setCardAmount(0);
      else if (selectedMethod2 === 'TRANSFER') setTransferAmount(0);
      setSelectedMethod2(null);
    }
    setShowSecondPaymentMethodState(show);
  }, [selectedMethod2]);

  // Poblar desde orden existente
  const populatePaymentFromMethod = useCallback((paymentMethod: number | null) => {
    if (paymentMethod === null) return;
    switch (paymentMethod) {
      case 1: setSelectedMethod1('CASH'); break;
      case 2: setSelectedMethod1('TRANSFER'); break;
      case 3: setSelectedMethod1('CARD'); break;
    }
  }, []);

  const resetPayment = useCallback(() => {
    setCashAmount(0);
    setCardAmount(0);
    setTransferAmount(0);
    setSelectedMethod1(null);
    setSelectedMethod2(null);
    setShowSecondPaymentMethodState(false);
  }, []);

  return {
    cashAmount,
    cardAmount,
    transferAmount,
    selectedMethod1,
    selectedMethod2,
    showSecondPaymentMethod,
    paymentState,
    handlePaymentAmountChange,
    handleMethod1Change,
    handleMethod2Change,
    setShowSecondPaymentMethod,
    populatePaymentFromMethod,
    resetPayment,
  };
};

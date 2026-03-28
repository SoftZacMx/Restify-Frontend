import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, CreditCard, Building2, Check, RotateCw } from 'lucide-react';
import { SiMercadopago } from 'react-icons/si';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Switch } from '@/presentation/components/ui/switch';
import { cn } from '@/shared/lib/utils';
import type { PaymentState, OrderFormErrors, PosPaymentMethod } from '@/domain/types';

interface PaymentMethodsProps {
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
  isProcessPaymentEnabled?: boolean;
}

const PAYMENT_METHODS: { value: PosPaymentMethod; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  { value: 'CASH', label: 'Efectivo', shortLabel: 'Efectivo', icon: <DollarSign className="h-5 w-5" /> },
  { value: 'CARD', label: 'Tarjeta', shortLabel: 'Tarjeta', icon: <CreditCard className="h-5 w-5" /> },
  { value: 'TRANSFER', label: 'Transferencia', shortLabel: 'Transfer.', icon: <Building2 className="h-5 w-5" /> },
  { value: 'QR_MP', label: 'Mercado Pago', shortLabel: 'Mercado Pago', icon: <SiMercadopago className="h-5 w-5" /> },
];

/**
 * Vista de métodos de pago tipo Checkout: botones horizontales, Amount Received, Change to Return, Split, Process.
 */
export const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  paymentState,
  errors,
  selectedMethod1,
  selectedMethod2,
  showSecondPaymentMethod,
  onShowSecondPaymentMethodChange,
  onPaymentAmountChange,
  onMethod1Change,
  onMethod2Change,
  onProcessPayment,
  isProcessPaymentEnabled = false,
}) => {
  const getAmount = (method: PosPaymentMethod | null): number => {
    if (!method) return 0;
    switch (method) {
      case 'CASH':
        return paymentState.cashAmount;
      case 'CARD':
        return paymentState.cardAmount;
      case 'TRANSFER':
        return paymentState.transferAmount;
      default:
        return 0;
    }
  };

  const amount1 = selectedMethod1 ? getAmount(selectedMethod1) : 0;
  const amount2 = selectedMethod2 ? getAmount(selectedMethod2) : 0;
  const totalEntered = amount1 + amount2;
  const remainingToPay = Math.max(0, paymentState.total - totalEntered);

  const change =
    selectedMethod1 === 'CASH' &&
    !selectedMethod2 &&
    paymentState.cashAmount > paymentState.total
      ? Math.round((paymentState.cashAmount - paymentState.total) * 100) / 100
      : 0;

  const availableMethodsForMethod2 = PAYMENT_METHODS.filter(
    (method) => method.value !== selectedMethod1
  );

  const roundTo2Decimals = (n: number) => Math.round(n * 100) / 100;

  /** Formato de monto para el input: siempre punto como decimal (evita coma por locale) */
  const formatAmountForInput = (amount: number): string =>
    amount > 0 ? amount.toFixed(2) : '';
  /** Parsea valor del input aceptando coma o punto como decimal */
  const parseAmountFromInput = (value: string): string =>
    value.replace(',', '.');
  /** Deja solo dígitos y un punto decimal para evitar caracteres inválidos */
  const sanitizeDecimalInput = (value: string): string => {
    const normalized = parseAmountFromInput(value);
    const parts = normalized.split('.');
    if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
    if (parts.length === 2) return parts[0] + '.' + parts[1].replace(/\D/g, '').slice(0, 2);
    return parts[0].replace(/\D/g, '');
  };

  const [amount1Display, setAmount1Display] = useState('');
  const [amount2Display, setAmount2Display] = useState('');
  const focusedAmount1 = useRef(false);
  const focusedAmount2 = useRef(false);

  useEffect(() => {
    if (!focusedAmount1.current) {
      setAmount1Display(formatAmountForInput(amount1));
    }
  }, [amount1, selectedMethod1]);
  useEffect(() => {
    if (!focusedAmount2.current) {
      setAmount2Display(formatAmountForInput(amount2));
    }
  }, [amount2, selectedMethod2]);

  const handleAmountChange = (method: PosPaymentMethod, value: string) => {
    const amount = roundTo2Decimals(parseFloat(parseAmountFromInput(value)) || 0);
    if ((method === 'CARD' || method === 'TRANSFER') && amount > paymentState.total) {
      onPaymentAmountChange(method, roundTo2Decimals(paymentState.total));
    } else {
      onPaymentAmountChange(method, amount);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
        Método de pago
      </h3>

      {/* Tres botones horizontales: Efectivo, Tarjeta, Transferencia */}
      <div className="flex gap-2 mb-4">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod1 === method.value;
          return (
            <button
              key={method.value}
              type="button"
              onClick={() => onMethod1Change(isSelected ? selectedMethod1 : method.value)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl border-2 transition-colors',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
              )}
            >
              {method.icon}
              <span className="text-sm font-semibold">{method.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Amount Received (no aplica para QR MP — se paga el total completo) */}
      {selectedMethod1 && selectedMethod1 !== 'QR_MP' && (
        <div className="space-y-2 mb-4">
          <Label htmlFor="amount1" className="text-slate-600 dark:text-slate-300">
            Monto recibido
          </Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-semibold">
              $
            </span>
            <Input
              id="amount1"
              data-testid="payment-amount-1"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount1Display}
              onFocus={() => { focusedAmount1.current = true; setAmount1Display(formatAmountForInput(getAmount(selectedMethod1))); }}
              onBlur={() => { focusedAmount1.current = false; setAmount1Display(formatAmountForInput(getAmount(selectedMethod1))); }}
              onChange={(e) => {
                const raw = sanitizeDecimalInput(e.target.value);
                setAmount1Display(raw);
                handleAmountChange(selectedMethod1, raw);
              }}
              className={cn(
                'pl-8 h-12 text-lg font-semibold',
                (errors.cashAmount || errors.cardAmount || errors.transferAmount) && 'border-destructive'
              )}
            />
          </div>
          {(errors.cashAmount || errors.cardAmount || errors.transferAmount) && (
            <p className="text-sm text-destructive">
              {errors.cashAmount || errors.cardAmount || errors.transferAmount}
            </p>
          )}
        </div>
      )}

      {/* Change to Return (solo efectivo, cuando monto > total) */}
      {change > 0 && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/20 mb-4">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Cambio a devolver</p>
            <p className="text-2xl font-bold text-primary">${change.toFixed(2)}</p>
          </div>
          <button
            type="button"
            onClick={() => onPaymentAmountChange('CASH', roundTo2Decimals(paymentState.total))}
            className="p-2 rounded-full hover:bg-primary/20 text-primary"
            aria-label="Recalcular cambio"
          >
            <RotateCw className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Split Payment */}
      <div className="flex items-center justify-between gap-3 py-3 border-t border-slate-200 dark:border-slate-700">
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Dividir pago</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Repartir la cuenta entre varios métodos
          </p>
        </div>
        <Switch
          id="show-second-method"
          data-testid="payment-split-toggle"
          checked={showSecondPaymentMethod}
          onCheckedChange={onShowSecondPaymentMethodChange}
        />
      </div>

      {/* Segundo método (cuando split está activo) — mismos botones que el primer método */}
      {showSecondPaymentMethod && (
        <div className="space-y-2 mb-4">
          <Label className="text-slate-600 dark:text-slate-300">Segundo método de pago</Label>
          <div className="flex gap-2">
            {availableMethodsForMethod2.map((method) => {
              const isSelected = selectedMethod2 === method.value;
              return (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => onMethod2Change(isSelected ? null : method.value)}
                  className={cn(
                    'flex-1 flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl border-2 transition-colors',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
                  )}
                >
                  {method.icon}
                  <span className="text-sm font-semibold">{method.shortLabel}</span>
                </button>
              );
            })}
          </div>
          {selectedMethod2 && (
            <Input
              data-testid="payment-amount-2"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount2Display}
              onFocus={() => { focusedAmount2.current = true; setAmount2Display(formatAmountForInput(getAmount(selectedMethod2))); }}
              onBlur={() => { focusedAmount2.current = false; setAmount2Display(formatAmountForInput(getAmount(selectedMethod2))); }}
              onChange={(e) => {
                const raw = sanitizeDecimalInput(e.target.value);
                setAmount2Display(raw);
                handleAmountChange(selectedMethod2, raw);
              }}
              className={cn(
                'h-12 text-lg font-semibold',
                (errors.cashAmount || errors.cardAmount || errors.transferAmount) && 'border-destructive'
              )}
            />
          )}
          {errors.method2 && <p className="text-sm text-destructive">{errors.method2}</p>}
        </div>
      )}

      {errors.paymentMethods && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
          <p className="text-sm text-destructive">{errors.paymentMethods}</p>
        </div>
      )}

      {/* Total a pagar (referencia) */}
      <div className="flex justify-between text-sm py-2 mb-2">
        <span className="text-slate-500 dark:text-slate-400">Total a pagar</span>
        <span className="font-semibold" data-testid="payment-total" aria-label={`Total a pagar ${paymentState.total.toFixed(2)}`}>
          ${paymentState.total.toFixed(2)}
        </span>
      </div>
      {remainingToPay > 0.01 && (
        <div className="flex justify-between text-sm text-amber-600 dark:text-amber-400 mb-4">
          <span>Resta por pagar</span>
          <span className="font-semibold">${remainingToPay.toFixed(2)}</span>
        </div>
      )}
      {selectedMethod1 && totalEntered > 0 && (
        <div className="flex justify-between text-sm font-semibold py-2 border-t border-slate-200 dark:border-slate-700 mb-4">
          <span className="text-slate-600 dark:text-slate-400">Total ingresado</span>
          <span data-testid="payment-total-entered" aria-label={`Total ingresado ${totalEntered.toFixed(2)}`}>
            ${totalEntered.toFixed(2)}
          </span>
        </div>
      )}

      {/* Botón Process Payment & Print Receipt */}
      {typeof onProcessPayment === 'function' && (
        <div className="mt-auto pt-4 space-y-2">
          <Button
            onClick={onProcessPayment}
            disabled={!isProcessPaymentEnabled}
            className="w-full h-12 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
            data-testid="pay-order"
          >
            <Check className="h-5 w-5 mr-2" />
            Procesar pago e imprimir ticket
          </Button>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Al procesar, confirmas que el monto fue recibido en su totalidad.
          </p>
        </div>
      )}
    </div>
  );
};

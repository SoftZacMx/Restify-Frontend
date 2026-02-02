import React from 'react';
import { DollarSign, CreditCard, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { Switch } from '@/presentation/components/ui/switch';
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
}

const PAYMENT_METHODS: { value: PosPaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'CASH', label: 'Efectivo', icon: <DollarSign className="h-4 w-4" /> },
  { value: 'CARD', label: 'Tarjeta', icon: <CreditCard className="h-4 w-4" /> },
  { value: 'TRANSFER', label: 'Transferencia', icon: <Building2 className="h-4 w-4" /> },
];

/**
 * Componente PaymentMethods
 * Responsabilidad única: Permitir seleccionar métodos de pago y ingresar montos
 * Cumple SRP: Solo maneja la entrada de métodos de pago
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
}) => {
  // Obtener el monto de un método específico
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

  // Obtener el nombre del método
  const getMethodName = (method: PosPaymentMethod): string => {
    return PAYMENT_METHODS.find((m) => m.value === method)?.label || method;
  };

  // Obtener el icono del método
  const getMethodIcon = (method: PosPaymentMethod): React.ReactNode => {
    return PAYMENT_METHODS.find((m) => m.value === method)?.icon || null;
  };

  // Calcular lo que resta por pagar
  const amount1 = selectedMethod1 ? getAmount(selectedMethod1) : 0;
  const amount2 = selectedMethod2 ? getAmount(selectedMethod2) : 0;
  const totalEntered = amount1 + amount2;
  const remainingToPay = Math.max(0, paymentState.total - totalEntered);

  // Cambio / vuelto: solo cuando el único método es efectivo y el monto entregado es mayor al total
  const change =
    selectedMethod1 === 'CASH' &&
    !selectedMethod2 &&
    paymentState.cashAmount > paymentState.total
      ? Math.round((paymentState.cashAmount - paymentState.total) * 100) / 100
      : 0;

  // Filtrar métodos disponibles para el selector 2 (excluir el método 1)
  const availableMethodsForMethod2 = PAYMENT_METHODS.filter(
    (method) => method.value !== selectedMethod1
  );

  /** Redondear a 2 decimales para montos de pago */
  const roundTo2Decimals = (n: number) => Math.round(n * 100) / 100;

  const handleAmountChange = (method: PosPaymentMethod, value: string) => {
    const amount = roundTo2Decimals(parseFloat(value) || 0);
    if ((method === 'CARD' || method === 'TRANSFER') && amount > paymentState.total) {
      onPaymentAmountChange(method, roundTo2Decimals(paymentState.total));
    } else {
      onPaymentAmountChange(method, amount);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pago</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selector de método 1 */}
        <div className="space-y-2">
          <Label htmlFor="method1">Primer Método de Pago *</Label>
          <Select value={selectedMethod1 || ''} onValueChange={onMethod1Change}>
            <SelectTrigger id="method1">
              {selectedMethod1 ? (
                <span className="flex items-center gap-2">
                  {getMethodIcon(selectedMethod1)}
                  {getMethodName(selectedMethod1)}
                </span>
              ) : (
                <SelectValue placeholder="Seleccione un método" />
              )}
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  <div className="flex items-center gap-2">
                    {method.icon}
                    <span>{method.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.method1 && (
            <p className="text-sm text-destructive">{errors.method1}</p>
          )}
        </div>

        {/* Input de monto para método 1 */}
        {selectedMethod1 && (
          <div className="space-y-2">
            <Label htmlFor="amount1" className="flex items-center gap-2">
              {getMethodIcon(selectedMethod1)}
              <span>Monto {getMethodName(selectedMethod1)}</span>
            </Label>
            <Input
              id="amount1"
              type="number"
              min="0"
              max={selectedMethod1 === 'CARD' || selectedMethod1 === 'TRANSFER' ? paymentState.total : undefined}
              step="0.01"
              placeholder="0.00"
              value={getAmount(selectedMethod1) > 0 ? parseFloat(getAmount(selectedMethod1).toFixed(2)) : ''}
              onChange={(e) => handleAmountChange(selectedMethod1, e.target.value)}
              className={
                errors.cashAmount || errors.cardAmount || errors.transferAmount
                  ? 'border-destructive'
                  : ''
              }
            />
            {(errors.cashAmount || errors.cardAmount || errors.transferAmount) && (
              <p className="text-sm text-destructive">
                {errors.cashAmount || errors.cardAmount || errors.transferAmount}
              </p>
            )}
            {selectedMethod1 === 'CASH' && !selectedMethod2 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Puede ser mayor al total para calcular el cambio a devolver.
              </p>
            )}
          </div>
        )}

        {/* Mostrar / ocultar segundo método de pago */}
        <div className="flex items-center justify-between gap-2 py-2 border-t border-slate-200 dark:border-slate-700 pt-4">
          <Label htmlFor="show-second-method" className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
            Dividir pago en dos métodos (ej. efectivo + tarjeta)
          </Label>
          <Switch
            id="show-second-method"
            checked={showSecondPaymentMethod}
            onCheckedChange={onShowSecondPaymentMethodChange}
          />
        </div>

        {/* Selector de método 2 (opcional) — solo si está visible */}
        {showSecondPaymentMethod && (
          <>
            <div className="space-y-2">
              <Label htmlFor="method2">Segundo Método de Pago (Opcional)</Label>
              <Select
                value={selectedMethod2 || ''}
                onValueChange={onMethod2Change}
                disabled={!selectedMethod1}
              >
                <SelectTrigger id="method2">
                  {selectedMethod2 ? (
                    <span className="flex items-center gap-2">
                      {getMethodIcon(selectedMethod2)}
                      {getMethodName(selectedMethod2)}
                    </span>
                  ) : (
                    <SelectValue placeholder="Ninguno (opcional)" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Ninguno</SelectItem>
                  {availableMethodsForMethod2.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        {method.icon}
                        <span>{method.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.method2 && (
                <p className="text-sm text-destructive">{errors.method2}</p>
              )}
            </div>

            {/* Input de monto para método 2 */}
            {selectedMethod2 && (
              <div className="space-y-2">
                <Label htmlFor="amount2" className="flex items-center gap-2">
                  {getMethodIcon(selectedMethod2)}
                  <span>Monto {getMethodName(selectedMethod2)}</span>
                </Label>
                <Input
                  id="amount2"
                  type="number"
                  min="0"
                  max={selectedMethod2 === 'CARD' || selectedMethod2 === 'TRANSFER' ? paymentState.total : undefined}
                  step="0.01"
                  placeholder="0.00"
                  value={getAmount(selectedMethod2) > 0 ? parseFloat(getAmount(selectedMethod2).toFixed(2)) : ''}
                  onChange={(e) => handleAmountChange(selectedMethod2, e.target.value)}
                  className={
                    errors.cashAmount || errors.cardAmount || errors.transferAmount
                      ? 'border-destructive'
                      : ''
                  }
                />
                {(errors.cashAmount || errors.cardAmount || errors.transferAmount) && (
                  <p className="text-sm text-destructive">
                    {errors.cashAmount || errors.cardAmount || errors.transferAmount}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Mensaje de error general */}
        {errors.paymentMethods && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{errors.paymentMethods}</p>
          </div>
        )}

        {/* Resumen de pagos */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Total a pagar:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              ${paymentState.total.toFixed(2)}
            </span>
          </div>

          {selectedMethod1 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                {getMethodIcon(selectedMethod1)}
                {getMethodName(selectedMethod1)}:
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                ${amount1.toFixed(2)}
              </span>
            </div>
          )}

          {selectedMethod2 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                {getMethodIcon(selectedMethod2)}
                {getMethodName(selectedMethod2)}:
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                ${amount2.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm font-semibold pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-700 dark:text-slate-300">Total ingresado:</span>
            <span className="text-slate-900 dark:text-slate-100">
              ${totalEntered.toFixed(2)}
            </span>
          </div>

          {/* Lo que resta por pagar */}
          {remainingToPay > 0.01 && (
            <div className="flex justify-between text-sm font-medium pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-orange-600 dark:text-orange-400">Resta por pagar:</span>
              <span className="text-orange-600 dark:text-orange-400 font-semibold">
                ${remainingToPay.toFixed(2)}
              </span>
            </div>
          )}

          {/* Cambio / vuelto al cliente (solo efectivo cuando monto entregado > total) */}
          {change > 0 && (
            <div className="flex justify-between text-base font-bold pt-2 border-t-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <span className="text-green-700 dark:text-green-400">
                Cambio a devolver (vuelto):
              </span>
              <span className="text-green-700 dark:text-green-400">${change.toFixed(2)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

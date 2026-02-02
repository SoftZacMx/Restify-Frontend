/**
 * Diálogo para pagar una orden con dos métodos (pago dividido).
 * Basado en: prompts/split-payment-frontend-guide.md
 */

import React, { useState, useCallback, useEffect } from 'react';
import { CreditCard, DollarSign, Building2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import type { OrderResponse } from '@/domain/types';
import type { SplitPaymentPart } from '@/domain/types/payment.types';
import { paymentService } from '@/application/services';
import { AppError } from '@/domain/errors';
import { formatCurrency } from '@/shared/utils/order.utils';

const SPLIT_METHODS: { value: 'CASH' | 'TRANSFER' | 'CARD_PHYSICAL'; label: string; icon: React.ReactNode }[] = [
  { value: 'CASH', label: 'Efectivo', icon: <DollarSign className="h-4 w-4" /> },
  { value: 'TRANSFER', label: 'Transferencia', icon: <Building2 className="h-4 w-4" /> },
  { value: 'CARD_PHYSICAL', label: 'Tarjeta', icon: <CreditCard className="h-4 w-4" /> },
];

const roundTo2 = (n: number) => Math.round(n * 100) / 100;

export interface SplitPaymentDialogProps {
  order: OrderResponse | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SplitPaymentDialog: React.FC<SplitPaymentDialogProps> = ({
  order,
  open,
  onClose,
  onSuccess,
}) => {
  const [firstMethod, setFirstMethod] = useState<'CASH' | 'TRANSFER' | 'CARD_PHYSICAL' | ''>('');
  const [firstAmount, setFirstAmount] = useState<string>('');
  const [secondMethod, setSecondMethod] = useState<'CASH' | 'TRANSFER' | 'CARD_PHYSICAL' | ''>('');
  const [secondAmount, setSecondAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const orderTotal = order?.total ?? 0;

  const resetForm = useCallback(() => {
    setFirstMethod('');
    setFirstAmount('');
    setSecondMethod('');
    setSecondAmount('');
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  const a1 = parseFloat(firstAmount) || 0;
  const a2 = parseFloat(secondAmount) || 0;
  const sum = roundTo2(a1 + a2);
  const tolerance = 0.01;
  const sumValid = Math.abs(sum - orderTotal) <= tolerance;
  const methodsDifferent = firstMethod && secondMethod && firstMethod !== secondMethod;

  const canSubmit =
    order &&
    firstMethod &&
    secondMethod &&
    a1 > 0 &&
    a2 > 0 &&
    sumValid &&
    methodsDifferent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !canSubmit) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    const firstPayment: SplitPaymentPart = {
      amount: roundTo2(a1),
      paymentMethod: firstMethod as 'CASH' | 'TRANSFER' | 'CARD_PHYSICAL',
    };
    const secondPayment: SplitPaymentPart = {
      amount: roundTo2(a2),
      paymentMethod: secondMethod as 'CASH' | 'TRANSFER' | 'CARD_PHYSICAL',
    };

    try {
      const response = await paymentService.payWithSplit(
        order.id,
        firstPayment,
        secondPayment,
        orderTotal
      );

      if (response.success && response.data) {
        if (response.data.tableReleased) {
          // La mesa se liberó; la UI se actualizará al invalidar queries
        }
        onSuccess();
        onClose();
      } else {
        setErrorMessage('No se pudo procesar el pago dividido');
      }
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'Error al procesar el pago dividido';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSecondMethods = SPLIT_METHODS.filter((m) => m.value !== firstMethod);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pago dividido</DialogTitle>
        </DialogHeader>

        {order ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Total de la orden (solo lectura) */}
            <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-4">
              <Label className="text-slate-500 dark:text-slate-400">Total de la orden</Label>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {formatCurrency(orderTotal)}
              </p>
            </div>

            {/* Primer pago */}
            <div className="space-y-2">
              <Label>Primer método de pago *</Label>
              <Select value={firstMethod} onValueChange={(v) => setFirstMethod(v as typeof firstMethod)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione método" />
                </SelectTrigger>
                <SelectContent>
                  {SPLIT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      <span className="flex items-center gap-2">
                        {m.icon}
                        {m.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Monto"
                value={firstAmount}
                onChange={(e) => setFirstAmount(e.target.value)}
                disabled={!firstMethod}
              />
            </div>

            {/* Segundo pago */}
            <div className="space-y-2">
              <Label>Segundo método de pago * (distinto al primero)</Label>
              <Select
                value={secondMethod}
                onValueChange={(v) => setSecondMethod(v as typeof secondMethod)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione método" />
                </SelectTrigger>
                <SelectContent>
                  {availableSecondMethods.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      <span className="flex items-center gap-2">
                        {m.icon}
                        {m.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Monto"
                value={secondAmount}
                onChange={(e) => setSecondAmount(e.target.value)}
                disabled={!secondMethod}
              />
            </div>

            {/* Resumen suma */}
            {(a1 > 0 || a2 > 0) && (
              <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">Suma ingresada:</span>
                <span className={sumValid ? 'text-green-600 dark:text-green-400 font-medium' : 'text-destructive'}>
                  {formatCurrency(sum)}
                  {!sumValid && orderTotal > 0 && (
                    <span className="ml-1 text-xs">
                      (debe ser {formatCurrency(orderTotal)})
                    </span>
                  )}
                </span>
              </div>
            )}

            {errorMessage && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">{errorMessage}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Procesar pago dividido'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">No hay orden seleccionada.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

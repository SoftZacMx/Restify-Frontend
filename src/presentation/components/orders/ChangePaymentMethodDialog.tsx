import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import type { OrderResponse } from '@/domain/types';
import type { EditablePaymentMethod } from '@/shared/utils/order.utils';
import {
  EDITABLE_PAYMENT_METHODS,
  formatOrderNumber,
  getPaymentMethodName,
} from '@/shared/utils/order.utils';
import { orderService } from '@/application/services';
import { AppError } from '@/domain/errors';

const CONFIRMATION_WORD = 'confirmar';

export interface ChangePaymentMethodDialogProps {
  order: OrderResponse | null;
  targetMethod: EditablePaymentMethod | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Confirmación para cambiar el método de pago de una orden cobrada.
 * Pide escribir "confirmar" porque el cambio también reescribe los pagos de la orden.
 */
export const ChangePaymentMethodDialog: React.FC<ChangePaymentMethodDialogProps> = ({
  order,
  targetMethod,
  open,
  onClose,
  onSuccess,
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setConfirmationText('');
      setErrorMessage(null);
    }
  }, [open]);

  if (!order || !targetMethod) return null;

  const targetOrderMethod = EDITABLE_PAYMENT_METHODS.find((m) => m.value === targetMethod)!.orderMethod;
  const currentMethodName = getPaymentMethodName(order.paymentMethod);
  const targetMethodName = getPaymentMethodName(targetOrderMethod);
  const canSubmit = confirmationText.trim().toLowerCase() === CONFIRMATION_WORD;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await orderService.updateOrderPaymentMethod(order.id, targetMethod);
      onSuccess();
      onClose();
    } catch (err) {
      const message =
        err instanceof AppError ? err.message : 'No se pudo cambiar el método de pago';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>¿Cambiar método de pago?</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">Orden</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {formatOrderNumber(order.id)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">Método actual</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {currentMethodName}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">Método nuevo</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {targetMethodName}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            El cambio afecta los reportes de la orden. Escribe{' '}
            <strong className="text-slate-900 dark:text-white">{CONFIRMATION_WORD}</strong> para
            continuar.
          </p>

          <div className="space-y-2">
            <Label htmlFor="change-payment-method-confirmation">Confirmación *</Label>
            <Input
              id="change-payment-method-confirmation"
              autoComplete="off"
              placeholder={CONFIRMATION_WORD}
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Cambiando...' : 'Cambiar método'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/presentation/components/ui/dialog';
import { CreateExpenseForm } from './CreateExpenseForm';
import type { CreateExpenseRequest } from '@/domain/types';

interface CreateExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (expenseData: CreateExpenseRequest) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Componente CreateExpenseDialog
 * Responsabilidad única: Mostrar dialog para crear gastos
 * Cumple SRP: Solo maneja la UI del dialog
 */
export const CreateExpenseDialog: React.FC<CreateExpenseDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}) => {
  const handleSubmit = async (expenseData: CreateExpenseRequest) => {
    await onSubmit(expenseData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 shadow-xl rounded-xl">
        <DialogHeader className="flex flex-row items-start gap-3 pr-10">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Nuevo Gasto
            </DialogTitle>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Registro de compra de mercancía para inventario.
            </p>
          </div>
        </DialogHeader>
        <DialogClose />
        <CreateExpenseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};



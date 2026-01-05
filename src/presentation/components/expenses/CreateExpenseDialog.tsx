import React, { useState } from 'react';
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Gasto</DialogTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Rellena los detalles para registrar un nuevo gasto.
          </p>
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



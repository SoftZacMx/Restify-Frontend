import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/presentation/components/ui/dialog';
import { TableSelector } from '@/presentation/components/pos/TableSelector';
import type { Table } from '@/domain/types';

interface TableSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tables: Table[];
  selectedTableId: string | null;
  onTableSelect: (tableId: string | null) => void;
  isLoading?: boolean;
  error?: string | null;
  disabled?: boolean;
}

/**
 * Diálogo para seleccionar mesa (tipo de orden local).
 * Muestra el grid de mesas; al seleccionar una se cierra el diálogo.
 */
export const TableSelectionDialog: React.FC<TableSelectionDialogProps> = ({
  open,
  onOpenChange,
  tables,
  selectedTableId,
  onTableSelect,
  isLoading = false,
  error = null,
  disabled = false,
}) => {
  const handleSelect = (tableId: string | null) => {
    onTableSelect(tableId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 p-0 overflow-hidden">
        <DialogHeader className="relative px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white pr-10">
                Seleccionar Mesa
              </DialogTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Elige una mesa disponible para la orden
              </p>
            </div>
          </div>
          <DialogClose className="text-slate-500 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-1.5 right-4 top-4" />
        </DialogHeader>

        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">Cargando mesas...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600 dark:text-red-400">{error}</div>
          ) : tables.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">No hay mesas disponibles</div>
          ) : (
            <TableSelector
              tables={tables}
              selectedTableId={selectedTableId}
              onTableSelect={handleSelect}
              disabled={disabled}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

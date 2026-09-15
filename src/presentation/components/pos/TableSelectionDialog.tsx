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
 * Diálogo para seleccionar ubicación (tipo de orden local).
 * Muestra el grid de ubicaciones; al seleccionar una se cierra el diálogo.
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
      <DialogContent className="w-[90vw] max-w-4xl max-h-[90vh] flex flex-col bg-card border-border p-0 overflow-hidden">
        <DialogHeader className="relative px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-h2 text-foreground pr-10">
                Seleccionar Ubicación
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Elige una ubicación disponible para la orden
              </p>
            </div>
          </div>
          <DialogClose className="text-muted-foreground hover:bg-muted dark:hover:bg-card rounded-lg p-1.5 right-4 top-4" />
        </DialogHeader>

        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Cargando ubicaciones...</div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">{error}</div>
          ) : tables.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No hay ubicaciones disponibles</div>
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

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { Table } from '@/domain/types';

interface TableSelectorProps {
  tables: Table[];
  selectedTableId: string | null;
  onTableSelect: (tableId: string | null) => void;
  /** Si true, los botones no se pueden pulsar (solo informativo, ej. orden local en edición) */
  disabled?: boolean;
}

/**
 * Componente TableSelector
 * Vista: número grande, estado (LIBRE/OCUPADA/SELECCIONADA), indicador (verde/rojo/check).
 * Al hacer clic en una mesa se selecciona y se cierra el diálogo (sin botones Confirmar/Cancelar).
 */
export const TableSelector: React.FC<TableSelectorProps> = ({
  tables,
  selectedTableId,
  onTableSelect,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {tables.map((table) => {
        const isSelected = selectedTableId === table.id;
        const isAvailable = table.isAvailable;

        const statusLabel = isSelected
          ? 'SELECCIONADA'
          : isAvailable
            ? 'LIBRE'
            : 'OCUPADA';

        const isClickable = !disabled && (isAvailable || isSelected);

        return (
          <button
            key={table.id}
            type="button"
            onClick={() => isClickable && onTableSelect(isSelected ? null : table.id)}
            disabled={!isClickable}
            className={cn(
              'flex flex-col items-center justify-center gap-1 h-24 rounded-xl border-2 relative transition-colors',
              isSelected
                ? 'bg-primary border-primary text-white'
                : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white hover:border-primary/50',
              (!isAvailable && !isSelected) && 'opacity-60 cursor-not-allowed'
            )}
          >
            {/* Indicador: check seleccionada, verde libre, rojo ocupada */}
            <div className="absolute top-2 right-2">
              {isSelected ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <Check className="h-3.5 w-3.5" />
                </div>
              ) : (
                <div
                  className={cn(
                    'w-3 h-3 rounded-full',
                    isAvailable ? 'bg-green-500' : 'bg-red-500'
                  )}
                  title={isAvailable ? 'Libre' : 'Ocupada'}
                />
              )}
            </div>

            <span className="text-lg font-bold text-center px-1 leading-tight break-words max-w-full">
              {table.name}
            </span>
            <span className="text-xs font-medium uppercase tracking-wide opacity-90">
              {statusLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
};

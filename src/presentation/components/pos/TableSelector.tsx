import React from 'react';
import { Square } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
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
 * Responsabilidad única: Permitir seleccionar una mesa disponible
 * Cumple SRP: Solo maneja la selección de mesa
 */
export const TableSelector: React.FC<TableSelectorProps> = ({
  tables,
  selectedTableId,
  onTableSelect,
  disabled = false,
}) => {
  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Seleccionar Mesa
      </label>
      <div className="grid grid-cols-5 gap-3">
        {tables.map((table) => {
          const isSelected = selectedTableId === table.id;
          const isAvailable = table.isAvailable;

          return (
            <Button
              key={table.id}
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => !disabled && onTableSelect(isSelected ? null : table.id)}
              disabled={disabled || (!isAvailable && !isSelected)}
              className={cn(
                'flex flex-col items-center justify-center gap-2 h-24 relative',
                isSelected && 'bg-primary text-white',
                (!isAvailable && !isSelected) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Indicador de estatus */}
              <div
                className={cn(
                  'absolute top-2 right-2 w-3 h-3 rounded-full',
                  isAvailable ? 'bg-green-500' : 'bg-red-500'
                )}
                title={isAvailable ? 'Disponible' : 'Ocupada'}
              />
              
              {/* Icono de mesa */}
              <Square className="h-6 w-6" />
              
              {/* Información de la mesa */}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs font-semibold">Mesa {table.number}</span>
                <span className="text-xs opacity-75">{table.capacity} pers.</span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

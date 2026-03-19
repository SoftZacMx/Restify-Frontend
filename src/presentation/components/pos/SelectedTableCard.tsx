import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { cn } from '@/shared/lib/utils';
import type { Table } from '@/domain/types';

interface SelectedTableCardProps {
  table: Table;
  /** Si se provee, el card es clicable para abrir el diálogo de cambio (ej. seleccionar otra mesa) */
  onClick?: () => void;
  className?: string;
}

/**
 * Vista de la mesa seleccionada: icono, identificador, capacidad y zona.
 * Sin botones (sin Gestionar Pedido / Cambiar Mesa). Opcionalmente clicable para cambiar mesa.
 */
export const SelectedTableCard: React.FC<SelectedTableCardProps> = ({
  table,
  onClick,
  className,
}) => {
  const tableLabel = `Mesa ${table.name}`;

  return (
    <Card
      className={cn(
        'overflow-hidden border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800',
        onClick && 'cursor-pointer hover:border-primary/30 transition-colors',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5 space-y-4">
        {/* Icono circular */}
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/20 dark:bg-sky-400/20">
            <LayoutGrid className="h-7 w-7 text-sky-600 dark:text-sky-400" />
          </div>
        </div>

        {/* Identificador */}
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Identificador
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            {tableLabel}
          </p>
        </div>


      </CardContent>
    </Card>
  );
};

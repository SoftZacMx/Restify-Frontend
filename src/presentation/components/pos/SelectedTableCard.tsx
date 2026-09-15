import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { cn } from '@/shared/lib/utils';
import type { Table } from '@/domain/types';

interface SelectedTableCardProps {
  table: Table;
  /** Si se provee, el card es clicable para abrir el diálogo de cambio (ej. seleccionar otra ubicación) */
  onClick?: () => void;
  className?: string;
}

/**
 * Vista de la ubicación seleccionada: icono, identificador, capacidad y zona.
 * Sin botones (sin Gestionar Pedido / Cambiar Ubicación). Opcionalmente clicable para cambiar ubicación.
 */
export const SelectedTableCard: React.FC<SelectedTableCardProps> = ({
  table,
  onClick,
  className,
}) => {
  const tableLabel = `Ubicación ${table.name}`;

  return (
    <Card
      className={cn(
        'overflow-hidden border-border bg-card',
        onClick && 'cursor-pointer hover:border-primary/30 transition-colors',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5 space-y-4">
        {/* Icono circular */}
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-chart-4/20">
            <LayoutGrid className="h-7 w-7 text-chart-4" />
          </div>
        </div>

        {/* Identificador */}
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Identificador
          </p>
          <p className="text-h2 text-foreground mt-0.5">
            {tableLabel}
          </p>
        </div>


      </CardContent>
    </Card>
  );
};

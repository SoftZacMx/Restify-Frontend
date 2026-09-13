import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { Badge } from '@/presentation/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { APP_TIMEZONE } from '@/shared/constants';
import {
  formatStockQuantity,
  getMovementReasonDescription,
  getMovementTypeOption,
} from '@/shared/utils/stock.utils';
import type { MovementTableItem, UnitOfMeasure } from '@/domain/types';

interface MovementsTableProps {
  items: MovementTableItem[];
  unitOfMeasure: UnitOfMeasure | null;
  isLoading?: boolean;
}

function formatSignedQuantity(qty: number, unit: UnitOfMeasure | null): string {
  const abs = formatStockQuantity(Math.abs(qty), unit);
  return qty >= 0 ? `+${abs}` : `-${abs}`;
}

function userDisplay(item: MovementTableItem): string {
  if (item.userName) return item.userName;
  if (!item.userId) return 'Sistema';
  // Fallback si el backend no incluyó el nombre por algún motivo.
  return `user-${item.userId.slice(0, 8)}`;
}

function originLabel(item: MovementTableItem): string {
  if (item.expenseItemId) return 'Compra';
  if (item.orderItemId) return 'Orden';
  return '—';
}

export const MovementsTable: React.FC<MovementsTableProps> = ({
  items,
  unitOfMeasure,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-8 text-center text-muted-foreground">
            Cargando movimientos...
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-8 text-center text-muted-foreground">
            No hay movimientos para los filtros aplicados.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fecha
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tipo
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cantidad
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Motivo
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Origen
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Usuario
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const typeOption = getMovementTypeOption(item.type);
                const Icon = typeOption.icon;
                const isPositive = item.quantity > 0;
                const isNegative = item.quantity < 0;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {new Date(item.createdAt).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: APP_TIMEZONE,
                      })}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0',
                          typeOption.badgeClassName
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {typeOption.description}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      <span
                        className={cn(
                          'font-medium',
                          isPositive && 'text-fresco-texto',
                          isNegative && 'text-destructive-texto',
                          !isPositive && !isNegative && 'text-foreground'
                        )}
                      >
                        {formatSignedQuantity(item.quantity, unitOfMeasure)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-foreground max-w-xs">
                      {(() => {
                        const reasonText = getMovementReasonDescription(item.reason);
                        return (
                          <div className="truncate" title={[reasonText, item.notes].filter(Boolean).join(' — ')}>
                            {reasonText || '—'}
                            {item.notes && (
                              <span className="text-xs text-muted-foreground"> · {item.notes}</span>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                      {originLabel(item)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                      {userDisplay(item)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

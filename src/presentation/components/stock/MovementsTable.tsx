import React from 'react';
import { ShoppingCart, Receipt, Trash2, Sliders, RotateCcw } from 'lucide-react';
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
import { formatStockQuantity, getMovementReasonDescription } from '@/shared/utils/stock.utils';
import type {
  MovementTableItem,
  StockMovementType,
  UnitOfMeasure,
} from '@/domain/types';

interface MovementsTableProps {
  items: MovementTableItem[];
  unitOfMeasure: UnitOfMeasure | null;
  isLoading?: boolean;
}

const TYPE_META: Record<
  StockMovementType,
  { label: string; className: string; Icon: typeof ShoppingCart }
> = {
  PURCHASE: {
    label: 'Compra',
    className: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
    Icon: ShoppingCart,
  },
  SALE: {
    label: 'Venta',
    className: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
    Icon: Receipt,
  },
  WASTE: {
    label: 'Merma',
    className: 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300',
    Icon: Trash2,
  },
  ADJUSTMENT: {
    label: 'Ajuste',
    className: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
    Icon: Sliders,
  },
  SALE_REVERSAL: {
    label: 'Reversa',
    className: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300',
    Icon: RotateCcw,
  },
};

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
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Cargando movimientos...
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No hay movimientos para los filtros aplicados.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Fecha
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tipo
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Cantidad
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Motivo
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Origen
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Usuario
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const meta = TYPE_META[item.type];
                const Icon = meta.Icon;
                const isPositive = item.quantity > 0;
                const isNegative = item.quantity < 0;
                return (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
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
                          meta.className
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      <span
                        className={cn(
                          'font-medium',
                          isPositive && 'text-green-700 dark:text-green-400',
                          isNegative && 'text-red-700 dark:text-red-400',
                          !isPositive && !isNegative && 'text-slate-700 dark:text-slate-300'
                        )}
                      >
                        {formatSignedQuantity(item.quantity, unitOfMeasure)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 max-w-xs">
                      {(() => {
                        const reasonText = getMovementReasonDescription(item.reason);
                        return (
                          <div className="truncate" title={[reasonText, item.notes].filter(Boolean).join(' — ')}>
                            {reasonText || '—'}
                            {item.notes && (
                              <span className="text-xs text-slate-400 dark:text-slate-500"> · {item.notes}</span>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                      {originLabel(item)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
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

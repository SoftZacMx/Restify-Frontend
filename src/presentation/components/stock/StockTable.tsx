import React from 'react';
import { History } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { Badge } from '@/presentation/components/ui/badge';
import { Tooltip } from '@/presentation/components/ui/tooltip';
import type { StockTableItem, StockHealth } from '@/domain/types';
import { cn } from '@/shared/lib/utils';
import { formatStockQuantity, formatAverageCost, formatUnit } from '@/shared/utils/stock.utils';

interface StockTableProps {
  items: StockTableItem[];
  isLoading?: boolean;
  onViewHistory?: (productId: string) => void;
}

const HEALTH_BADGE: Record<
  StockHealth,
  { label: string; className: string; hoverClassName: string; dotClassName: string }
> = {
  healthy: {
    label: 'OK',
    className: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
    hoverClassName: 'hover:bg-green-200 dark:hover:bg-green-900/60 focus:bg-green-200 dark:focus:bg-green-900/60',
    dotClassName: 'bg-green-500',
  },
  warning: {
    label: 'Cerca del mínimo',
    className: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
    hoverClassName: 'hover:bg-yellow-200 dark:hover:bg-yellow-900/60 focus:bg-yellow-200 dark:focus:bg-yellow-900/60',
    dotClassName: 'bg-yellow-500',
  },
  critical: {
    label: 'Bajo mínimo',
    className: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
    hoverClassName: 'hover:bg-red-200 dark:hover:bg-red-900/60 focus:bg-red-200 dark:focus:bg-red-900/60',
    dotClassName: 'bg-red-500',
  },
};

/**
 * Componente StockTable
 * Responsabilidad única: Renderizar la tabla de stock con indicador de salud por fila.
 * Replica el patrón visual de ProductTable / ExpenseTable.
 */
export const StockTable: React.FC<StockTableProps> = ({
  items,
  isLoading = false,
  onViewHistory,
}) => {
  if (isLoading) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Cargando stock...
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
            No hay productos trackeados con los filtros aplicados.
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
                  Producto
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Stock actual
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Mínimo
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Costo promedio
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Estado
                </TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const badge = HEALTH_BADGE[item.health];
                const minLabel =
                  item.minStockAlert != null
                    ? formatStockQuantity(item.minStockAlert, item.unitOfMeasure)
                    : '—';

                return (
                  <TableRow key={item.productId}>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className={cn('h-2.5 w-2.5 rounded-full flex-shrink-0', badge.dotClassName)}
                        />
                        <div className="min-w-0">
                          <div className="text-slate-900 dark:text-white truncate" title={item.name}>
                            {item.name}
                          </div>
                          {item.description && (
                            <div
                              className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs"
                              title={item.description}
                            >
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      {formatStockQuantity(item.stockActual, item.unitOfMeasure)}
                      {!item.unitOfMeasure && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
                          (sin unidad)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {minLabel}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      <div className="flex flex-col">
                        <span>{formatAverageCost(item.averageCost)}</span>
                        {item.unitOfMeasure && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            por {formatUnit(item.unitOfMeasure)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={cn(
                          'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0 transition-colors',
                          badge.className,
                          badge.hoverClassName
                        )}
                      >
                        {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Tooltip content="Ver historial">
                        <button
                          onClick={() => onViewHistory?.(item.productId)}
                          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          aria-label={`Ver historial de ${item.name}`}
                        >
                          <History className="h-4 w-4" />
                        </button>
                      </Tooltip>
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

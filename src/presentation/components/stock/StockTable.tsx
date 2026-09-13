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
  { label: string; className: string; dotClassName: string }
> = {
  healthy: {
    label: 'OK',
    className: 'bg-fresco-suave text-fresco-texto',
    dotClassName: 'bg-fresco',
  },
  warning: {
    label: 'Cerca del mínimo',
    className: 'bg-apoyo-suave text-apoyo-texto',
    dotClassName: 'bg-apoyo',
  },
  critical: {
    label: 'Bajo mínimo',
    className: 'bg-destructive-suave text-destructive-texto',
    dotClassName: 'bg-destructive',
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
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-8 text-center text-muted-foreground">
            Cargando stock...
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
            No hay productos trackeados con los filtros aplicados.
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
                  Producto
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Stock actual
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Mínimo
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Costo promedio
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estado
                </TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                          <div className="text-foreground truncate" title={item.name}>
                            {item.name}
                          </div>
                          {item.description && (
                            <div
                              className="text-xs text-muted-foreground truncate max-w-xs"
                              title={item.description}
                            >
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatStockQuantity(item.stockActual, item.unitOfMeasure)}
                      {!item.unitOfMeasure && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (sin unidad)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {minLabel}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      <div className="flex flex-col">
                        <span>{formatAverageCost(item.averageCost)}</span>
                        {item.unitOfMeasure && (
                          <span className="text-xs text-muted-foreground">
                            por {formatUnit(item.unitOfMeasure)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={cn(
                          'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0',
                          badge.className
                        )}
                      >
                        {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Tooltip content="Ver historial">
                        <button
                          onClick={() => onViewHistory?.(item.productId)}
                          className="p-2 rounded-full text-muted-foreground hover:bg-secondary dark:hover:bg-card hover:text-foreground dark:hover:text-foreground transition-colors"
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

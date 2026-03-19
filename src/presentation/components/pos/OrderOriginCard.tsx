import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { OrderTypeSelector } from '@/presentation/components/pos/OrderTypeSelector';
import { CustomerNameInput } from '@/presentation/components/pos/CustomerNameInput';
import type { OrderType } from '@/domain/types';
import type { Table } from '@/domain/types';

export interface OrderOriginCardValidationErrors {
  tableId?: string;
  customerName?: string;
}

interface OrderOriginCardProps {
  orderType: OrderType | null;
  onOrderTypeChange: (type: OrderType | null) => void;
  /** Solo cuando orderType === 'DINE_IN' */
  selectedTable: Table | undefined;
  onSelectTableClick: () => void;
  /** Solo cuando orderType === 'TAKEOUT' */
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  validationErrors?: OrderOriginCardValidationErrors;
}

/**
 * Card unificada para el origen de la orden: tipo (Para Comer Aquí / Para Llevar),
 * selección de mesa (si es local) o nombre del cliente (si es para llevar).
 * Todo en una sola card.
 */
export const OrderOriginCard: React.FC<OrderOriginCardProps> = ({
  orderType,
  onOrderTypeChange,
  selectedTable,
  onSelectTableClick,
  customerName,
  onCustomerNameChange,
  validationErrors = {},
}) => {
  return (
    <Card className="shrink-0">
      <CardHeader>
        <CardTitle>Origen de la orden</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <OrderTypeSelector
          orderType={orderType}
          onOrderTypeChange={onOrderTypeChange}
        />

        {orderType === 'DINE_IN' && (
          <div className="space-y-2">
            {selectedTable ? (
              <button
                type="button"
                onClick={onSelectTableClick}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-primary/30 transition-colors text-left"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/20 dark:bg-sky-400/20 shrink-0">
                  <LayoutGrid className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Mesa seleccionada
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    Mesa {selectedTable.name}
                  </p>
                  {selectedTable.location?.trim() && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedTable.location.trim()}
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium text-primary">Cambiar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onSelectTableClick}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30 hover:border-primary/40 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-left"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/20 dark:bg-sky-400/20 shrink-0">
                  <LayoutGrid className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Sin mesa asignada
                  </p>
                  <p className="text-base font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                    Toca para elegir mesa
                  </p>
                </div>
              </button>
            )}
            {validationErrors.tableId && (
              <p className="text-sm text-destructive">{validationErrors.tableId}</p>
            )}
          </div>
        )}

        {orderType === 'TAKEOUT' && (
          <div className="space-y-2">
            <CustomerNameInput
              customerName={customerName}
              onCustomerNameChange={onCustomerNameChange}
            />
            {validationErrors.customerName && (
              <p className="text-sm text-destructive">{validationErrors.customerName}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

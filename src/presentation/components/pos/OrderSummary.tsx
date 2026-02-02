import React from 'react';
import { Receipt, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import type { CartState } from '@/domain/types';

interface OrderSummaryProps {
  cartState: CartState;
}

/**
 * Componente OrderSummary
 * Responsabilidad única: Mostrar el resumen de la orden con totales
 * Cumple SRP: Solo muestra el resumen de totales
 */
export const OrderSummary: React.FC<OrderSummaryProps> = ({ cartState }) => {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Resumen de Orden</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Subtotal:
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            ${cartState.subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            IVA (16%):
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            ${cartState.tax.toFixed(2)}
          </span>
        </div>
        <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-4 mt-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Total:</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">
                ${cartState.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

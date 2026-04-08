import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { formatCurrency } from '@/shared/utils';
import { formatOrderTime, getTableDisplay } from '@/shared/utils/dashboard.utils';
import type { DashboardOrderSummary } from '@/domain/types';

interface ActiveOrdersCardProps {
  activeOrders: { count: number; items: DashboardOrderSummary[] };
  onOrderClick: (orderId: string) => void;
}

export function ActiveOrdersCard({ activeOrders, onOrderClick }: ActiveOrdersCardProps) {
  return (
    <Card className="border-slate-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Órdenes activas ({activeOrders.count})
        </CardTitle>
        <Link
          to="/orders"
          className="inline-flex items-center justify-center rounded-lg font-medium h-9 px-3 text-sm border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Ver todas
        </Link>
      </CardHeader>
      <CardContent>
        {activeOrders.items.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
            No hay órdenes activas
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-l-lg">Orden</th>
                  <th className="px-4 py-3 font-medium">Mesa</th>
                  <th className="px-4 py-3 font-medium">Hora</th>
                  <th className="px-4 py-3 font-medium text-right rounded-r-lg">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {activeOrders.items.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                    onClick={() => onOrderClick(order.id)}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {getTableDisplay(order)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {formatOrderTime(order.date)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

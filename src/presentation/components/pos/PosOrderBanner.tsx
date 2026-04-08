import { ArrowLeft } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { formatOrderNumber } from '@/shared/utils/order.utils';
import type { OrderResponse } from '@/domain/types';

interface PosOrderBannerProps {
  order: OrderResponse;
  onBack: () => void;
}

export function PosOrderBanner({ order, onBack }: PosOrderBannerProps) {
  return (
    <div className={`rounded-lg p-4 mb-4 border ${
      order.status
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              Orden {formatOrderNumber(order.id)}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {order.table ? `Mesa ${order.table.name}` : order.origin}
              {order.client && ` • ${order.client}`}
            </p>
          </div>
          <Badge className={order.status
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
          }>
            {order.status ? 'Pagada' : 'Pendiente'}
          </Badge>
          {order.delivered && (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              Entregada
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              ${order.total.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {order.orderItems?.length || 0} items
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </div>
      </div>
    </div>
  );
}

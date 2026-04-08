import { ShoppingCart, Receipt, ArrowLeft } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { formatOrderNumber } from '@/shared/utils/order.utils';
import type { PosMode, OrderResponse } from '@/domain/types';

interface PosHeaderProps {
  posMode: PosMode;
  loadedOrder: OrderResponse | null;
  currentOrderId: string | undefined;
  isPaymentOnlyMode: boolean;
  onBackToEdit: () => void;
}

export function PosHeader({
  posMode,
  loadedOrder,
  currentOrderId,
  isPaymentOnlyMode,
  onBackToEdit,
}: PosHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
          {posMode === 'ORDER_BUILDING' ? (
            <ShoppingCart className="h-6 w-6 text-white" />
          ) : (
            <Receipt className="h-6 w-6 text-white" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {loadedOrder
                ? `Orden ${formatOrderNumber(loadedOrder.id)}`
                : posMode === 'ORDER_BUILDING'
                  ? 'Crear/Editar Orden'
                  : 'Procesar Pago'
              }
            </h1>
            {!(posMode === 'ORDER_BUILDING' && !loadedOrder && !isPaymentOnlyMode) && (
              <Badge
                variant={posMode === 'ORDER_BUILDING' ? 'default' : 'secondary'}
                className="text-sm px-3 py-1"
              >
                {isPaymentOnlyMode
                  ? 'Pago'
                  : loadedOrder && posMode === 'ORDER_BUILDING'
                    ? 'Edición'
                    : loadedOrder
                      ? 'Visualización'
                      : 'Pago'}
              </Badge>
            )}
          </div>
          {(currentOrderId || loadedOrder) && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span className="font-medium">
                ID: {loadedOrder?.id || currentOrderId}
              </span>
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {posMode === 'PAYMENT_PROCESSING' && !loadedOrder && !isPaymentOnlyMode && (
          <Button variant="outline" onClick={onBackToEdit} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Editar
          </Button>
        )}
      </div>
    </div>
  );
}

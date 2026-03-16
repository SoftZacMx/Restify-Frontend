import React from 'react';
import {
  Clock,
  MapPin,
  User,
  CreditCard,
  FileText,
  Package,
  Loader2,
  Receipt,
  UtensilsCrossed,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { OrderResponse } from '@/domain/types';
import {
  formatOrderNumber,
  formatOrderDateTime,
  formatCurrency,
  getPaymentMethodName,
  getPaymentMethodIcon,
} from '@/shared/utils/order.utils';

export interface OrderDetailDialogProps {
  order: OrderResponse | null;
  open: boolean;
  onClose: () => void;
  /** Mientras se carga la orden completa (mesa, items, extras) */
  isLoading?: boolean;
  /** Abre el diálogo de pago dividido para esta orden (solo si no está pagada) */
  onSplitPayment?: (order: OrderResponse) => void;
  /** Imprime ticket de venta (cliente) */
  onPrintClientTicket?: (orderId: string) => void;
  /** Imprime ticket de cocina */
  onPrintKitchenTicket?: (orderId: string) => void;
  /** Mientras se está imprimiendo un ticket */
  isPrintingTicket?: boolean;
}

/**
 * Diálogo con detalles de una orden
 */
export const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
  order,
  open,
  onClose,
  isLoading = false,
  onSplitPayment,
  onPrintClientTicket,
  onPrintKitchenTicket,
  isPrintingTicket = false,
}) => {
  // Si la orden no está pagada y no tiene método de pago, mostrar "Pendiente"
  const paymentMethod = order
    ? !order.status && order.paymentMethod == null
      ? 'Pendiente'
      : getPaymentMethodName(order.paymentMethod)
    : '';
  const paymentIcon = order
    ? !order.status && order.paymentMethod == null
      ? '⏳'
      : getPaymentMethodIcon(order.paymentMethod)
    : '';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="flex items-center gap-3">
              {order ? (
                <>
                  <span className="text-xl">Orden {formatOrderNumber(order.id)}</span>
                  <OrderStatusBadge order={order} />
                </>
              ) : (
                <span className="text-xl">Detalle de orden</span>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-500 dark:text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            Cargando orden...
          </div>
        ) : !order ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4">No se pudo cargar la orden.</p>
        ) : (
        <div className="space-y-6">
          {/* Información general: fecha, origen, mesa, cliente, pago */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-sm">{formatOrderDateTime(order.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Origen:</span>
              <span className="text-sm">{order.origin || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="text-sm">
                {order.table ? `Mesa ${order.table.numberTable}` : 'Sin mesa'}
              </span>
            </div>
            {order.client && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-sm">{order.client}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 col-span-2">
              <CreditCard className="h-4 w-4 text-slate-400" />
              <span className="text-sm">
                {paymentIcon} {paymentMethod}
              </span>
            </div>
          </div>

          {/* Nota de la orden */}
          {order.note && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Nota de la orden
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{order.note}</p>
            </div>
          )}

          {/* Items de la orden */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Items de la orden
            </h4>
            <div className="space-y-3">
              {!order.orderItems?.length ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-2">No hay items en esta orden.</p>
              ) : order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {item.menuItem?.name || item.product?.name || 'Producto'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          x{item.quantity}
                        </Badge>
                      </div>
                      {item.note && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          📝 {item.note}
                        </p>
                      )}
                      {/* Extras */}
                      {item.extras && item.extras.length > 0 && (
                        <div className="mt-2 pl-3 border-l-2 border-slate-200 dark:border-slate-700">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Extras:
                          </span>
                          {item.extras.map((extra) => (
                            <div
                              key={extra.id}
                              className="flex justify-between items-center text-xs mt-1"
                            >
                              <span className="text-slate-600 dark:text-slate-300">
                                + {extra.extra?.name || 'Extra'} x{extra.quantity}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400">
                                {formatCurrency(extra.price * extra.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatCurrency(item.price)} c/u
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen de totales */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
              <span className="text-slate-900 dark:text-white">
                {formatCurrency(order.subtotal)}
              </span>
            </div>
            {order.tip > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Propina</span>
                <span className="text-slate-900 dark:text-white">
                  {formatCurrency(order.tip)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-900 dark:text-white">Total</span>
              <span className="text-slate-900 dark:text-white">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>

          {/* Estado de la orden */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  order.delivered ? 'bg-green-500' : 'bg-slate-300'
                }`}
              />
              <span className="text-slate-600 dark:text-slate-300">
                {order.delivered ? 'Entregada' : 'No entregada'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  order.status ? 'bg-green-500' : 'bg-slate-300'
                }`}
              />
              <span className="text-slate-600 dark:text-slate-300">
                {order.status ? 'Pagada' : 'Pendiente de pago'}
              </span>
            </div>
          </div>

          {/* Acciones: imprimir tickets, pago dividido (si no pagada), cerrar */}
          <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            {onPrintClientTicket && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onPrintClientTicket(order.id)}
                disabled={isPrintingTicket}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Ticket cliente
              </Button>
            )}
            {onPrintKitchenTicket && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onPrintKitchenTicket(order.id)}
                disabled={isPrintingTicket}
              >
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                Ticket cocina
              </Button>
            )}
            {!order.status && onSplitPayment && (
              <Button
                type="button"
                variant="default"
                onClick={() => onSplitPayment(order)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pagar con dos métodos
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

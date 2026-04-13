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
  Phone,
  Navigation,
  ChevronDown,
  Truck,
  CookingPot,
  PackageCheck,
  CheckCircle,
  DollarSign,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/presentation/components/ui/collapsible';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { OrderResponse } from '@/domain/types';
import {
  formatOrderNumber,
  formatOrderDateTime,
  formatCurrency,
  getPaymentMethodName,
  getPaymentMethodIcon,
  getOrderOriginLabel,
  isOnlineOrder,
} from '@/shared/utils/order.utils';

export interface OrderDetailDialogProps {
  order: OrderResponse | null;
  open: boolean;
  onClose: () => void;
  isLoading?: boolean;
  onSplitPayment?: (order: OrderResponse) => void;
  onPrintClientTicket?: (orderId: string) => void;
  onPrintKitchenTicket?: (orderId: string) => void;
  isPrintingTicket?: boolean;
  onUpdateDeliveryStatus?: (orderId: string, status: 'PREPARING' | 'READY' | 'ON_THE_WAY' | 'DELIVERED') => void;
}

// Timeline steps for online orders
type DeliveryStatusKey = 'PENDING_PAYMENT' | 'PAID' | 'PREPARING' | 'READY' | 'ON_THE_WAY' | 'DELIVERED';

const TIMELINE_STEPS: { key: DeliveryStatusKey; label: string; icon: React.ReactNode }[] = [
  { key: 'PENDING_PAYMENT', label: 'Pendiente', icon: <Clock className="h-4 w-4" /> },
  { key: 'PAID', label: 'Pagado', icon: <DollarSign className="h-4 w-4" /> },
  { key: 'PREPARING', label: 'Preparando', icon: <CookingPot className="h-4 w-4" /> },
  { key: 'READY', label: 'Listo', icon: <PackageCheck className="h-4 w-4" /> },
  { key: 'ON_THE_WAY', label: 'En camino', icon: <Truck className="h-4 w-4" /> },
  { key: 'DELIVERED', label: 'Entregado', icon: <CheckCircle className="h-4 w-4" /> },
];

function getStepIndex(status: string | null): number {
  if (!status) return -1;
  return TIMELINE_STEPS.findIndex((s) => s.key === status);
}

export const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
  order,
  open,
  onClose,
  isLoading = false,
  onSplitPayment,
  onPrintClientTicket,
  onPrintKitchenTicket,
  isPrintingTicket = false,
  onUpdateDeliveryStatus,
}) => {
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

  const isOnline = order ? isOnlineOrder(order) : false;
  const currentStepIndex = order ? getStepIndex(order.deliveryStatus) : -1;

  // For pickup, filter out ON_THE_WAY and DELIVERED (last step is READY)
  const timelineSteps = order?.origin === 'online-pickup'
    ? TIMELINE_STEPS.filter((s) => s.key !== 'ON_THE_WAY' && s.key !== 'DELIVERED')
    : TIMELINE_STEPS;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ===== LEFT COLUMN: Order Details + Timeline ===== */}
          <div className="space-y-4">
            {/* Order info card */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Detalles
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{formatOrderDateTime(order.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{getOrderOriginLabel(order)}</span>
                </div>
                {order.table && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Package className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Mesa {order.table.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CreditCard className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{paymentIcon} {paymentMethod}</span>
                </div>
                {order.client && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <User className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{order.client}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Note */}
            {order.note && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nota</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{order.note}</p>
              </div>
            )}

            {/* Status Timeline (online orders) */}
            {isOnline && order.deliveryStatus && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Estado
                </h4>
                <div className="space-y-0">
                  {timelineSteps.map((step, idx) => {
                    const stepOriginalIndex = getStepIndex(step.key);
                    const isCompleted = stepOriginalIndex < currentStepIndex;
                    const isCurrent = stepOriginalIndex === currentStepIndex;
                    const isLast = idx === timelineSteps.length - 1;

                    return (
                      <div key={step.key} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              isCompleted
                                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                : isCurrent
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                            }`}
                          >
                            {step.icon}
                          </div>
                          {!isLast && (
                            <div
                              className={`w-0.5 h-5 my-0.5 ${
                                isCompleted ? 'bg-green-300 dark:bg-green-700' : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                            />
                          )}
                        </div>
                        <div className="pt-1.5">
                          <p
                            className={`text-xs font-medium ${
                              isCompleted
                                ? 'text-green-600 dark:text-green-400'
                                : isCurrent
                                  ? 'text-slate-900 dark:text-white font-semibold'
                                  : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Non-online order status */}
            {!isOnline && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Estado
                </h4>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${order.status ? 'bg-green-500' : 'bg-slate-300'}`} />
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {order.status ? 'Pagada' : 'Pendiente de pago'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${order.delivered ? 'bg-green-500' : 'bg-slate-300'}`} />
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {order.delivered ? 'Entregada' : 'No entregada'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ===== CENTER COLUMN: Items ===== */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Items ({order.orderItems?.length || 0})
              </h4>
            </div>
            <div className="space-y-2">
              {!order.orderItems?.length ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">Sin items</p>
              ) : order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg p-3"
                >
                  {/* Icon placeholder */}
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <UtensilsCrossed className="h-5 w-5 text-slate-400" />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {item.menuItem?.name || item.product?.name || 'Producto'}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      x{item.quantity} · {formatCurrency(item.price)} c/u
                    </p>
                    {item.note && (
                      <p className="text-xs text-slate-400 mt-1 italic">{item.note}</p>
                    )}
                    {item.extras && item.extras.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {item.extras.map((extra) => (
                          <Badge key={extra.id} variant="secondary" className="text-[10px] px-1.5 py-0">
                            + {extra.extra?.name || 'Extra'} ({formatCurrency(extra.price)})
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== RIGHT COLUMN: Summary + Customer Info + Actions ===== */}
          <div className="space-y-4">
            {/* Account Summary */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Resumen
              </h4>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                <span className="text-slate-900 dark:text-white">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.iva > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">IVA</span>
                  <span className="text-slate-900 dark:text-white">{formatCurrency(order.iva)}</span>
                </div>
              )}
              {order.tip > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Propina</span>
                  <span className="text-slate-900 dark:text-white">{formatCurrency(order.tip)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Customer Info (online orders, collapsible) */}
            {isOnline && (order.customerName || order.customerPhone) && (
              <Collapsible>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Datos del cliente
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-2">
                      {order.customerName && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <User className="h-4 w-4 text-slate-400" />
                          <span>{order.customerName}</span>
                        </div>
                      )}
                      {order.customerPhone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span>{order.customerPhone}</span>
                        </div>
                      )}
                      {order.deliveryAddress && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>{order.deliveryAddress}</span>
                        </div>
                      )}
                      {order.scheduledAt && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>
                            {new Date(order.scheduledAt).toLocaleString('es-MX', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                      )}
                      {order.latitude && order.longitude && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}`,
                              '_blank'
                            )
                          }
                          className="w-full mt-2"
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          Abrir en Maps
                        </Button>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Delivery status buttons (online, paid, not delivered) */}
            {isOnline && order.status && !order.delivered && onUpdateDeliveryStatus && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Actualizar estado
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateDeliveryStatus(order.id, 'PREPARING')}
                    className="text-xs"
                  >
                    <CookingPot className="h-3.5 w-3.5 mr-1" />
                    Preparando
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateDeliveryStatus(order.id, 'READY')}
                    className="text-xs"
                  >
                    <PackageCheck className="h-3.5 w-3.5 mr-1" />
                    Listo
                  </Button>
                  {order.origin === 'online-delivery' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateDeliveryStatus(order.id, 'ON_THE_WAY')}
                      className="text-xs"
                    >
                      <Truck className="h-3.5 w-3.5 mr-1" />
                      En camino
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => onUpdateDeliveryStatus(order.id, 'DELIVERED')}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs"
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    Entregado
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {onPrintClientTicket && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPrintClientTicket(order.id)}
                  disabled={isPrintingTicket}
                  className="w-full"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Ticket cliente
                </Button>
              )}
              {onPrintKitchenTicket && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPrintKitchenTicket(order.id)}
                  disabled={isPrintingTicket}
                  className="w-full"
                >
                  <UtensilsCrossed className="h-4 w-4 mr-2" />
                  Ticket cocina
                </Button>
              )}
              {!order.status && onSplitPayment && (
                <Button
                  size="sm"
                  onClick={() => onSplitPayment(order)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pagar con dos métodos
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onClose} className="w-full">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  User,
  CreditCard,
  Eye,
  Trash2,
  Edit,
  MoreVertical,
  Receipt,
  UtensilsCrossed,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { OrderResponse } from '@/domain/types';
import {
  formatOrderNumber,
  formatOrderTime,
  formatCurrency,
  getOrderOriginLabel,
  getLocalOrderMesaLine,
  getPaymentMethodIcon,
} from '@/shared/utils/order.utils';
import { cn } from '@/shared/utils';

interface OrderCardProps {
  order: OrderResponse;
  /** id mesa → nombre (lista cargada en Órdenes; el listado API no trae `table` anidada). */
  tableNameById?: Map<string, string>;
  onViewDetails: (orderId: string) => void;
  onMarkDelivered?: (orderId: string) => void;
  onProcessPayment?: (orderId: string) => void;
  onSplitPayment?: (order: OrderResponse) => void;
  onDelete?: (orderId: string) => void;
  onPrintClientTicket?: (orderId: string) => void;
  onPrintKitchenTicket?: (orderId: string) => void;
}

/**
 * Tarjeta de orden para mostrar en grid
 */
export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  tableNameById,
  onViewDetails,
  onMarkDelivered,
  onProcessPayment,
  onSplitPayment,
  onDelete,
  onPrintClientTicket,
  onPrintKitchenTicket,
}) => {
  const navigate = useNavigate();
  const originLabel = getOrderOriginLabel(order);
  const mesaLine = getLocalOrderMesaLine(order, tableNameById);
  const paymentIcon = getPaymentMethodIcon(order.paymentMethod);

  // Navegar al POS para ver/editar la orden (modo edición: permite modificar datos e ítems)
  const handleViewInPos = () => {
    navigate(`/pos?orderId=${order.id}&mode=edit`);
  };

  // Navegar al POS solo para pagar (modo pago: solo sección de pago, info de orden readonly)
  const handlePayInPos = () => {
    navigate(`/pos?orderId=${order.id}&mode=pay`);
  };

  // Determinar color del borde según estado
  const getBorderColor = () => {
    if (!order.status && !order.delivered) return 'border-l-yellow-500';
    if (!order.status && order.delivered) return 'border-l-orange-500';
    if (order.status && !order.delivered) return 'border-l-blue-500';
    if (order.status && order.delivered) return 'border-l-green-500';
    return 'border-l-gray-500';
  };

  return (
    <Card
      className={cn(
        'w-full min-w-0 hover:shadow-lg transition-shadow duration-200 border-l-4',
        getBorderColor()
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {formatOrderNumber(order.id)}
            </span>
            <OrderStatusBadge order={order} />
          </div>
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 shrink-0">
            <Clock className="h-4 w-4" />
            <span className="text-sm whitespace-nowrap">{formatOrderTime(order.date)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2">
          {/* Origen + mesa (origen Local: siempre línea de mesa con nombre si aplica) */}
          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium">{originLabel}</span>
              {mesaLine != null ? (
                <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                  {mesaLine}
                </span>
              ) : null}
            </div>
          </div>

          {/* Cliente */}
          {order.client && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-sm">{order.client}</span>
            </div>
          )}

          {/* Método de pago: solo si la orden está pagada y tiene método asignado */}
          {order.status && order.paymentMethod != null && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <CreditCard className="h-4 w-4 text-slate-400" />
              <span className="text-sm">
                {paymentIcon} {order.paymentMethod === 1 ? 'Efectivo' : order.paymentMethod === 2 ? 'Transferencia' : order.paymentMethod === 3 ? 'Tarjeta' : 'Pago dividido'}
              </span>
            </div>
          )}

          {/* Total */}
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Total</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 gap-2 flex-wrap">
        {/* Primarias: Ver detalles, Editar (si no completada) y Pagar (si pendiente) */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(order.id)}
          className="flex-1"
          title="Detalles"
        >
          <Eye className="h-4 w-4 mr-1" />
           Detalles
        </Button>
        {!(order.status && order.delivered) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewInPos}
            className="flex-1"
            title="Editar en POS"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        )}
        {!order.status && onProcessPayment && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePayInPos}
            className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <CreditCard className="h-4 w-4 mr-1" />
            Pagar
          </Button>
        )}

        {/* Menú Acciones: Pago dividido, Eliminar, Imprimir tickets */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="px-3" title="Más acciones">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px]">
            {!order.status && onSplitPayment && (
              <DropdownMenuItem onSelect={() => onSplitPayment(order)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Pago dividido
              </DropdownMenuItem>
            )}
            {onPrintClientTicket && (
              <DropdownMenuItem onSelect={() => onPrintClientTicket(order.id)}>
                <Receipt className="h-4 w-4 mr-2" />
                Imprimir ticket cliente
              </DropdownMenuItem>
            )}
            {onPrintKitchenTicket && (
              <DropdownMenuItem onSelect={() => onPrintKitchenTicket(order.id)}>
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                Imprimir ticket cocina
              </DropdownMenuItem>
            )}
            {order.status && !order.delivered && onMarkDelivered && (
              <DropdownMenuItem onSelect={() => onMarkDelivered(order.id)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar entregada
              </DropdownMenuItem>
            )}
            {!order.status && onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => onDelete(order.id)}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar orden
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};

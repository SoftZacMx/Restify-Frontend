import React from 'react';
import { Receipt, ShoppingBag, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { OrderSummary } from '@/presentation/components/pos/OrderSummary';
import { PaymentMethods } from '@/presentation/components/pos/PaymentMethods';
import type {
  OrderItem,
  CartState,
  PaymentState,
  OrderFormErrors,
  PosPaymentMethod,
} from '@/domain/types';

export interface OrderInfoDisplay {
  /** Origen/tipo: 'Local', 'Delivery', etc. */
  origin: string;
  /** Mesa asignada (solo número) si aplica */
  tableNumber?: number;
  /** Nombre del cliente si aplica */
  client?: string | null;
  /** Si viene de lista de órdenes (pago), info no editable */
  isReadOnly?: boolean;
}

interface OrderPaymentLayoutProps {
  /** Información de la orden para el resumen izquierdo */
  orderInfo: OrderInfoDisplay;
  /** Items del carrito para mostrar en resumen */
  cartItems: OrderItem[];
  /** Estado del carrito (subtotal, tax, total) */
  cartState: CartState;
  /** Estado y configuración de métodos de pago */
  paymentState: PaymentState;
  /** Errores de validación del pago */
  paymentErrors: OrderFormErrors;
  selectedMethod1: PosPaymentMethod | null;
  selectedMethod2: PosPaymentMethod | null;
  showSecondPaymentMethod: boolean;
  onShowSecondPaymentMethodChange: (show: boolean) => void;
  onPaymentAmountChange: (method: PosPaymentMethod, amount: number) => void;
  onMethod1Change: (method: PosPaymentMethod | null) => void;
  onMethod2Change: (method: PosPaymentMethod | null) => void;
  onProcessPayment: () => void;
  isProcessPaymentEnabled: boolean;
}

/**
 * Layout 50% / 50% para la vista de pago en el POS.
 * Izquierda: resumen de la orden (info + ítems).
 * Derecha: totales y métodos de pago.
 * Evita espacio en blanco y concentra toda la info en una sola fila.
 */
export const OrderPaymentLayout: React.FC<OrderPaymentLayoutProps> = ({
  orderInfo,
  cartItems,
  cartState,
  paymentState,
  paymentErrors,
  selectedMethod1,
  selectedMethod2,
  showSecondPaymentMethod,
  onShowSecondPaymentMethodChange,
  onPaymentAmountChange,
  onMethod1Change,
  onMethod2Change,
  onProcessPayment,
  isProcessPaymentEnabled,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* 50% - Resumen de la orden */}
      <div className="space-y-4">
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Resumen de la Orden</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 pt-4 space-y-4">
            {/* Info de la orden */}
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Tipo de orden
                </p>
                <p className="text-base text-slate-900 dark:text-slate-100 font-medium">
                  {orderInfo.origin}
                </p>
              </div>
              {orderInfo.tableNumber != null && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Mesa
                    </p>
                    <p className="text-base text-slate-900 dark:text-slate-100 font-medium">
                      Mesa {orderInfo.tableNumber}
                    </p>
                  </div>
                </div>
              )}
              {orderInfo.client && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Cliente
                    </p>
                    <p className="text-base text-slate-900 dark:text-slate-100 font-medium">
                      {orderInfo.client}
                    </p>
                  </div>
                </div>
              )}
              {orderInfo.isReadOnly && (
                <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                  La información de la orden no se puede modificar aquí. Para editar, usa &quot;Ver/Editar&quot; desde la lista de órdenes.
                </p>
              )}
            </div>

            {/* Lista compacta de ítems */}
            <div className="flex-1 min-h-0">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Ítems ({cartItems.length})
                </span>
              </div>
              <div className="max-h-[320px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2 bg-slate-50/50 dark:bg-slate-800/30">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start gap-2 py-2 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        x{item.quantity}
                        {item.selectedExtras.length > 0 && (
                          <span className="ml-1">
                            · +{item.selectedExtras.length} extra{item.selectedExtras.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 shrink-0">
                      ${item.itemTotal.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 50% - Información de pago */}
      <div className="space-y-4">
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700">
            <CardTitle className="text-xl">Pago</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 pt-4 space-y-4">
            <OrderSummary cartState={cartState} />
            <PaymentMethods
              paymentState={paymentState}
              errors={paymentErrors}
              selectedMethod1={selectedMethod1}
              selectedMethod2={selectedMethod2}
              showSecondPaymentMethod={showSecondPaymentMethod}
              onShowSecondPaymentMethodChange={onShowSecondPaymentMethodChange}
              onPaymentAmountChange={onPaymentAmountChange}
              onMethod1Change={onMethod1Change}
              onMethod2Change={onMethod2Change}
            />
            <Button
              onClick={onProcessPayment}
              disabled={!isProcessPaymentEnabled}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all mt-auto"
              size="lg"
              data-testid="pay-order"
            >
              <Receipt className="h-5 w-5 mr-2" />
              Procesar Pago
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

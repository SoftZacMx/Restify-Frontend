import React from 'react';
import { Receipt, UtensilsCrossed } from 'lucide-react';
import { PaymentMethods } from '@/presentation/components/pos/PaymentMethods';
import { formatOrderNumber } from '@/shared/utils/order.utils';
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
  /** ID de la orden para mostrar en header (ej. "Orden #ABC12345") */
  orderId?: string;
}

interface OrderPaymentLayoutProps {
  orderInfo: OrderInfoDisplay;
  cartItems: OrderItem[];
  cartState: CartState;
  paymentState: PaymentState;
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
 * Vista de pago tipo Checkout: header (Checkout + orden), izquierda Order Summary, derecha Payment Method.
 * UI alineada con diseño de referencia (botones horizontales, Amount Received, Change to Return, etc.).
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
  const subtitle = [
    orderInfo.orderId && `Orden ${formatOrderNumber(orderInfo.orderId)}`,
    orderInfo.tableNumber != null && `Mesa ${orderInfo.tableNumber}`,
    orderInfo.client && orderInfo.client,
  ]
    .filter(Boolean)
    .join(' • ') || 'Orden';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-lg">
      {/* Header tipo Checkout */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Receipt className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Checkout</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Columna izquierda: Order Summary */}
        <div className="border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700 p-6 flex flex-col min-h-0">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            Resumen de la orden
          </h3>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4" data-testid="order-items">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 items-start"
                data-testid="order-item"
              >
                <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UtensilsCrossed className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 dark:text-white truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.quantity}x
                    {item.selectedExtras.length > 0 &&
                      ` • ${item.selectedExtras.map((e) => e.name).join(', ')}`}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white shrink-0" data-testid="order-item-total">
                  ${item.itemTotal.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Desglose: Subtotal, Tax, Total */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
              <span className="font-medium text-slate-900 dark:text-white" data-testid="order-subtotal">
                ${cartState.subtotal.toFixed(2)}
              </span>
            </div>
            {cartState.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">IVA</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  ${cartState.tax.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
              <span className="text-xl font-bold text-primary" data-testid="order-total" aria-label={`Total de la orden ${cartState.total.toFixed(2)}`}>
                ${cartState.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Columna derecha: Payment Method */}
        <div className="p-6 flex flex-col">
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
            onProcessPayment={onProcessPayment}
            isProcessPaymentEnabled={isProcessPaymentEnabled}
          />
        </div>
      </div>
    </div>
  );
};

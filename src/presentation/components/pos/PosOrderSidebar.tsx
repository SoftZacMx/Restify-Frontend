import { Button } from '@/presentation/components/ui/button';
import { Cart } from './Cart';
import { OrderOriginCard } from './OrderOriginCard';
import type {
  OrderItem,
  OrderType,
  CartState,
  Table,
  OrderFormErrors,
  CreateOrderResponse,
} from '@/domain/types';

interface PosOrderSidebarProps {
  cartItems: OrderItem[];
  cartState: CartState;
  onRemoveItem: (itemId: string) => void;
  orderType: OrderType | null;
  onOrderTypeChange: (type: OrderType | null) => void;
  selectedTable: Table | undefined;
  onSelectTableClick: () => void;
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  validationErrors: Pick<OrderFormErrors, 'tableId' | 'customerName'>;
  isPaymentOnlyMode: boolean;
  isOrderValid: boolean;
  isSavingOrder: boolean;
  hasLoadedOrder: boolean;
  savedOrder: CreateOrderResponse | null;
  onSaveOrder: () => void;
  onContinueToPayment: () => void;
}

export function PosOrderSidebar({
  cartItems,
  cartState,
  onRemoveItem,
  orderType,
  onOrderTypeChange,
  selectedTable,
  onSelectTableClick,
  customerName,
  onCustomerNameChange,
  validationErrors,
  isPaymentOnlyMode,
  isOrderValid,
  isSavingOrder,
  hasLoadedOrder,
  savedOrder,
  onSaveOrder,
  onContinueToPayment,
}: PosOrderSidebarProps) {
  return (
    <div className="flex md:col-span-2 flex-col gap-6 min-h-0 h-full overflow-hidden">
      {/* Carrito */}
      <div className="min-h-0 flex-1 flex flex-col overflow-hidden">
        <Cart
          items={cartItems}
          onRemoveItem={onRemoveItem}
          readOnly={false}
          className="h-full"
        />
      </div>

      {/* Origen de la orden */}
      {!isPaymentOnlyMode && (
        <OrderOriginCard
          orderType={orderType}
          onOrderTypeChange={(type) => {
            onOrderTypeChange(type);
            if (type === 'DINE_IN') onSelectTableClick();
          }}
          selectedTable={selectedTable}
          onSelectTableClick={onSelectTableClick}
          customerName={customerName}
          onCustomerNameChange={onCustomerNameChange}
          validationErrors={validationErrors}
        />
      )}

      {/* Total */}
      {cartItems.length > 0 && (
        <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total</span>
          <span className="text-lg font-bold text-primary" data-testid="cart-total" aria-label={`Total de la orden ${cartState.total.toFixed(2)}`}>
            ${cartState.total.toFixed(2)}
          </span>
        </div>
      )}

      {/* Acciones */}
      <div className="space-y-3 shrink-0">
        <Button
          onClick={onSaveOrder}
          disabled={cartItems.length === 0 || !isOrderValid || isSavingOrder}
          className="w-full shadow-md hover:shadow-lg transition-all"
          variant="outline"
          size="lg"
        >
          {isSavingOrder
            ? 'Guardando...'
            : hasLoadedOrder
              ? 'Guardar Cambios'
              : 'Guardar Orden'}
        </Button>
        {savedOrder && !savedOrder.status && (
          <Button
            onClick={onContinueToPayment}
            disabled={cartItems.length === 0 || !isOrderValid}
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            Continuar al Pago
          </Button>
        )}
      </div>
    </div>
  );
}

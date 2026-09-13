import React from 'react';
import { Loader2, PackageOpen } from 'lucide-react';
import { OrderCard } from './OrderCard';
import type { OrderResponse } from '@/domain/types';
import type { EditablePaymentMethod } from '@/shared/utils/order.utils';

interface OrdersGridProps {
  orders: OrderResponse[];
  /** Mapa ubicación id → nombre para mostrar en órdenes locales */
  tableNameById?: Map<string, string>;
  isLoading?: boolean;
  error?: string | null;
  onViewDetails: (orderId: string) => void;
  onMarkDelivered?: (orderId: string) => void;
  onProcessPayment?: (orderId: string) => void;
  onDelete?: (orderId: string) => void;
  onPrintClientTicket?: (orderId: string) => void;
  onPrintKitchenTicket?: (orderId: string) => void;
  onChangePaymentMethod?: (order: OrderResponse, method: EditablePaymentMethod) => void;
}

/**
 * Grid de tarjetas de órdenes
 */
export const OrdersGrid: React.FC<OrdersGridProps> = ({
  orders,
  tableNameById,
  isLoading,
  error,
  onViewDetails,
  onMarkDelivered,
  onProcessPayment,
  onDelete,
  onPrintClientTicket,
  onPrintKitchenTicket,
  onChangePaymentMethod,
}) => {
  // Estado de carga
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando órdenes...</p>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-destructive-suave rounded-full p-4 mb-4">
          <PackageOpen className="h-10 w-10 text-destructive" />
        </div>
        <p className="text-destructive font-medium mb-2">Error al cargar órdenes</p>
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  // Estado vacío
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-muted rounded-full p-4 mb-4">
          <PackageOpen className="h-10 w-10 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium mb-1">
          No hay órdenes
        </p>
        <p className="text-muted-foreground text-sm">
          Las órdenes aparecerán aquí cuando se creen
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {orders.map((order) => (
        <div key={order.id} className="min-w-0">
          <OrderCard
            order={order}
            tableNameById={tableNameById}
            onViewDetails={onViewDetails}
            onMarkDelivered={onMarkDelivered}
            onProcessPayment={onProcessPayment}
            onDelete={onDelete}
            onPrintClientTicket={onPrintClientTicket}
            onPrintKitchenTicket={onPrintKitchenTicket}
            onChangePaymentMethod={onChangePaymentMethod}
          />
        </div>
      ))}
    </div>
  );
};

import React from 'react';
import { Loader2, PackageOpen } from 'lucide-react';
import { OrderCard } from './OrderCard';
import type { OrderResponse } from '@/domain/types';

interface OrdersGridProps {
  orders: OrderResponse[];
  isLoading?: boolean;
  error?: string | null;
  onViewDetails: (orderId: string) => void;
  onMarkDelivered?: (orderId: string) => void;
  onProcessPayment?: (orderId: string) => void;
  onSplitPayment?: (order: OrderResponse) => void;
  onDelete?: (orderId: string) => void;
  onPrintClientTicket?: (orderId: string) => void;
  onPrintKitchenTicket?: (orderId: string) => void;
}

/**
 * Grid de tarjetas de órdenes
 */
export const OrdersGrid: React.FC<OrdersGridProps> = ({
  orders,
  isLoading,
  error,
  onViewDetails,
  onMarkDelivered,
  onProcessPayment,
  onSplitPayment,
  onDelete,
  onPrintClientTicket,
  onPrintKitchenTicket,
}) => {
  // Estado de carga
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Cargando órdenes...</p>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-full p-4 mb-4">
          <PackageOpen className="h-10 w-10 text-red-500" />
        </div>
        <p className="text-red-600 dark:text-red-400 font-medium mb-2">Error al cargar órdenes</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{error}</p>
      </div>
    );
  }

  // Estado vacío
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-4 mb-4">
          <PackageOpen className="h-10 w-10 text-slate-400" />
        </div>
        <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">
          No hay órdenes
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Las órdenes aparecerán aquí cuando se creen
        </p>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {orders.map((order) => (
        <div key={order.id} className="min-w-0">
          <OrderCard
            order={order}
            onViewDetails={onViewDetails}
            onMarkDelivered={onMarkDelivered}
            onProcessPayment={onProcessPayment}
            onSplitPayment={onSplitPayment}
            onDelete={onDelete}
            onPrintClientTicket={onPrintClientTicket}
            onPrintKitchenTicket={onPrintKitchenTicket}
          />
=======
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 min-w-0">
      {orders.map((order) => (
        <div key={order.id} className="min-w-0">
          <OrderCard
          order={order}
          onViewDetails={onViewDetails}
          onMarkDelivered={onMarkDelivered}
          onProcessPayment={onProcessPayment}
          onSplitPayment={onSplitPayment}
          onDelete={onDelete}
          onPrintClientTicket={onPrintClientTicket}
          onPrintKitchenTicket={onPrintKitchenTicket}
        />
>>>>>>> 840d6d75767b5c6aa0760f1a81178da924491aaa
        </div>
      ))}
    </div>
  );
};

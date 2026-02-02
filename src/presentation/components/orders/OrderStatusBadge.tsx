import React from 'react';
import { Badge } from '@/presentation/components/ui/badge';
import type { OrderResponse } from '@/domain/types';
import { getOrderStatusInfo } from '@/shared/utils/order.utils';
import { cn } from '@/shared/utils';

interface OrderStatusBadgeProps {
  order: OrderResponse;
  className?: string;
}

/**
 * Badge que muestra el estado de una orden con colores
 */
export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ order, className }) => {
  const statusInfo = getOrderStatusInfo(order);

  return (
    <Badge className={cn(statusInfo.bgClass, statusInfo.textClass, 'font-medium', className)}>
      {statusInfo.label}
    </Badge>
  );
};

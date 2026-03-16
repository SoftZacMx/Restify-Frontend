import React from 'react';
import { UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { OrderType } from '@/domain/types';

interface OrderTypeSelectorProps {
  orderType: OrderType | null;
  onOrderTypeChange: (type: OrderType | null) => void;
}

/**
 * Componente OrderTypeSelector
 * Responsabilidad única: Permitir seleccionar el tipo de orden
 * Cumple SRP: Solo maneja la selección del tipo de orden
 */
export const OrderTypeSelector: React.FC<OrderTypeSelectorProps> = ({
  orderType,
  onOrderTypeChange,
}) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <Button
        variant={orderType === 'DINE_IN' ? 'default' : 'outline'}
        onClick={() => onOrderTypeChange(orderType === 'DINE_IN' ? null : 'DINE_IN')}
        className={cn(
          'w-full flex items-center justify-center gap-2 h-14',
          orderType === 'DINE_IN' && 'bg-primary text-white'
        )}
      >
        <UtensilsCrossed className="h-5 w-5" />
        <span className="font-semibold">Para Comer Aquí</span>
      </Button>
      <Button
        variant={orderType === 'TAKEOUT' ? 'default' : 'outline'}
        onClick={() => onOrderTypeChange(orderType === 'TAKEOUT' ? null : 'TAKEOUT')}
        className={cn(
          'w-full flex items-center justify-center gap-2 h-14',
          orderType === 'TAKEOUT' && 'bg-primary text-white'
        )}
      >
        <ShoppingBag className="h-5 w-5" />
        <span className="font-semibold">Para Llevar</span>
      </Button>
    </div>
  );
};

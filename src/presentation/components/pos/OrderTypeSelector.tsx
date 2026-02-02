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
    <div className="flex gap-4">
      <Button
        variant={orderType === 'DINE_IN' ? 'default' : 'outline'}
        onClick={() => onOrderTypeChange(orderType === 'DINE_IN' ? null : 'DINE_IN')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 h-20',
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
          'flex-1 flex items-center justify-center gap-2 h-20',
          orderType === 'TAKEOUT' && 'bg-primary text-white'
        )}
      >
        <ShoppingBag className="h-5 w-5" />
        <span className="font-semibold">Para Llevar</span>
      </Button>
    </div>
  );
};

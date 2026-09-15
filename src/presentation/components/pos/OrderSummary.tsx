import React, { useState, useEffect, useRef } from 'react';
import { Receipt, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import type { CartState } from '@/domain/types';

interface OrderSummaryProps {
  cartState: CartState;
}

/**
 * Componente OrderSummary
 * Responsabilidad única: Mostrar el resumen de la orden con totales
 * Animación sutil cuando cambia el total
 */
export const OrderSummary: React.FC<OrderSummaryProps> = ({ cartState }) => {
  const [animateTotal, setAnimateTotal] = useState(false);
  const prevTotalRef = useRef<number>(cartState.total);

  useEffect(() => {
    if (prevTotalRef.current !== cartState.total) {
      prevTotalRef.current = cartState.total;
      setAnimateTotal(true);
      const t = setTimeout(() => setAnimateTotal(false), 400);
      return () => clearTimeout(t);
    }
  }, [cartState.total]);

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-muted to-card dark:from-card dark:to-card">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Resumen de Orden</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-center py-2">
          <span className="text-sm font-medium text-muted-foreground">
            Subtotal:
          </span>
          <span className="font-semibold text-foreground" data-testid="order-subtotal" aria-label={`Subtotal ${cartState.subtotal.toFixed(2)}`}>
            ${cartState.subtotal.toFixed(2)}
          </span>
        </div>
        <div className="border-t-2 border-border pt-4 mt-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-h3 text-foreground">Total:</span>
            </div>
            <div className="text-right">
              <span
                className={`text-h1 text-primary inline-block ${animateTotal ? 'animate-total-bump' : ''}`}
                data-testid="order-total"
                aria-label={`Total de la orden ${cartState.total.toFixed(2)}`}
              >
                ${cartState.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

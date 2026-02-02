import React from 'react';
import { Trash2, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';
import type { OrderItem } from '@/domain/types';

interface CartProps {
  items: OrderItem[];
  onRemoveItem: (itemId: string) => void;
  readOnly?: boolean;
}

/**
 * Componente Cart
 * Responsabilidad única: Mostrar y gestionar los items del carrito
 * Cumple SRP: Solo maneja la visualización y acciones del carrito
 */
export const Cart: React.FC<CartProps> = ({ items, onRemoveItem, readOnly = false }) => {
  if (items.length === 0) {
    return (
      <Card className="border-2 border-dashed border-slate-200 dark:border-slate-700">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <ShoppingBag className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-base font-medium text-slate-600 dark:text-slate-400">
              El carrito está vacío
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              Agrega productos para comenzar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Carrito</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 bg-white dark:bg-slate-800 hover:shadow-md transition-all duration-200 hover:border-primary/30"
          >
            {/* Nombre del platillo */}
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2">
                  <h4 className="font-semibold text-base text-slate-900 dark:text-slate-100 leading-tight">
                    {item.product.name}
                  </h4>
                </div>
                <Badge variant="outline" className="text-xs font-normal">
                  x{item.quantity}
                </Badge>
              </div>
              {!readOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Extras */}
            {item.selectedExtras.length > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                  Extras
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.selectedExtras.map((extra) => (
                    <Badge
                      key={extra.id}
                      variant="secondary"
                      className="text-xs font-normal bg-primary/10 text-primary border-primary/20"
                    >
                      {extra.name}
                      <span className="ml-1 font-semibold">
                        +${extra.price.toFixed(2)}
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Total del item */}
            <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total:
                </span>
                <div className="text-right">
                  <div className="font-bold text-xl text-primary">
                    ${item.itemTotal.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    ${item.itemSubtotal.toFixed(2)} + IVA
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

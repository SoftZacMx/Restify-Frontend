import React, { useState } from 'react';
import { Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Switch } from '@/presentation/components/ui/switch';
import { Label } from '@/presentation/components/ui/label';
import { cn } from '@/shared/lib/utils';
import type { PosProduct } from '@/domain/types';

interface ProductExtrasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: PosProduct | null;
  onAddToCart: (product: PosProduct, quantity: number, selectedExtras: PosProduct[]) => void;
  availableExtras?: PosProduct[]; // Extras cargados desde el backend
}

/**
 * Componente ProductExtrasDialog
 * Responsabilidad única: Permitir seleccionar extras y cantidad de un producto
 * Cumple SRP: Solo maneja la selección de extras
 */
export const ProductExtrasDialog: React.FC<ProductExtrasDialogProps> = ({
  open,
  onOpenChange,
  product,
  onAddToCart,
  availableExtras = [],
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<PosProduct[]>([]);
  const [showExtras, setShowExtras] = useState(false);

  // Reset extras visibility when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setShowExtras(false);
      setQuantity(1);
      setSelectedExtras([]);
    }
  }, [open, product]);

  if (!product) return null;

  const handleExtraToggle = (extra: PosProduct) => {
    setSelectedExtras((prev) => {
      const isSelected = prev.some((e) => e.id === extra.id);
      if (isSelected) {
        return prev.filter((e) => e.id !== extra.id);
      }
      return [...prev, extra];
    });
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedExtras);
    // Reset state
    setQuantity(1);
    setSelectedExtras([]);
    setShowExtras(false);
  };

  const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);

  const itemSubtotal = (product.price + extrasTotal) * quantity;
  const itemTax = itemSubtotal * 0.16;
  const itemTotalWithTax = itemSubtotal + itemTax;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">{product.name}</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-6">
          {/* Descripción del producto */}
          {product.description && (
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-slate-700 dark:text-slate-300">{product.description}</p>
            </div>
          )}

          {/* Cantidad */}
          <div className="space-y-3">
            <Label className="text-base font-medium block text-center">Cantidad</Label>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="h-10 w-10"
              >
                <Minus className="h-5 w-5" />
              </Button>
              <span className="text-xl font-bold w-16 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(1)}
                className="h-10 w-10"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Botón para mostrar/ocultar extras */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Extras (Opcional)</Label>
              {availableExtras.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExtras(!showExtras)}
                  className="flex items-center gap-2"
                >
                  {showExtras ? (
                    <>
                      <span>Ocultar Extras</span>
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Ver Extras Disponibles ({availableExtras.length})</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>

              {/* Lista de extras seleccionados */}
              {selectedExtras.length > 0 && (
                <div className="p-3 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-2">Extras seleccionados:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedExtras.map((extra) => (
                      <span
                        key={extra.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs font-medium rounded"
                      >
                        {extra.name}
                        <span className="opacity-90">(+${extra.price.toFixed(2)})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista de extras disponibles (colapsable) */}
              {showExtras && (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-700/30">
                  {availableExtras.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                      No hay extras disponibles para este producto
                    </p>
                  ) : (
                    availableExtras.map((extra) => {
                      const isSelected = selectedExtras.some((e) => e.id === extra.id);
                      return (
                        <div
                          key={extra.id}
                          className={cn(
                            'flex items-center justify-between p-4 rounded-lg border-2 transition-all',
                            isSelected
                              ? 'border-primary bg-primary/10 dark:bg-primary/20'
                              : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-primary/50 cursor-pointer'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExtraToggle(extra);
                          }}
                        >
                          <div className="flex-1">
                            <div
                              className={cn(
                                'font-semibold',
                                isSelected
                                  ? 'text-primary dark:text-primary'
                                  : 'text-slate-900 dark:text-slate-100'
                              )}
                            >
                              {extra.name}
                            </div>
                            {extra.description && (
                              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {extra.description}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-primary min-w-[70px] text-right">
                              +${extra.price.toFixed(2)}
                            </span>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExtraToggle(extra);
                              }}
                            >
                              <Switch
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  if (checked !== isSelected) {
                                    handleExtraToggle(extra);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Mensaje si no hay extras disponibles */}
              {availableExtras.length === 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                    Este producto no tiene extras disponibles
                  </p>
                </div>
              )}
          </div>

          {/* Resumen detallado */}
          <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-4 space-y-3 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Precio base:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                ${product.price.toFixed(2)}
              </span>
            </div>
            {extrasTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Extras seleccionados:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  +${extrasTotal.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Cantidad:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">x{quantity}</span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-700 dark:text-slate-300">Subtotal:</span>
              <span className="text-slate-900 dark:text-slate-100">
                ${itemSubtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">IVA (16%):</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                ${itemTax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t-2 border-slate-300 dark:border-slate-600">
              <span className="text-slate-900 dark:text-slate-100">Total:</span>
              <span className="text-primary">${itemTotalWithTax.toFixed(2)}</span>
            </div>
          </div>

          {/* Botón agregar */}
          <Button onClick={handleAdd} className="w-full h-12 text-base font-semibold" size="lg">
            Agregar al Carrito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

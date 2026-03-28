import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, X, UtensilsCrossed, ShoppingCart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { ExtrasSelectionDialog } from '@/presentation/components/pos/ExtrasSelectionDialog';
import type { PosProduct } from '@/domain/types';
import type { Category } from '@/domain/types';

interface ProductExtrasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: PosProduct | null;
  onAddToCart: (product: PosProduct, quantity: number, selectedExtras: PosProduct[], note?: string | null) => void;
  availableExtras?: PosProduct[];
  categories?: Category[];
}

/**
 * Vista de selección de producto: imagen, cantidad, extras seleccionados,
 * botón "Agregar más" (abre ExtrasSelectionDialog), desglose de precio y Agregar al Carrito.
 */
export const ProductExtrasDialog: React.FC<ProductExtrasDialogProps> = ({
  open,
  onOpenChange,
  product,
  onAddToCart,
  availableExtras = [],
  categories = [],
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<PosProduct[]>([]);
  const [note, setNote] = useState('');
  const [isExtrasPickerOpen, setIsExtrasPickerOpen] = useState(false);
  const [animateTotal, setAnimateTotal] = useState(false);
  const prevSubtotalRef = useRef<number>(0);

  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const itemSubtotal = product ? (product.price + extrasTotal) * quantity : 0;

  React.useEffect(() => {
    if (open) {
      setQuantity(1);
      setSelectedExtras([]);
      setNote('');
      setIsExtrasPickerOpen(false);
      prevSubtotalRef.current = product ? product.price : 0;
    }
  }, [open, product]);

  useEffect(() => {
    if (!open || !product) return;
    if (prevSubtotalRef.current !== itemSubtotal) {
      prevSubtotalRef.current = itemSubtotal;
      setAnimateTotal(true);
      const t = setTimeout(() => setAnimateTotal(false), 400);
      return () => clearTimeout(t);
    }
  }, [open, product, itemSubtotal]);

  if (!product) return null;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedExtras, note.trim() || null);
    setQuantity(1);
    setSelectedExtras([]);
    setNote('');
    onOpenChange(false);
  };

  const removeExtra = (extra: PosProduct) => {
    setSelectedExtras((prev) => prev.filter((e) => e.id !== extra.id));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[min(26rem,95vw)] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {/* Header: icono + título + subtítulo + cerrar */}
          <DialogHeader className="flex-row items-start gap-3 px-5 pt-5 pb-4 shrink-0 border-b border-slate-200 dark:border-slate-700">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary">
              <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {product.name}
              </DialogTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Personaliza tu platillo favorito
              </p>
            </div>
            <DialogClose className="rounded-lg p-1.5 -mr-1" />
          </DialogHeader>

          {/* Botón Agregar al Carrito fijo arriba */}
          <div className="shrink-0 px-5 py-3 border-b border-slate-200 dark:border-slate-700">
            <Button
              onClick={handleAddToCart}
              className="w-full h-12 text-base font-semibold rounded-lg bg-primary hover:bg-primary/90"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Agregar al Carrito — ${itemSubtotal.toFixed(2)}
            </Button>
          </div>

          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
            {/* Imagen del producto: tamaño fijo, no se compacta */}
            <div className="shrink-0 w-full h-44 bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                  <UtensilsCrossed className="h-16 w-16 text-primary/60" />
                </div>
              )}
            </div>

            <div className="p-5 space-y-5">
              {/* Cantidad */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Cantidad
                </span>
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 p-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="h-9 w-9 rounded-md"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center text-base font-semibold text-slate-900 dark:text-white tabular-nums">
                    {quantity}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    className="h-9 w-9 rounded-md"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Extras seleccionados + Agregar más */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Extras seleccionados
                  </span>
                  {selectedExtras.length > 0 && (
                    <span className="text-sm font-medium text-primary">
                      {selectedExtras.length} seleccionado{selectedExtras.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {selectedExtras.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedExtras.map((extra) => (
                      <span
                        key={extra.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                      >
                        {extra.name}
                        <button
                          type="button"
                          onClick={() => removeExtra(extra)}
                          className="rounded p-0.5 hover:bg-white/20"
                          aria-label={`Quitar ${extra.name}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {availableExtras.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExtrasPickerOpen(true)}
                    className="w-full rounded-lg"
                  >
                    Extras
                  </Button>
                )}
                {availableExtras.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No hay extras disponibles</p>
                )}
              </div>

              {/* Nota del item (opcional, máx 50 caracteres) */}
              <div className="space-y-2">
                <Label htmlFor="item-note" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Nota (opcional)
                </Label>
                <Input
                  id="item-note"
                  type="text"
                  placeholder="Ej: Sin cebolla, bien cocido..."
                  maxLength={50}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                  aria-describedby="item-note-count"
                />
                <p id="item-note-count" className="text-xs text-slate-500 dark:text-slate-400 text-right">
                  {note.length}/50
                </p>
              </div>

              {/* Desglose de precio */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Precio Base</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                {selectedExtras.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Extras ({selectedExtras.length})</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      ${extrasTotal.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Cantidad</span>
                  <span className="font-medium text-slate-900 dark:text-white">x {quantity}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
                  <span
                    className={`text-xl font-bold text-primary inline-block ${animateTotal ? 'animate-total-bump' : ''}`}
                  >
                    ${itemSubtotal.toFixed(2)}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ExtrasSelectionDialog
        open={isExtrasPickerOpen}
        onOpenChange={setIsExtrasPickerOpen}
        availableExtras={availableExtras}
        categories={categories}
        initialSelectedExtras={selectedExtras}
        onApply={(extras) => setSelectedExtras(extras)}
      />
    </>
  );
};

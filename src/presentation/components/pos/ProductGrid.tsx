import React, { useMemo } from 'react';
import { Package, Plus, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/shared/utils';
import { getCategoryColor, getCategoryIcon } from '@/shared/utils/pos-category-visual.utils';
import type { PosProduct, Category, OrderItem } from '@/domain/types';

interface ProductGridProps {
  products: PosProduct[];
  categories: Category[];
  cartItems: OrderItem[];
  onProductSelect: (product: PosProduct) => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Componente ProductGrid
 * Lista de productos en formato card compacto (misma estructura en móvil y
 * desktop): imagen baja, card completa clickeable, botón "+" flotante y
 * badge de cantidad si el producto ya está en el carrito.
 */
export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  cartItems,
  onProductSelect,
  isLoading = false,
  error = null,
}) => {
  /** Cantidad total en carrito por producto (suma si se agregó varias veces con distintos extras/notas). */
  const quantityByProductId = useMemo(() => {
    const map = new Map<string, number>();
    cartItems.forEach((item) => {
      map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
    });
    return map;
  }, [cartItems]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No hay productos disponibles</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((product) => {
        const categoryColor = getCategoryColor(product.categoryId, categories);
        const categoryIcon = getCategoryIcon(product.categoryId, categories);
        const quantityInCart = quantityByProductId.get(product.id) ?? 0;

        return (
          <button
            key={product.id}
            type="button"
            onClick={() => onProductSelect(product)}
            className={`group relative text-left rounded-xl border bg-card overflow-hidden flex flex-col shadow-sm transition-all hover:shadow-md hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              quantityInCart > 0 ? 'border-primary' : 'border-border'
            }`}
          >
            {quantityInCart > 0 && (
              <span className="absolute top-2 left-2 z-10 h-6 min-w-6 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                x{quantityInCart}
              </span>
            )}

            <div className="h-24 sm:h-28 w-full bg-muted flex items-center justify-center overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${categoryColor.bg}`}>
                  {categoryIcon ? (
                    <span className="text-h2">{categoryIcon}</span>
                  ) : (
                    <Package className={`h-8 w-8 ${categoryColor.text} opacity-80`} />
                  )}
                </div>
              )}
            </div>

            <div className="p-2.5 flex flex-col gap-0.5">
              <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
                {product.name}
              </h3>
              <p className="text-sm font-bold text-foreground">{formatCurrency(product.price)}</p>
            </div>

            <span className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-sm group-hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4 text-primary-foreground" />
            </span>
          </button>
        );
      })}
    </div>
  );
};

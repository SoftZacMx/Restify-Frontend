import React from 'react';
import { Package, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import type { PosProduct } from '@/domain/types';

interface ProductGridProps {
  products: PosProduct[];
  onProductSelect: (product: PosProduct) => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Componente ProductGrid
 * Lista de productos: 3 por fila (2 en móvil), estilo tarjeta con imagen/placeholder,
 * nombre, precio, descripción y botón Agregar.
 */
export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductSelect,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-slate-400 mb-4" />
        <p className="text-slate-500 dark:text-slate-400">No hay productos disponibles</p>
      </div>
    );
  }

  return (
    <>
      {/* Vista compacta en móvil (lista) */}
      <div className="flex flex-col gap-2 md:hidden">
        {products.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => onProductSelect(product)}
            className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center overflow-hidden">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <Package className="h-6 w-6 text-primary opacity-80" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                {product.name}
              </h3>
              <p className="text-primary font-semibold text-sm">${product.price.toFixed(2)}</p>
            </div>
            <div className="shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Vista grid en desktop/tablet */}
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        {products.map((product) => (
          <article
            key={product.id}
            className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="aspect-square w-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
                  <Package className="h-12 w-12 text-primary opacity-80" />
                </div>
              )}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 mb-1">
                {product.name}
              </h3>
              <p className="text-primary font-semibold mb-2">${product.price.toFixed(2)}</p>
              {product.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                  {product.description}
                </p>
              )}
              <Button
                onClick={() => onProductSelect(product)}
                className="w-full mt-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Agregar
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
};

import React from 'react';
import { Package, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { cn } from '@/shared/lib/utils';
import type { PosProduct } from '@/domain/types';

interface ProductGridProps {
  products: PosProduct[];
  onProductSelect: (product: PosProduct) => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Componente ProductGrid
 * Responsabilidad única: Mostrar productos en formato de grid
 * Cumple SRP: Solo renderiza la lista de productos
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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <Card
          key={product.id}
          className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 cursor-pointer overflow-hidden flex flex-col"
        >
          <CardContent className="p-0 flex flex-col h-full">
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1 text-slate-900 dark:text-slate-100 line-clamp-2">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="mt-2">
                  <p className="text-lg font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 pt-0 border-t border-slate-200 dark:border-slate-700">
              <Button
                onClick={() => onProductSelect(product)}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

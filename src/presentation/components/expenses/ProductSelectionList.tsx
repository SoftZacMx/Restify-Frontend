import React from 'react';
import { ProductSelectionItem, type ProductSelectionItemData } from './ProductSelectionItem';

interface ProductSelectionListProps {
  products: ProductSelectionItemData[];
  selectedId: string | null;
  onSelect: (product: ProductSelectionItemData) => void;
}

/**
 * Lista de productos para selección única (usa ProductSelectionItem por ítem).
 */
export const ProductSelectionList: React.FC<ProductSelectionListProps> = ({
  products,
  selectedId,
  onSelect,
}) => {
  if (products.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
        No hay productos que coincidan con la búsqueda.
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
      {products.map((product) => (
        <ProductSelectionItem
          key={product.id}
          product={product}
          selected={selectedId === product.id}
          onSelect={() => onSelect(product)}
        />
      ))}
    </div>
  );
};

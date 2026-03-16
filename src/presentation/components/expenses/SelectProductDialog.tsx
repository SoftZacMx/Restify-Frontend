import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from '@/presentation/components/ui/dialog';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { ProductSelectionList } from './ProductSelectionList';
import type { ProductSelectionItemData } from './ProductSelectionItem';

interface SelectProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ProductSelectionItemData[];
  onSelect: (product: ProductSelectionItemData) => void;
}

/**
 * Diálogo para seleccionar un producto: barra de búsqueda reactiva y lista con selección única.
 */
export const SelectProductDialog: React.FC<SelectProductDialogProps> = ({
  open,
  onOpenChange,
  products,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductSelectionItemData | null>(null);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedProduct(null);
    }
  }, [open]);

  const handleConfirm = () => {
    if (selectedProduct) {
      onSelect(selectedProduct);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="pr-8">Seleccionar Producto</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0 flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Buscar productos por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          <ProductSelectionList
            products={filteredProducts}
            selectedId={selectedProduct?.id ?? null}
            onSelect={setSelectedProduct}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!selectedProduct}>
            Añadir seleccionado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

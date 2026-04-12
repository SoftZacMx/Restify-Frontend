import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { CategoryFilter } from './CategoryFilter';
import { ProductGrid } from './ProductGrid';
import type { PosProduct, Category } from '@/domain/types';

interface PosProductSectionProps {
  productSearch: string;
  onProductSearchChange: (value: string) => void;
  categories: Category[];
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  filteredProducts: PosProduct[];
  onProductSelect: (product: PosProduct) => void;
  isLoading: boolean;
  error: string | null;
}

export function PosProductSection({
  productSearch,
  onProductSearchChange,
  categories,
  selectedCategoryId,
  onCategorySelect,
  filteredProducts,
  onProductSelect,
  isLoading,
  error,
}: PosProductSectionProps) {
  return (
    <div className="lg:col-span-3 flex flex-col min-h-0 h-full">
      <Card className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <CardHeader className="shrink-0">
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 min-h-0 gap-4 p-4 pt-0 overflow-hidden">
          <div className="relative shrink-0 sticky top-0 z-10 bg-card pb-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <Input
              type="search"
              placeholder="Buscar platos, categorías o ingredientes..."
              value={productSearch}
              onChange={(e) => onProductSearchChange(e.target.value)}
              className="pl-9 shadow-none border-slate-200 dark:border-slate-600"
              aria-label="Buscar productos"
            />
          </div>
          <CategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={onCategorySelect}
          />
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
            <ProductGrid
              products={filteredProducts}
              onProductSelect={onProductSelect}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

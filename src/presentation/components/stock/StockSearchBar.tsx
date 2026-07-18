import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Switch } from '@/presentation/components/ui/switch';
import type { StockListFilters } from '@/domain/types';

interface StockSearchBarProps {
  filters: StockListFilters;
  onFiltersChange: (filters: StockListFilters) => void;
}

/**
 * Componente StockSearchBar
 * Responsabilidad única: Renderizar barra de búsqueda y filtros del listado de stock
 * Cumple SRP: Solo maneja la UI de filtros (búsqueda + bajo mínimo)
 */
export const StockSearchBar: React.FC<StockSearchBarProps> = ({ filters, onFiltersChange }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleLowStockToggle = (checked: boolean) => {
    onFiltersChange({ ...filters, lowStockOnly: checked });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
      {/* Search Input */}
      <div className="flex-grow">
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-slate-100 dark:bg-slate-800">
            <div className="text-slate-500 dark:text-slate-400 flex items-center justify-center pl-4">
              <Search className="h-5 w-5" />
            </div>
            <Input
              type="text"
              placeholder="Buscar producto por nombre"
              value={filters.search}
              onChange={handleSearchChange}
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-800 dark:text-slate-200 focus:outline-0 focus:ring-0 border-none bg-slate-100 dark:bg-slate-800 h-full placeholder:text-slate-500 dark:placeholder:text-slate-400 pl-2 text-base font-normal leading-normal"
            />
          </div>
        </label>
      </div>

      {/* Low stock toggle */}
      <div className="flex items-center gap-3 px-1">
        <Switch
          id="lowStockOnly"
          checked={filters.lowStockOnly}
          onCheckedChange={handleLowStockToggle}
        />
        <label
          htmlFor="lowStockOnly"
          className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          Solo bajo mínimo
        </label>
      </div>
    </div>
  );
};

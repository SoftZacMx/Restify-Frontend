import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Switch } from '@/presentation/components/ui/switch';
import type { BranchFilters } from '@/domain/types';

interface BranchSearchBarProps {
  filters: BranchFilters;
  onFiltersChange: (filters: BranchFilters) => void;
}

/**
 * Barra de búsqueda y filtros del listado de sucursales.
 * Búsqueda local por nombre/ciudad + toggle para incluir las deshabilitadas
 * (este último re-consulta al backend vía `includeDisabled`).
 */
export const BranchSearchBar: React.FC<BranchSearchBarProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleIncludeDisabledChange = (checked: boolean) => {
    onFiltersChange({ ...filters, includeDisabled: checked });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 px-4 py-3 border-b border-slate-200 dark:border-border">
      {/* Search Input */}
      <div className="flex-grow">
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-slate-100 dark:bg-card">
            <div className="text-slate-500 dark:text-muted-foreground flex items-center justify-center pl-4">
              <Search className="h-5 w-5" />
            </div>
            <Input
              type="text"
              placeholder="Buscar por nombre o ciudad"
              value={filters.search}
              onChange={handleSearchChange}
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-800 dark:text-foreground focus:outline-0 focus:ring-0 border-none bg-slate-100 dark:bg-card h-full placeholder:text-slate-500 dark:placeholder:text-muted-foreground pl-2 text-base font-normal leading-normal"
            />
          </div>
        </label>
      </div>

      {/* Filtro: incluir deshabilitadas */}
      <div className="flex items-center gap-3 px-1">
        <Switch
          id="include-disabled"
          checked={filters.includeDisabled}
          onCheckedChange={handleIncludeDisabledChange}
        />
        <label
          htmlFor="include-disabled"
          className="text-sm font-medium text-slate-600 dark:text-foreground cursor-pointer whitespace-nowrap"
        >
          Incluir deshabilitadas
        </label>
      </div>
    </div>
  );
};

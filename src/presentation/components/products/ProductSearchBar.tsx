import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/presentation/components/ui/select';
import type { ProductTableFilters } from '@/domain/types';

interface ProductSearchBarProps {
  filters: ProductTableFilters;
  onFiltersChange: (filters: ProductTableFilters) => void;
  onExport?: () => void;
}

/**
 * Componente ProductSearchBar
 * Responsabilidad única: Renderizar barra de búsqueda y filtros
 * Cumple SRP: Solo maneja la UI de búsqueda y filtros
 */
export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as 'active' | 'inactive'),
    });
  };

  const getCurrentStatusValue = (): string => {
    return filters.status || 'all';
  };

  const getStatusLabel = (status?: 'active' | 'inactive' | 'all'): string => {
    if (!status || status === 'all') return 'Estado';
    return status === 'active' ? 'Activo' : 'Inactivo';
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
              placeholder="Buscar por nombre"
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-800 dark:text-slate-200 focus:outline-0 focus:ring-0 border-none bg-slate-100 dark:bg-slate-800 h-full placeholder:text-slate-500 dark:placeholder:text-slate-400 pl-2 text-base font-normal leading-normal"
            />
          </div>
        </label>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        {/* Status Filter */}
        <Select value={getCurrentStatusValue()} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-12 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium leading-normal min-w-[140px]">
            {getStatusLabel(filters.status)}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

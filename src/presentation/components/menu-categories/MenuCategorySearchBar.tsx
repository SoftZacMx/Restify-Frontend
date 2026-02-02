import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/presentation/components/ui/select';
import type { MenuCategoryTableFilters } from '@/domain/types';

interface MenuCategorySearchBarProps {
  filters: MenuCategoryTableFilters;
  onFiltersChange: (filters: MenuCategoryTableFilters) => void;
}

/**
 * Componente MenuCategorySearchBar
 * Responsabilidad única: Manejar filtros y búsqueda de categorías
 * Cumple SRP: Solo maneja los filtros de búsqueda
 */
export const MenuCategorySearchBar: React.FC<MenuCategorySearchBarProps> = ({
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
      status: value as 'active' | 'inactive' | 'all' | undefined,
    });
  };

  return (
    <div className="px-4 py-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Barra de búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>

        {/* Filtro de estado */}
        <Select
          value={filters.status || 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            {filters.status === 'active'
              ? 'Activas'
              : filters.status === 'inactive'
                ? 'Inactivas'
                : 'Todos los estados'}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activas</SelectItem>
            <SelectItem value="inactive">Inactivas</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

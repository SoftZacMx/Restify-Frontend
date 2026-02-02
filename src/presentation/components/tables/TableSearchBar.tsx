import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/presentation/components/ui/select';

export interface TableFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  availability?: 'available' | 'occupied' | 'all';
}

interface TableSearchBarProps {
  filters: TableFilters;
  onFiltersChange: (filters: TableFilters) => void;
}

/**
 * Componente TableSearchBar
 * Responsabilidad única: Manejar filtros y búsqueda de mesas
 * Cumple SRP: Solo maneja los filtros de búsqueda
 */
export const TableSearchBar: React.FC<TableSearchBarProps> = ({
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
      status: value as 'active' | 'inactive' | 'all',
    });
  };

  const handleAvailabilityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      availability: value as 'available' | 'occupied' | 'all',
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
            placeholder="Buscar por número de mesa..."
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

        {/* Filtro de disponibilidad */}
        <Select
          value={filters.availability || 'all'}
          onValueChange={handleAvailabilityChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            {filters.availability === 'available'
              ? 'Libres'
              : filters.availability === 'occupied'
                ? 'Ocupadas'
                : 'Todas'}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las mesas</SelectItem>
            <SelectItem value="available">Libres</SelectItem>
            <SelectItem value="occupied">Ocupadas</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

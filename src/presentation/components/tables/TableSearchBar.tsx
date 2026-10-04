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
  /** Acción junto a los filtros (ej. botón "Nueva Mesa"). En mobile baja debajo, centrada. */
  actions?: React.ReactNode;
}

/**
 * Componente TableSearchBar
 * Responsabilidad única: Manejar filtros y búsqueda de ubicaciones
 * Cumple SRP: Solo maneja los filtros de búsqueda
 */
export const TableSearchBar: React.FC<TableSearchBarProps> = ({
  filters,
  onFiltersChange,
  actions,
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
    <div className="py-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Barra de búsqueda */}
        <div className="relative sm:flex-1 sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="table-search-input"
            name="search"
            type="text"
            inputMode="text"
            autoComplete="off"
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
          <SelectTrigger className="w-full sm:flex-1 sm:min-w-[160px]">
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
          <SelectTrigger className="w-full sm:flex-1 sm:min-w-[160px]">
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

        {actions && (
          <div className="flex justify-center sm:justify-start sm:shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

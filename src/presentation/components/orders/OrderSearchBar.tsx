import React from 'react';
import { Search, X, Filter, Calendar } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import type { OrderViewFilters } from '@/shared/utils/order.utils';
import type { TableResponse } from '@/domain/types';

interface OrderSearchBarProps {
  filters: OrderViewFilters;
  onFiltersChange: (filters: OrderViewFilters) => void;
  tables?: TableResponse[];
  isLoadingTables?: boolean;
}

/**
 * Barra de búsqueda y filtros para órdenes
 */
export const OrderSearchBar: React.FC<OrderSearchBarProps> = ({
  filters,
  onFiltersChange,
  tables = [],
  isLoadingTables,
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value as OrderViewFilters['status'],
    });
  };

  const handleTableChange = (value: string) => {
    onFiltersChange({ ...filters, tableId: value === 'all' ? '' : value });
  };

  const handleOriginChange = (value: string) => {
    onFiltersChange({ ...filters, origin: value === 'all' ? '' : value });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, dateFrom: e.target.value });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, dateTo: e.target.value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      tableId: '',
      origin: '',
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status !== 'all' ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.tableId ||
    filters.origin;

  return (
    <div className="space-y-4">
      {/* Primera fila: Búsqueda y estado */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por cliente o número de orden..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
          {filters.search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Estado */}
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4 shrink-0 text-slate-400" />
              <SelectValue placeholder="Estado" />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="delivered">Entregadas</SelectItem>
            <SelectItem value="paid">Pagadas</SelectItem>
            <SelectItem value="completed">Completadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Segunda fila: Filtros adicionales */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Mesa */}
        <Select
          value={filters.tableId || 'all'}
          onValueChange={handleTableChange}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Mesa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las mesas</SelectItem>
            {isLoadingTables ? (
              <SelectItem value="loading">
                Cargando...
              </SelectItem>
            ) : (
              tables.map((table) => (
                <SelectItem key={table.id} value={table.id}>
                  Mesa {table.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {/* Origen */}
        <Select
          value={filters.origin || 'all'}
          onValueChange={handleOriginChange}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Origen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los orígenes</SelectItem>
            <SelectItem value="Local">Local</SelectItem>
            <SelectItem value="Delivery">Delivery</SelectItem>
            <SelectItem value="Pickup">Para llevar</SelectItem>
          </SelectContent>
        </Select>

        {/* Fecha desde */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={handleDateFromChange}
            className="pl-10 w-full sm:w-[160px]"
            placeholder="Desde"
          />
        </div>

        {/* Fecha hasta */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            type="date"
            value={filters.dateTo}
            onChange={handleDateToChange}
            className="pl-10 w-full sm:w-[160px]"
            placeholder="Hasta"
          />
        </div>

        {/* Limpiar filtros */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="text-slate-600 hover:text-slate-900"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
};

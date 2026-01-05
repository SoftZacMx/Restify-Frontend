import React from 'react';
import { Search, Download } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/presentation/components/ui/select';
import type { UserTableFilters, UserRole, UserStatusFilter } from '@/domain/types';

interface UserSearchBarProps {
  filters: UserTableFilters;
  onFiltersChange: (filters: UserTableFilters) => void;
  onExport?: () => void;
}

/**
 * Componente UserSearchBar
 * Responsabilidad única: Renderizar barra de búsqueda y filtros
 * Cumple SRP: Solo maneja la UI de búsqueda y filtros
 */
export const UserSearchBar: React.FC<UserSearchBarProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value,
    });
  };

  const handleRoleChange = (value: string) => {
    onFiltersChange({
      ...filters,
      role: value === 'all' ? undefined : (value as UserRole),
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as UserStatusFilter),
    });
  };

  const getCurrentRoleValue = (): string => {
    return filters.role || 'all';
  };

  const getCurrentStatusValue = (): string => {
    return filters.status || 'all';
  };

  const getRoleLabel = (role?: UserRole | 'all'): string => {
    if (!role || role === 'all') return 'Rol';
    const labels: Record<UserRole, string> = {
      ADMIN: 'Administrador',
      MANAGER: 'Gerente',
      WAITER: 'Mesero',
      CHEF: 'Cocinero',
    };
    return labels[role] || 'Rol';
  };

  const getStatusLabel = (status?: UserStatusFilter | 'all'): string => {
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
              placeholder="Buscar por nombre o email"
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-800 dark:text-slate-200 focus:outline-0 focus:ring-0 border-none bg-slate-100 dark:bg-slate-800 h-full placeholder:text-slate-500 dark:placeholder:text-slate-400 pl-2 text-base font-normal leading-normal"
            />
          </div>
        </label>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        {/* Role Filter */}
        <Select value={getCurrentRoleValue()} onValueChange={handleRoleChange}>
          <SelectTrigger className="h-12 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium leading-normal min-w-[140px]">
            {getRoleLabel(filters.role)}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="ADMIN">Administrador</SelectItem>
            <SelectItem value="MANAGER">Gerente</SelectItem>
            <SelectItem value="WAITER">Mesero</SelectItem>
            <SelectItem value="CHEF">Cocinero</SelectItem>
          </SelectContent>
        </Select>

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


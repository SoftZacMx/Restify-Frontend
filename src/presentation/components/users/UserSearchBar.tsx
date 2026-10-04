import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/presentation/components/ui/select';
import type { UserTableFilters, UserRole, UserStatusFilter } from '@/domain/types';
import { ASSIGNABLE_ROLES, getRoleLabel } from '@/shared/utils';

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

  const getRoleLabelForFilter = (role?: UserRole | 'all'): string => {
    if (!role || role === 'all') return 'Rol';
    return getRoleLabel(role);
  };

  const getStatusLabel = (status?: UserStatusFilter | 'all'): string => {
    if (!status || status === 'all') return 'Estado';
    return status === 'active' ? 'Activo' : 'Inactivo';
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 py-3">
      {/* Search Input */}
      <div className="flex-grow">
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-muted">
            <div className="text-muted-foreground flex items-center justify-center pl-4">
              <Search className="h-5 w-5" />
            </div>
            <Input
              type="text"
              placeholder="Buscar por nombre o email"
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-foreground focus:outline-0 focus:ring-0 border-none bg-muted h-full placeholder:text-muted-foreground dark:placeholder:text-muted-foreground pl-2 text-base font-normal leading-normal"
            />
          </div>
        </label>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        {/* Role Filter */}
        <Select value={getCurrentRoleValue()} onValueChange={handleRoleChange}>
          <SelectTrigger className="h-12 shrink-0 rounded-lg bg-muted border-border hover:bg-secondary dark:hover:bg-card text-foreground text-sm font-medium leading-normal min-w-[140px]">
            {getRoleLabelForFilter(filters.role)}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            {ASSIGNABLE_ROLES.map((rol) => (
              <SelectItem key={rol} value={rol}>
                {getRoleLabel(rol)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={getCurrentStatusValue()} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-12 shrink-0 rounded-lg bg-muted border-border hover:bg-secondary dark:hover:bg-card text-foreground text-sm font-medium leading-normal min-w-[140px]">
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


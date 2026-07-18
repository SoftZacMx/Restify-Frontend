import React from 'react';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { Button } from '@/presentation/components/ui/button';
import { X, ListFilter } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MOVEMENT_TYPE_OPTIONS } from '@/shared/utils/stock.utils';
import type { MovementsListFilters, StockMovementType } from '@/domain/types';

interface MovementsFiltersProps {
  filters: MovementsListFilters;
  onFiltersChange: (filters: MovementsListFilters) => void;
}

/**
 * Opciones del select del filtro: "Todos" + las 5 categorías centralizadas.
 * El filtro usa `descriptionPlural` ("Compras" en plural), el value como string
 * (con 'ALL' extra para "todos los tipos"), y reusa el ícono de cada tipo.
 */
interface FilterTypeOption {
  value: StockMovementType | 'ALL';
  label: string;
  Icon: LucideIcon;
  /** Hover/focus className: color base con opacidad reducida (centralizado en MOVEMENT_TYPE_OPTIONS). */
  hoverClassName: string;
}

const FILTER_TYPE_OPTIONS: FilterTypeOption[] = [
  {
    value: 'ALL',
    label: 'Todos',
    Icon: ListFilter,
    // "Todos" no tiene un tipo asociado → hover slate neutro.
    hoverClassName: 'hover:bg-slate-100 dark:hover:bg-slate-700/50 focus:bg-slate-100 dark:focus:bg-slate-700/50',
  },
  ...MOVEMENT_TYPE_OPTIONS.map<FilterTypeOption>((opt) => ({
    value: opt.value,
    label: opt.descriptionPlural,
    Icon: opt.icon,
    hoverClassName: opt.hoverClassName,
  })),
];

export const MovementsFilters: React.FC<MovementsFiltersProps> = ({ filters, onFiltersChange }) => {
  const hasActiveFilters = filters.from || filters.to || filters.type !== 'ALL';

  const reset = () => onFiltersChange({ type: 'ALL', from: '', to: '' });

  return (
    <div className="flex flex-col md:flex-row gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
      <div className="flex flex-col">
        <Label htmlFor="movFrom" className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          Desde
        </Label>
        <Input
          id="movFrom"
          type="date"
          value={filters.from}
          onChange={(e) => onFiltersChange({ ...filters, from: e.target.value })}
          className="h-10"
        />
      </div>

      <div className="flex flex-col">
        <Label htmlFor="movTo" className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          Hasta
        </Label>
        <Input
          id="movTo"
          type="date"
          value={filters.to}
          onChange={(e) => onFiltersChange({ ...filters, to: e.target.value })}
          className="h-10"
        />
      </div>

      <div className="flex flex-col flex-grow">
        <Label htmlFor="movType" className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          Tipo de movimiento
        </Label>
        <Select
          value={filters.type}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, type: value as StockMovementType | 'ALL' })
          }
        >
          <SelectTrigger id="movType" className="h-10 min-w-[180px]">
            <SelectValue placeholder="Todos">
              {(() => {
                const sel = FILTER_TYPE_OPTIONS.find((o) => o.value === filters.type);
                if (!sel) return null;
                const TriggerIcon = sel.Icon;
                return (
                  <span className="flex items-center gap-2">
                    <TriggerIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    {sel.label}
                  </span>
                );
              })()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {FILTER_TYPE_OPTIONS.map((opt) => {
              const ItemIcon = opt.Icon;
              return (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-2">
                    <ItemIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    {opt.label}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex items-end">
          <Button type="button" variant="outline" onClick={reset}>
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>
      )}
    </div>
  );
};

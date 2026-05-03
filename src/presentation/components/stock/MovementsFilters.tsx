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
import { X } from 'lucide-react';
import type { MovementsListFilters, StockMovementType } from '@/domain/types';

interface MovementsFiltersProps {
  filters: MovementsListFilters;
  onFiltersChange: (filters: MovementsListFilters) => void;
}

const TYPE_OPTIONS: { value: StockMovementType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PURCHASE', label: 'Compras' },
  { value: 'SALE', label: 'Ventas' },
  { value: 'WASTE', label: 'Mermas' },
  { value: 'ADJUSTMENT', label: 'Ajustes' },
  { value: 'SALE_REVERSAL', label: 'Reversas' },
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
              {TYPE_OPTIONS.find((o) => o.value === filters.type)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
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

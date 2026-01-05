import React from 'react';
import { Search, Calendar, CreditCard } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/presentation/components/ui/select';
import type { ExpenseTableFilters, ExpenseType, PaymentMethod } from '@/domain/types';
import { getExpenseTypeLabel, getPaymentMethodLabel } from '@/shared/utils';

interface ExpenseFiltersProps {
  filters: ExpenseTableFilters;
  onFiltersChange: (filters: ExpenseTableFilters) => void;
}

/**
 * Componente ExpenseFilters
 * Responsabilidad única: Renderizar filtros de gastos
 * Cumple SRP: Solo maneja la UI de filtros
 */
export const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value || undefined,
    });
  };

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value === 'all' ? undefined : (value as ExpenseType),
    });
  };

  const handlePaymentMethodChange = (value: string) => {
    onFiltersChange({
      ...filters,
      paymentMethod: value === 'all' ? undefined : (Number(value) as PaymentMethod),
    });
  };

  const getCurrentTypeValue = (): string => {
    return filters.type || 'all';
  };

  const getCurrentPaymentMethodValue = (): string => {
    return filters.paymentMethod?.toString() || 'all';
  };

  const expenseTypes: ExpenseType[] = ['SERVICE_BUSINESS', 'UTILITY', 'RENT', 'MERCHANDISE', 'OTHER'];
  const paymentMethods: PaymentMethod[] = [1, 2, 3];

  return (
    <div className="space-y-4 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
      {/* Search Input */}
      <div className="flex-grow">
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-slate-100 dark:bg-slate-800">
            <div className="text-slate-500 dark:text-slate-400 flex items-center justify-center pl-4">
              <Search className="h-5 w-5" />
            </div>
            <Input
              type="text"
              placeholder="Buscar por descripción..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-800 dark:text-slate-200 focus:outline-0 focus:ring-0 border-none bg-slate-100 dark:bg-slate-800 h-full placeholder:text-slate-500 dark:placeholder:text-slate-400 pl-2 text-base font-normal leading-normal"
            />
          </div>
        </label>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={getCurrentTypeValue() === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTypeChange('all')}
          className="rounded-full"
        >
          Todos
        </Button>
        {expenseTypes.map((type) => (
          <Button
            key={type}
            variant={getCurrentTypeValue() === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange(type)}
            className="rounded-full"
          >
            {getExpenseTypeLabel(type)}
          </Button>
        ))}
      </div>

      {/* Additional Filters */}
      <div className="flex items-center gap-3">
        {/* Payment Method Filter */}
        <Select value={getCurrentPaymentMethodValue()} onValueChange={handlePaymentMethodChange}>
          <SelectTrigger className="h-12 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium leading-normal min-w-[180px]">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>
                {filters.paymentMethod
                  ? getPaymentMethodLabel(filters.paymentMethod)
                  : 'Método de pago'}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los métodos</SelectItem>
            {paymentMethods.map((method) => (
              <SelectItem key={method} value={method.toString()}>
                {getPaymentMethodLabel(method)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Filter - Placeholder for future implementation */}
        <Button
          variant="outline"
          size="sm"
          className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <Calendar className="h-4 w-4 mr-2" />
          <span>Rango de fechas</span>
        </Button>
      </div>
    </div>
  );
};



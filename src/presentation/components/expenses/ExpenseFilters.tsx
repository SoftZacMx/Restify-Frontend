import React, { useState } from 'react';
import { Search, Calendar, CreditCard, Wrench, Zap, Building2, Package, Banknote, FileText, Wallet, SlidersHorizontal, type LucideIcon } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/presentation/components/ui/select';
import type { ExpenseTableFilters, ExpenseType, PaymentMethod } from '@/domain/types';
import { getPaymentMethodLabel } from '@/shared/utils';

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
  const advancedFiltersCount =
    (filters.paymentMethod && filters.paymentMethod !== 'all' ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);
  // Si ya hay filtros avanzados activos al montar, abrir el panel para que el usuario los vea.
  const [showAdvanced, setShowAdvanced] = useState<boolean>(advancedFiltersCount > 0);

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
    const num = value === 'all' ? undefined : parseInt(value, 10);
    const paymentMethod: PaymentMethod | undefined =
      num === 1 || num === 2 || num === 3 ? (num as PaymentMethod) : undefined;
    onFiltersChange({
      ...filters,
      paymentMethod,
    });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, dateFrom: e.target.value || undefined });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, dateTo: e.target.value || undefined });
  };

  const getCurrentTypeValue = (): string => {
    return filters.type || 'all';
  };

  const getCurrentPaymentMethodValue = (): string => {
    return filters.paymentMethod?.toString() || 'all';
  };

  const expenseTypes: { value: ExpenseType; title: string; icon: LucideIcon }[] = [
    { value: 'SERVICE_BUSINESS', title: 'Servicios del negocio', icon: Wrench },
    { value: 'UTILITY', title: 'Servicios públicos', icon: Zap },
    { value: 'RENT', title: 'Renta', icon: Building2 },
    { value: 'MERCHANDISE', title: 'Compra de mercancía', icon: Package },
    { value: 'SALARY', title: 'Salarios', icon: Banknote },
    { value: 'OTHER', title: 'Otros', icon: FileText },
    { value: 'MERCADO_PAGO_FEE', title: 'Comisión Mercado Pago', icon: Wallet },
  ];
  const paymentMethods: PaymentMethod[] = [1, 2, 3];

  return (
    <div className="space-y-4 px-4 py-3 border-b border-slate-200 dark:border-slate-800 overflow-x-visible min-w-0">
      {/* Search Input + botón "Filtros" */}
      <div className="flex items-stretch gap-2">
        <label className="flex h-12 flex-1 min-w-0">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-slate-100 dark:bg-slate-800">
            <div className="text-slate-500 dark:text-slate-400 flex items-center justify-center pl-4">
              <Search className="h-5 w-5" />
            </div>
            <Input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-800 dark:text-slate-200 focus:outline-0 focus:ring-0 border-none bg-slate-100 dark:bg-slate-800 h-full placeholder:text-slate-500 dark:placeholder:text-slate-400 pl-2 text-base font-normal leading-normal"
            />
          </div>
        </label>
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          aria-expanded={showAdvanced}
          aria-controls="expense-advanced-filters"
          className={`relative flex h-12 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
            showAdvanced
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
          {advancedFiltersCount > 0 && (
            <span className="ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
              {advancedFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Filters — select en móvil, pills en desktop */}
      <div className="md:hidden">
        <Select value={getCurrentTypeValue()} onValueChange={handleTypeChange}>
          <SelectTrigger className="h-9 w-full rounded-lg bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium">
            {(() => {
              const selected = expenseTypes.find((t) => t.value === getCurrentTypeValue());
              if (!selected) return <span>Todos los tipos</span>;
              const Icon = selected.icon;
              return (
                <span className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  {selected.title}
                </span>
              );
            })()}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {expenseTypes.map(({ value, title, icon: Icon }) => (
              <SelectItem key={value} value={value}>
                <span className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  {title}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="hidden md:block border-b border-slate-200 dark:border-slate-800 -mx-4 px-4">
        <div className="flex items-stretch gap-6 overflow-x-auto scrollbar-thin">
          {([{ value: 'all' as const, title: 'Todos' }, ...expenseTypes] as Array<{ value: string; title: string }>).map(({ value, title }) => {
            const isActive = getCurrentTypeValue() === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleTypeChange(value)}
                className={`relative whitespace-nowrap pb-2.5 pt-1 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {title}
                {isActive && (
                  <span className="pointer-events-none absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtros avanzados (método de pago + rango de fechas) — toggle desde botón "Filtros" */}
      {showAdvanced && (
        <div
          id="expense-advanced-filters"
          className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30"
        >
          {/* Método de pago */}
          <Select value={getCurrentPaymentMethodValue()} onValueChange={handlePaymentMethodChange}>
            <SelectTrigger className="h-9 rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium w-full md:w-auto gap-1.5 px-3">
              <CreditCard className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {filters.paymentMethod && filters.paymentMethod !== 'all'
                  ? getPaymentMethodLabel(filters.paymentMethod as 1 | 2 | 3)
                  : 'Método de pago'}
              </span>
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

          {/* Rango de fechas — columna en móvil, fila en desktop */}
          <div className="flex flex-col md:flex-row items-center gap-2">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">Desde</span>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom ?? ''}
                onChange={handleDateFromChange}
                className="h-9 flex-1 md:w-[140px] rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm px-2"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0 md:hidden" />
              <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">Hasta</span>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo ?? ''}
                onChange={handleDateToChange}
                className="h-9 flex-1 md:w-[140px] rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm px-2"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



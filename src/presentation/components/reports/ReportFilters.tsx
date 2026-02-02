import React from 'react';
import { BarChart3, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import type { ReportType } from '@/domain/types';

export interface ReportFiltersState {
  type: ReportType;
  dateFrom: string;
  dateTo: string;
}

interface ReportFiltersProps {
  filters: ReportFiltersState;
  onFiltersChange: (filters: ReportFiltersState) => void;
  onGenerate: () => void;
  isLoading?: boolean;
}

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  CASH_FLOW: 'Flujo de caja',
  SALES_PERFORMANCE: 'Desempeño de ventas',
  EXPENSE_ANALYSIS: 'Análisis de gastos',
};

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  onGenerate,
  isLoading = false,
}) => {
  const reportTypes: ReportType[] = ['CASH_FLOW', 'SALES_PERFORMANCE', 'EXPENSE_ANALYSIS'];

  return (
    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50/80 to-transparent dark:from-slate-800/30 dark:to-transparent">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2 min-w-[200px]">
          <Label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="rounded-md bg-primary/10 p-1">
              <BarChart3 className="h-4 w-4 text-primary" />
            </span>
            Tipo de reporte
          </Label>
          <Select
            value={filters.type}
            onValueChange={(value) => onFiltersChange({ ...filters, type: value as ReportType })}
          >
            <SelectTrigger className="rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-sm">
              <SelectValue placeholder="Seleccionar tipo de reporte">
                {filters.type ? REPORT_TYPE_LABELS[filters.type] : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {REPORT_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2 min-w-[140px]">
          <Label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Calendar className="h-4 w-4 text-slate-500" />
            Desde
          </Label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
            className="rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-sm"
          />
        </div>
        <div className="flex flex-col gap-2 min-w-[140px]">
          <Label className="text-slate-600 dark:text-slate-400">Hasta</Label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
            className="rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-sm"
          />
        </div>
        <Button
          onClick={onGenerate}
          disabled={isLoading}
          className="rounded-lg bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {isLoading ? 'Generando...' : 'Generar reporte'}
        </Button>
      </div>
    </div>
  );
};

import React from 'react';
import { BarChart3, Sparkles } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { DatePicker } from '@/presentation/components/ui/date-picker';
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
    <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-muted/80 to-transparent dark:from-card/30 dark:to-transparent">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 sm:gap-4">
        <div className="flex flex-col gap-2 sm:min-w-[200px]">
          <Label className="flex items-center gap-2 text-muted-foreground">
            <span className="rounded-md bg-primary/10 p-1">
              <BarChart3 className="h-4 w-4 text-primary" />
            </span>
            Tipo de reporte
          </Label>
          <Select
            value={filters.type}
            onValueChange={(value) => onFiltersChange({ ...filters, type: value as ReportType })}
          >
            <SelectTrigger className="rounded-lg border-border bg-card shadow-sm">
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
        <div className="flex flex-col gap-2 sm:min-w-[150px]">
          <Label className="text-muted-foreground">Desde</Label>
          <DatePicker
            value={filters.dateFrom}
            onChange={(value) => onFiltersChange({ ...filters, dateFrom: value })}
          />
        </div>
        <div className="flex flex-col gap-2 sm:min-w-[150px]">
          <Label className="text-muted-foreground">Hasta</Label>
          <DatePicker
            value={filters.dateTo}
            onChange={(value) => onFiltersChange({ ...filters, dateTo: value })}
          />
        </div>
        <Button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full sm:w-auto rounded-lg bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {isLoading ? 'Generando...' : 'Generar reporte'}
        </Button>
      </div>
    </div>
  );
};

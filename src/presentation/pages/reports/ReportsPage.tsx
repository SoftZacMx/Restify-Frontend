import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { LoadingOverlay } from '@/presentation/components/ui/loading-overlay';
import { ReportFilters, type ReportFiltersState } from '@/presentation/components/reports/ReportFilters';
import { CashFlowReportView } from '@/presentation/components/reports/CashFlowReportView';
import { SalesPerformanceReportView } from '@/presentation/components/reports/SalesPerformanceReportView';
import { ExpenseAnalysisReportView } from '@/presentation/components/reports/ExpenseAnalysisReportView';
import { ReportService } from '@/application/services/report.service';
import type {
  BaseReportResponse,
  CashFlowReportData,
  SalesPerformanceReportData,
  ExpenseAnalysisReportData,
} from '@/domain/types';
import { showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

function getDefaultDateRange(): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateTo = `${year}-${month}-${day}`;
  const dateFrom = `${year}-${month}-01`;
  return { dateFrom, dateTo };
}

const ReportsPage = () => {
  const { dateFrom: defaultFrom, dateTo: defaultTo } = getDefaultDateRange();
  const [filters, setFilters] = useState<ReportFiltersState>({
    type: 'CASH_FLOW',
    dateFrom: defaultFrom,
    dateTo: defaultTo,
  });
  const [report, setReport] = useState<BaseReportResponse<unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reportService = new ReportService();

  const handleGenerate = async () => {
    if (!filters.type) return;
    setIsLoading(true);
    setReport(null);
    try {
      const params = {
        type: filters.type,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      };
      const result = await reportService.generateReport(params);
      setReport(result);
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al generar reporte', error.message);
      } else {
        showErrorToast('Error al generar reporte', 'Intenta de nuevo más tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <LoadingOverlay open={isLoading} message="Generando reporte..." />
      <div className="flex flex-col h-full">
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <div className="px-4 py-4 bg-gradient-to-br from-slate-50 via-white to-primary/5 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-primary/10">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="rounded-xl bg-primary/10 p-2 text-primary">Reportes</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
              Genera reportes de flujo de caja, desempeño de ventas o análisis de gastos. Opcionalmente filtra por rango de fechas.
            </p>
          </div>
          <ReportFilters
            filters={filters}
            onFiltersChange={setFilters}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
        </div>

        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900/30">
          {report && (
            <div className="py-4">
              <div className="px-4 mb-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-slate-200/80 dark:bg-slate-700/80 px-3 py-1 text-slate-600 dark:text-slate-300">
                  Generado: {new Date(report.generatedAt).toLocaleString('es-MX')}
                </span>
                {report.filters.dateFrom && report.filters.dateTo && (
                  <span className="rounded-full bg-primary/10 dark:bg-primary/20 px-3 py-1 text-primary font-medium">
                    Período: {report.filters.dateFrom.split('T')[0]} → {report.filters.dateTo.split('T')[0]}
                  </span>
                )}
              </div>
              {report.type === 'CASH_FLOW' && (
                <CashFlowReportView data={report.data as CashFlowReportData} />
              )}
              {report.type === 'SALES_PERFORMANCE' && (
                <SalesPerformanceReportView data={report.data as SalesPerformanceReportData} />
              )}
              {report.type === 'EXPENSE_ANALYSIS' && (
                <ExpenseAnalysisReportView data={report.data as ExpenseAnalysisReportData} />
              )}
            </div>
          )}
          {!report && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-800/60 p-8 max-w-md text-center border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
                <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium mb-2">
                  Listo para generar tu reporte
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Selecciona el tipo de reporte y opcionalmente un rango de fechas, luego haz clic en &quot;Generar reporte&quot;.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;

import { useState } from 'react';
import { BarChart3, LayoutDashboard, FileText } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { LoadingOverlay } from '@/presentation/components/ui/loading-overlay';
import { Button } from '@/presentation/components/ui/button';
import { ReportFilters, type ReportFiltersState } from '@/presentation/components/reports/ReportFilters';
import { CashFlowReportView } from '@/presentation/components/reports/CashFlowReportView';
import { SalesPerformanceReportView } from '@/presentation/components/reports/SalesPerformanceReportView';
import { ExpenseAnalysisReportView } from '@/presentation/components/reports/ExpenseAnalysisReportView';
import { ReportsSummaryView } from '@/presentation/components/reports/ReportsSummaryView';
import { ReportService } from '@/application/services/report.service';
import type {
  BaseReportResponse,
  CashFlowReportData,
  SalesPerformanceReportData,
  ExpenseAnalysisReportData,
  ReportsSummaryResponse,
} from '@/domain/types';
import { showErrorToast } from '@/shared/utils/toast';
import { getTodayDateString } from '@/shared/utils';
import { APP_TIMEZONE } from '@/shared/constants';
import { formatInTimeZone } from 'date-fns-tz';
import { AppError } from '@/domain/errors';

function getDefaultDateRange(): { dateFrom: string; dateTo: string } {
  const today = getTodayDateString();
  const dateFrom = `${today.slice(0, 7)}-01`;
  return { dateFrom, dateTo: today };
}

function getLast30Days(): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const to = getTodayDateString();
  const from = formatInTimeZone(
    new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000),
    APP_TIMEZONE,
    'yyyy-MM-dd'
  );
  return { dateFrom: from, dateTo: to };
}

type ViewMode = 'summary' | 'document';

const ReportsPage = () => {
  const { dateFrom: defaultFrom, dateTo: defaultTo } = getDefaultDateRange();
  const { dateFrom: summaryFrom, dateTo: summaryTo } = getLast30Days();
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [filters, setFilters] = useState<ReportFiltersState>({
    type: 'CASH_FLOW',
    dateFrom: defaultFrom,
    dateTo: defaultTo,
  });
  const [summaryFilters, setSummaryFilters] = useState({ dateFrom: summaryFrom, dateTo: summaryTo });
  const [report, setReport] = useState<BaseReportResponse<unknown> | null>(null);
  const [summaryData, setSummaryData] = useState<ReportsSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

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

  const handleLoadSummary = async () => {
    setIsLoadingSummary(true);
    setSummaryData(null);
    try {
      const result = await reportService.getReportsSummary({
        dateFrom: summaryFilters.dateFrom || undefined,
        dateTo: summaryFilters.dateTo || undefined,
      });
      setSummaryData(result);
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al cargar resumen', error.message);
      } else {
        showErrorToast('Error al cargar resumen', 'Intenta de nuevo más tarde.');
      }
    } finally {
      setIsLoadingSummary(false);
    }
  };

  return (
    <MainLayout>
      <LoadingOverlay open={isLoading || isLoadingSummary} message={viewMode === 'summary' ? 'Cargando resumen...' : 'Generando reporte...'} />
      <div className="flex flex-col h-full">
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <div className="px-4 py-4 bg-gradient-to-br from-slate-50 via-white to-primary/5 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-primary/10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Reportes
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
                  {viewMode === 'summary'
                    ? 'Resumen con gráficas: ventas, órdenes, gastos y utilidad por período.'
                    : 'Genera reportes de flujo de caja, desempeño de ventas o análisis de gastos.'}
                </p>
              </div>
              <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-1 bg-slate-100/80 dark:bg-slate-800/80">
                <Button
                  variant={viewMode === 'summary' ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                  onClick={() => setViewMode('summary')}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Resumen (gráficas)
                </Button>
                <Button
                  variant={viewMode === 'document' ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                  onClick={() => setViewMode('document')}
                >
                  <FileText className="h-4 w-4" />
                  Reportes documentados
                </Button>
              </div>
            </div>

            {viewMode === 'summary' && (
              <div className="mt-4 flex flex-wrap items-end gap-4 px-4 py-3 border-t border-slate-200/80 dark:border-slate-700/80">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">Desde</label>
                  <input
                    type="date"
                    value={summaryFilters.dateFrom}
                    onChange={(e) => setSummaryFilters((p) => ({ ...p, dateFrom: e.target.value }))}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">Hasta</label>
                  <input
                    type="date"
                    value={summaryFilters.dateTo}
                    onChange={(e) => setSummaryFilters((p) => ({ ...p, dateTo: e.target.value }))}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  />
                </div>
                <Button onClick={handleLoadSummary} disabled={isLoadingSummary} className="gap-2">
                  {summaryData ? 'Actualizar resumen' : 'Cargar resumen'}
                </Button>
              </div>
            )}

            {viewMode === 'document' && (
              <ReportFilters
                filters={filters}
                onFiltersChange={setFilters}
                onGenerate={handleGenerate}
                isLoading={isLoading}
              />
            )}
        </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900/30">
          {viewMode === 'summary' && summaryData && (
            <ReportsSummaryView data={summaryData} />
          )}
          {viewMode === 'summary' && !summaryData && !isLoadingSummary && (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-800/60 p-8 max-w-md text-center border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
                <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <LayoutDashboard className="h-8 w-8 text-primary" />
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium mb-2">Resumen con gráficas</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Elige un rango de fechas y haz clic en &quot;Cargar resumen&quot; para ver ventas, órdenes, gastos y utilidad.
                </p>
              </div>
            </div>
          )}

          {viewMode === 'document' && report && (
            <div className="py-4">
              <div className="px-4 mb-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-slate-200/80 dark:bg-slate-700/80 px-3 py-1 text-slate-600 dark:text-slate-300">
                  Generado: {new Date(report.generatedAt).toLocaleString('es-MX', { timeZone: APP_TIMEZONE })}
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
          {viewMode === 'document' && !report && !isLoading && (
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

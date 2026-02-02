import { reportRepository } from '@/infrastructure/api/repositories/report.repository';
import type {
  ReportType,
  BaseReportResponse,
  GenerateReportParams,
  CashFlowReportData,
  SalesPerformanceReportData,
  ExpenseAnalysisReportData,
} from '@/domain/types';
import { AppError } from '@/domain/errors';

/**
 * Servicio de reportes (GET /api/reports)
 */
export class ReportService {
  async generateReport<T = unknown>(params: GenerateReportParams): Promise<BaseReportResponse<T>> {
    if (!params.type) {
      throw new AppError('VALIDATION_ERROR', 'El tipo de reporte es requerido');
    }
    const validTypes: ReportType[] = ['CASH_FLOW', 'SALES_PERFORMANCE', 'EXPENSE_ANALYSIS'];
    if (!validTypes.includes(params.type)) {
      throw new AppError('VALIDATION_ERROR', 'Tipo de reporte no válido');
    }
    try {
      return await reportRepository.generateReport<T>(params);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('SERVICE_UNAVAILABLE', 'Error al generar el reporte');
    }
  }

  async generateCashFlowReport(params: Omit<GenerateReportParams, 'type'>): Promise<BaseReportResponse<CashFlowReportData>> {
    return this.generateReport<CashFlowReportData>({ ...params, type: 'CASH_FLOW' });
  }

  async generateSalesPerformanceReport(params: Omit<GenerateReportParams, 'type'>): Promise<BaseReportResponse<SalesPerformanceReportData>> {
    return this.generateReport<SalesPerformanceReportData>({ ...params, type: 'SALES_PERFORMANCE' });
  }

  async generateExpenseAnalysisReport(params: Omit<GenerateReportParams, 'type'>): Promise<BaseReportResponse<ExpenseAnalysisReportData>> {
    return this.generateReport<ExpenseAnalysisReportData>({ ...params, type: 'EXPENSE_ANALYSIS' });
  }
}

export const reportService = new ReportService();

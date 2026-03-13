import apiClient from '../client';
import type {
  BaseReportResponse,
  GenerateReportParams,
  ReportsApiResponse,
  ReportsSummaryResponse,
} from '@/domain/types';

const REPORTS_BASE = '/api/reports';

/**
 * Repository para generar reportes (GET /api/reports)
 * Query params: type (requerido), dateFrom, dateTo, page, pageSize.
 * Autenticación: cookie/header enviado por apiClient (withCredentials).
 */
export class ReportRepository {
  async generateReport<T = unknown>(params: GenerateReportParams): Promise<BaseReportResponse<T>> {
    const query: Record<string, string> = { type: params.type };
    if (params.dateFrom) query.dateFrom = params.dateFrom;
    if (params.dateTo) query.dateTo = params.dateTo;
    if (params.page != null) query.page = String(params.page);
    if (params.pageSize != null) query.pageSize = String(params.pageSize);

    const response = await apiClient.get<ReportsApiResponse<T>>(REPORTS_BASE, { params: query });
    const body = response.data;

    if (!body?.success || !body?.data) {
      throw new Error('Respuesta inválida del servidor de reportes');
    }

    return body.data as BaseReportResponse<T>;
  }

  async getReportsSummary(params?: { dateFrom?: string; dateTo?: string }): Promise<ReportsSummaryResponse> {
    const query: Record<string, string> = {};
    if (params?.dateFrom) query.dateFrom = params.dateFrom;
    if (params?.dateTo) query.dateTo = params.dateTo;
    const response = await apiClient.get<{ success: boolean; data: ReportsSummaryResponse }>(`${REPORTS_BASE}/summary`, {
      params: query,
    });
    const body = response.data;
    if (!body?.success || !body?.data) {
      throw new Error('Respuesta inválida del servidor de reportes');
    }
    return body.data;
  }
}

export const reportRepository = new ReportRepository();

import apiClient from '../client';
import type {
  BaseReportResponse,
  GenerateReportParams,
  ReportsApiResponse,
  ReportsSummaryResponse,
} from '@/domain/types';
import { normalizeCashFlowReportData } from '@/shared/utils/report-data.utils';
import { getLocalDayBoundsUtc } from '@/shared/utils';

const REPORTS_BASE = '/api/reports';

/**
 * Repository para generar reportes (GET /api/reports)
 * Query params: type (requerido), dateFrom, dateTo, page, pageSize.
 * Autenticación: cookie/header enviado por apiClient (withCredentials).
 *
 * Formato API: `{ success, data: BaseReportResponse<T> }` donde `data` incluye `type`, `generatedAt`, `filters` y `data` (payload del reporte).
 */
export class ReportRepository {
  async generateReport<T = unknown>(params: GenerateReportParams): Promise<BaseReportResponse<T>> {
    const query: Record<string, string> = { type: params.type };
    if (params.dateFrom) query.dateFrom = getLocalDayBoundsUtc(params.dateFrom).dateFrom;
    if (params.dateTo) query.dateTo = getLocalDayBoundsUtc(params.dateTo).dateTo;
    if (params.page != null) query.page = String(params.page);
    if (params.pageSize != null) query.pageSize = String(params.pageSize);

    const response = await apiClient.get<ReportsApiResponse<T>>(REPORTS_BASE, { params: query });
    const body = response.data;

    if (!body?.success || !body?.data) {
      throw new Error('Respuesta inválida del servidor de reportes');
    }

    const envelope = body.data as BaseReportResponse<T>;

    if (params.type === 'CASH_FLOW' && envelope?.data != null) {
      envelope.data = normalizeCashFlowReportData(envelope.data) as T;
    }

    return envelope;
  }

  async getReportsSummary(params?: { dateFrom?: string; dateTo?: string }): Promise<ReportsSummaryResponse> {
    const query: Record<string, string> = {};
    if (params?.dateFrom) query.dateFrom = getLocalDayBoundsUtc(params.dateFrom).dateFrom;
    if (params?.dateTo) query.dateTo = getLocalDayBoundsUtc(params.dateTo).dateTo;
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

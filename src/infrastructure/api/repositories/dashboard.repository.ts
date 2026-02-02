import apiClient from '../client';
import type { DashboardResponse, DashboardApiResponse } from '@/domain/types';

/**
 * Repository para el dashboard (GET /api/dashboard)
 */
export class DashboardRepository {
  async getDashboard(): Promise<DashboardApiResponse> {
    try {
      const response = await apiClient.get('/api/dashboard');
      const body = response.data as unknown;
      if (body && typeof body === 'object' && 'data' in (body as object)) {
        const api = body as { success?: boolean; data?: DashboardResponse; timestamp?: string };
        return { success: true, data: api.data, timestamp: api.timestamp };
      }
      if (body && typeof body === 'object' && 'salesToday' in (body as object)) {
        return { success: true, data: body as DashboardResponse };
      }
      return { success: true, data: undefined };
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return {
          success: true,
          data: {
            salesToday: 0,
            salesLast7Days: { total: 0, byDay: [] },
            activeOrders: { count: 0, items: [] },
            occupiedTables: { count: 0, items: [] },
            recentOrders: [],
            lastCompletedOrders: [],
          },
        };
      }
      throw err;
    }
  }
}

export const dashboardRepository = new DashboardRepository();

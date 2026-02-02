import { dashboardRepository } from '@/infrastructure/api/repositories/dashboard.repository';
import type { DashboardResponse } from '@/domain/types';
import { AppError } from '@/domain/errors';

/**
 * Servicio del dashboard (GET /api/dashboard)
 */
export class DashboardService {
  async getDashboard(): Promise<DashboardResponse> {
    try {
      const response = await dashboardRepository.getDashboard();
      if (!response.success || !response.data) {
        throw new AppError('VALIDATION_ERROR', 'No se pudo cargar el dashboard');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('VALIDATION_ERROR', 'Error al cargar el dashboard');
    }
  }
}

export const dashboardService = new DashboardService();

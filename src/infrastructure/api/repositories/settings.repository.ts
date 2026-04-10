import apiClient from '../client';
import type { ApiResponse } from '@/domain/types';
import type { MaskedPaymentConfig, SavePaymentConfigRequest } from '@/domain/types/settings.types';

export class SettingsRepository {
  async getPaymentConfig(): Promise<ApiResponse<MaskedPaymentConfig>> {
    try {
      const response = await apiClient.get('/api/settings/payment-config');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async savePaymentConfig(data: SavePaymentConfigRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.put('/api/settings/payment-config', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const settingsRepository = new SettingsRepository();

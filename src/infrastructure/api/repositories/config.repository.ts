import apiClient from '../client';
import type { ApiResponse } from '@/domain/types';
import type { AppConfig } from '@/domain/types/config.types';

export class ConfigRepository {
  async getConfig(): Promise<ApiResponse<AppConfig>> {
    try {
      const response = await apiClient.get('/api/config');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const configRepository = new ConfigRepository();

import { SettingsRepository, settingsRepository as defaultRepo } from '@/infrastructure/api/repositories/settings.repository';
import type { MaskedPaymentConfig, SavePaymentConfigRequest } from '@/domain/types/settings.types';

export class SettingsService {
  private repository: SettingsRepository;

  constructor(repository?: SettingsRepository) {
    this.repository = repository ?? defaultRepo;
  }

  async getPaymentConfig(): Promise<MaskedPaymentConfig> {
    const response = await this.repository.getPaymentConfig();
    return response.data!;
  }

  async savePaymentConfig(data: SavePaymentConfigRequest): Promise<{ message: string }> {
    const response = await this.repository.savePaymentConfig(data);
    return response.data!;
  }
}

export const settingsService = new SettingsService();

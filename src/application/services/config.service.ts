import { ConfigRepository, configRepository as defaultRepo } from '@/infrastructure/api/repositories/config.repository';
import type { AppConfig } from '@/domain/types/config.types';

export class ConfigService {
  private repository: ConfigRepository;

  constructor(repository?: ConfigRepository) {
    this.repository = repository ?? defaultRepo;
  }

  async getConfig(): Promise<AppConfig> {
    const response = await this.repository.getConfig();
    return response.data!;
  }
}

export const configService = new ConfigService();

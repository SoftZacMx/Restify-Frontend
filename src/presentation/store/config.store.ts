import { create } from 'zustand';
import type { AppConfig } from '@/domain/types/config.types';
import { configService } from '@/application/services/config.service';

interface ConfigState {
  config: AppConfig | null;
  isLoading: boolean;
  error: string | null;
  fetchConfig: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>()((set, get) => ({
  config: null,
  isLoading: false,
  error: null,

  fetchConfig: async () => {
    // Config es estática por deploy: si ya la tenemos, no refetchear.
    if (get().config) return;
    set({ isLoading: true, error: null });
    try {
      const config = await configService.getConfig();
      set({ config, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Error al consultar configuración', isLoading: false });
    }
  },
}));

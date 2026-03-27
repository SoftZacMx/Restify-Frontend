import { create } from 'zustand';
import type { SubscriptionStatusResponse } from '@/domain/types/subscription.types';
import { subscriptionService } from '@/application/services/subscription.service';

interface SubscriptionState {
  status: SubscriptionStatusResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchStatus: () => Promise<void>;
  clear: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()((set) => ({
  status: null,
  isLoading: false,
  error: null,

  fetchStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const status = await subscriptionService.getStatus();
      set({ status, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Error al consultar suscripción', isLoading: false });
    }
  },

  clear: () => set({ status: null, isLoading: false, error: null }),
}));

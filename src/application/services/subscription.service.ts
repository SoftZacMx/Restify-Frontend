import { SubscriptionRepository, subscriptionRepository as defaultRepo } from '@/infrastructure/api/repositories/subscription.repository';
import type {
  SubscriptionStatusResponse,
  CheckoutResponse,
  CancelSubscriptionResponse,
  ReactivateSubscriptionResponse,
} from '@/domain/types/subscription.types';

export class SubscriptionService {
  private repository: SubscriptionRepository;

  constructor(repository?: SubscriptionRepository) {
    this.repository = repository ?? defaultRepo;
  }

  async getStatus(): Promise<SubscriptionStatusResponse> {
    const response = await this.repository.getStatus();
    return response.data;
  }

  async createCheckout(): Promise<CheckoutResponse> {
    const response = await this.repository.createCheckout();
    return response.data;
  }

  async cancel(): Promise<CancelSubscriptionResponse> {
    const response = await this.repository.cancel();
    return response.data;
  }

  async reactivate(): Promise<ReactivateSubscriptionResponse> {
    const response = await this.repository.reactivate();
    return response.data;
  }
}

export const subscriptionService = new SubscriptionService();

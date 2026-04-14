import apiClient from '../client';
import type { ApiResponse } from '@/domain/types';
import type {
  SubscriptionPlan,
  SubscriptionStatusResponse,
  CheckoutResponse,
  CancelSubscriptionResponse,
  ReactivateSubscriptionResponse,
} from '@/domain/types/subscription.types';

export class SubscriptionRepository {
  async getPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    try {
      const response = await apiClient.get('/api/subscription/plans');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getStatus(): Promise<ApiResponse<SubscriptionStatusResponse>> {
    try {
      const response = await apiClient.get('/api/subscription/status');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createCheckout(planId: string): Promise<ApiResponse<CheckoutResponse>> {
    try {
      const response = await apiClient.post('/api/subscription/checkout', { planId });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async cancel(): Promise<ApiResponse<CancelSubscriptionResponse>> {
    try {
      const response = await apiClient.post('/api/subscription/cancel');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async reactivate(): Promise<ApiResponse<ReactivateSubscriptionResponse>> {
    try {
      const response = await apiClient.post('/api/subscription/reactivate');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async verifyCheckout(sessionId: string): Promise<ApiResponse<{ status: string; verified: boolean }>> {
    try {
      const response = await apiClient.post('/api/subscription/verify-checkout', { sessionId });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const subscriptionRepository = new SubscriptionRepository();

export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED' | 'TRIALING';

export interface SubscriptionStatusResponse {
  exists: boolean;
  status: SubscriptionStatus | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  isActive: boolean;
  daysRemaining: number | null;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

export interface CancelSubscriptionResponse {
  message: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

export interface ReactivateSubscriptionResponse {
  message: string;
  cancelAtPeriodEnd: boolean;
}

export interface CreateCheckoutRequest {
  email: string;
  businessName: string;
}

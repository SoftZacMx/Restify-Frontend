export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED' | 'TRIALING';

export type BillingPeriod = 'MONTHLY' | 'ANNUAL';

export interface SubscriptionPlan {
  id: string;
  name: string;
  billingPeriod: BillingPeriod;
  price: number;
}

export interface SubscriptionStatusResponse {
  exists: boolean;
  status: SubscriptionStatus | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  isActive: boolean;
  daysRemaining: number | null;
  plan: SubscriptionPlan | null;
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

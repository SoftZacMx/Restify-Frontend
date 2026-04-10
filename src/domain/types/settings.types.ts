export interface MaskedPaymentConfig {
  mercadoPago: {
    accessToken: string;
    webhookSecret: string;
  };
  isConfigured: boolean;
}

export interface SavePaymentConfigRequest {
  mercadoPago?: {
    accessToken?: string;
    webhookSecret?: string;
  };
}

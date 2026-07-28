/**
 * Configuración de la app expuesta por GET /api/config.
 * Usada por el frontend para feature flags (billing, etc.).
 */
export interface AppConfig {
  billingEnabled: boolean;
  environment: string;
  apiVersion: string;
}

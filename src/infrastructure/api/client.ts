import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { handleApiError } from '@/shared/utils/error-handler';
import { useAuthStore } from '@/presentation/store/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Callback para notificar suscripción expirada (registrado por el store para evitar dependencia circular)
let onSubscriptionExpired: (() => void) | null = null;
export function registerSubscriptionExpiredCallback(cb: () => void) {
  onSubscriptionExpired = cb;
}

/**
 * Cliente HTTP base configurado con interceptors
 * Maneja autenticación y errores globalmente.
 * En same-origin puede usar cookies HttpOnly (withCredentials: true).
 * En cross-origin (QA/producción) envía el token del store en Authorization para que el backend reciba la sesión.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor: envía el token del store en Authorization (necesario en QA/prod cross-origin)
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(handleApiError(error));
  }
);

// Response interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const appError = handleApiError(error);

    // Handle 401 (Unauthorized) - redirect to login
    if (appError.statusCode === 401 || appError.code === 'UNAUTHORIZED' || appError.code === 'TOKEN_EXPIRED') {
      window.location.href = '/auth/login';
    }

    // Handle 403 por suscripción expirada
    if (appError.code === 'SUBSCRIPTION_EXPIRED' || appError.code === 'SUBSCRIPTION_REQUIRED') {
      onSubscriptionExpired?.();
    }

    return Promise.reject(appError);
  }
);

export default apiClient;


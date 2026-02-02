import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { handleApiError } from '@/shared/utils/error-handler';
import { useAuthStore } from '@/presentation/store/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
    const url = config.url ?? config.baseURL ?? '';
    console.info('[API] Request', config.method?.toUpperCase(), url, { hasToken: !!token });
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
    const requestUrl = error?.config?.url ?? error?.config?.baseURL ?? 'unknown';
    const requestMethod = error?.config?.method ?? '?';

    // Handle 401 (Unauthorized) - redirect to login
    if (appError.statusCode === 401 || appError.code === 'UNAUTHORIZED' || appError.code === 'TOKEN_EXPIRED') {
      console.warn('[API] 401 → redirect to login', {
        url: requestMethod.toUpperCase() + ' ' + requestUrl,
        statusCode: appError.statusCode,
        code: appError.code,
        message: appError.message,
        storeHasToken: !!useAuthStore.getState().token,
        storeIsAuthenticated: useAuthStore.getState().isAuthenticated,
      });
      window.location.href = '/auth/login';
    }

    return Promise.reject(appError);
  }
);

export default apiClient;


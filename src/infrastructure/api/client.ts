import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { handleApiError } from '@/shared/utils/error-handler';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Cliente HTTP base configurado con interceptors
 * Maneja autenticación y errores globalmente
 * Usa HttpOnly cookies para autenticación (withCredentials: true)
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Permite enviar cookies HttpOnly automáticamente
});

// Request interceptor - Ya no necesita agregar token manualmente
// El token se envía automáticamente en la cookie HttpOnly
apiClient.interceptors.request.use(
  (config) => {
    // Las cookies HttpOnly se envían automáticamente por el navegador
    // No necesitamos leer ni enviar el token manualmente
    return config;
  },
  (error) => {
    // Convert request errors to AppError
    return Promise.reject(handleApiError(error));
  }
);

// Response interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Convert to AppError
    const appError = handleApiError(error);

    // Handle 401 (Unauthorized) - redirect to login
    if (appError.statusCode === 401 || appError.code === 'UNAUTHORIZED' || appError.code === 'TOKEN_EXPIRED') {
      // La cookie HttpOnly se limpia automáticamente por el backend
      // Solo redirigimos al login
      window.location.href = '/auth/login';
    }

    // Reject with AppError
    return Promise.reject(appError);
  }
);

export default apiClient;


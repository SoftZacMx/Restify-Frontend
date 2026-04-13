import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { handleApiError } from '@/shared/utils/error-handler';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Cliente HTTP para endpoints públicos (sin auth)
 * No envía token ni redirige en 401
 */
export const publicApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

publicApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(handleApiError(error));
  }
);

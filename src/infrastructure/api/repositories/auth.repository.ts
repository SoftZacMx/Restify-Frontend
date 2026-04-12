import apiClient from '../client';
import type { LoginRequest, LoginResponse, ApiResponse } from '@/domain/types';

/**
 * Repository para operaciones de autenticación
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Los errores de API se convierten automáticamente a AppError en el interceptor
 */
export class AuthRepository {
  /**
   * Inicia sesión con email y password
   * El rol se obtiene del backend después de validar las credenciales
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      // El backend actualmente requiere un rol en la URL, pero no lo usa realmente
      // Usamos 'user' como valor por defecto ya que el backend obtiene el rol de la BD
      // TODO: Actualizar backend para eliminar el parámetro :rol de la ruta
      const response = await apiClient.post('/api/auth/login/user', credentials);
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }

  /**
   * Verifica usuario para recuperación de contraseña
   */
  async verifyUser(email: string): Promise<ApiResponse<{ email: string }>> {
    try {
      const response = await apiClient.post('/api/auth/verify-user', { email });
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }

  /**
   * Establece nueva contraseña para un usuario (requiere autenticación)
   */
  async setPassword(userId: string, password: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post(`/api/auth/set-password/${userId}`, { password });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Recuperación de contraseña (público, sin autenticación)
   */
  async recoverPassword(userId: string, password: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post(`/api/auth/recover-password/${userId}`, { password });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cierra sesión del usuario
   * El backend limpia la cookie HttpOnly automáticamente
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.post('/api/auth/logout');
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }
}

// Exportar instancia singleton
export const authRepository = new AuthRepository();


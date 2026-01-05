import apiClient from '../client';
import type { User, CreateUserRequest, UpdateUserRequest, ApiResponse } from '@/domain/types';

/**
 * Repository para operaciones de usuarios
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Los errores de API se convierten automáticamente a AppError en el interceptor
 */
export class UserRepository {
  /**
   * Crea un nuevo usuario
   */
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.post('/api/users', userData);
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }

  /**
   * Lista usuarios con filtros opcionales
   */
  async listUsers(filters?: {
    search?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<User[]>> {
    try {
      const response = await apiClient.get('/api/users', { params: filters });
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }

  /**
   * Actualiza un usuario existente
   */
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.put(`/api/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }

  /**
   * Elimina un usuario
   */
  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }

  /**
   * Reactiva un usuario desactivado
   */
  async reactivateUser(userId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.patch(`/api/users/${userId}/reactivate`);
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }
}

// Exportar instancia singleton
export const userRepository = new UserRepository();


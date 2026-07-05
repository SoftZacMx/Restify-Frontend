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
    // El interceptor ya convierte cualquier error de axios a AppError.
    const response = await apiClient.post('/api/users', userData);
    return response.data;
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get(`/api/users/${userId}`);
    return response.data;
  }

  /**
   * Lista usuarios con filtros opcionales
   */
  async listUsers(filters?: {
    search?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get('/api/users', { params: filters });
    return response.data;
  }

  /**
   * Actualiza un usuario existente
   */
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    const response = await apiClient.put(`/api/users/${userId}`, userData);
    return response.data;
  }

  /**
   * Elimina un usuario
   */
  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/users/${userId}`);
    return response.data;
  }

  /**
   * Reactiva un usuario desactivado
   */
  async reactivateUser(userId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.patch(`/api/users/${userId}/reactivate`);
    return response.data;
  }

  /**
   * Resetea la contraseña de un empleado (solo OWNER/ADMIN): marca mustChangePassword
   * e invalida sus sesiones. El empleado define su nueva clave en el próximo login.
   */
  async resetUserPassword(userId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post(`/api/users/${userId}/reset-password`);
    return response.data;
  }
}

// Exportar instancia singleton
export const userRepository = new UserRepository();


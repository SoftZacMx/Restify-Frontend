import apiClient from '../client';
import type {
  MenuCategoryResponse,
  ApiResponse,
  CreateMenuCategoryRequest,
  UpdateMenuCategoryRequest,
  ListMenuCategoriesRequest,
} from '@/domain/types';

/**
 * Repository para operaciones de MenuCategories (CRUD de categorías)
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Los errores de API se convierten automáticamente a AppError en el interceptor
 */
export class MenuCategoryRepository {
  /**
   * Crea una nueva categoría
   */
  async createMenuCategory(categoryData: CreateMenuCategoryRequest): Promise<ApiResponse<MenuCategoryResponse>> {
    try {
      const response = await apiClient.post('/api/menu-categories', categoryData);
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }

  /**
   * Obtiene una categoría por ID
   */
  async getMenuCategoryById(categoryId: string): Promise<ApiResponse<MenuCategoryResponse>> {
    try {
      const response = await apiClient.get(`/api/menu-categories/${categoryId}`);
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }

  /**
   * Lista categorías con filtros opcionales
   */
  async listMenuCategories(filters?: ListMenuCategoriesRequest): Promise<ApiResponse<MenuCategoryResponse[]>> {
    try {
      const params: Record<string, string> = {};
      if (filters?.status !== undefined) {
        params.status = String(filters.status);
      }
      if (filters?.search) {
        params.search = filters.search;
      }
      const response = await apiClient.get('/api/menu-categories', { params });
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }

  /**
   * Actualiza una categoría existente
   */
  async updateMenuCategory(
    categoryId: string,
    categoryData: UpdateMenuCategoryRequest
  ): Promise<ApiResponse<MenuCategoryResponse>> {
    try {
      const response = await apiClient.put(`/api/menu-categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }

  /**
   * Elimina una categoría
   */
  async deleteMenuCategory(categoryId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/api/menu-categories/${categoryId}`);
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }
}

// Exportar instancia singleton
export const menuCategoryRepository = new MenuCategoryRepository();

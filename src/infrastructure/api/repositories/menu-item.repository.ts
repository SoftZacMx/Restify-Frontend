import apiClient from '../client';
import type {
  MenuItemResponse,
  ApiResponse,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  ListMenuItemsRequest,
} from '@/domain/types';

/**
 * Repository para operaciones de MenuItems (CRUD de platillos)
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Los errores de API se convierten automáticamente a AppError en el interceptor
 */
export class MenuItemRepository {
  /**
   * Crea un nuevo platillo
   */
  async createMenuItem(menuItemData: CreateMenuItemRequest): Promise<ApiResponse<MenuItemResponse>> {
    try {
      const response = await apiClient.post('/api/menu-items', menuItemData);
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }

  /**
   * Obtiene un platillo por ID
   */
  async getMenuItemById(menuItemId: string): Promise<ApiResponse<MenuItemResponse>> {
    try {
      const response = await apiClient.get(`/api/menu-items/${menuItemId}`);
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }

  /**
   * Lista platillos con filtros opcionales
   */
  async listMenuItems(filters?: ListMenuItemsRequest): Promise<ApiResponse<MenuItemResponse[]>> {
    try {
      const params: Record<string, string> = {};
      if (filters?.status !== undefined) {
        params.status = String(filters.status);
      }
      if (filters?.categoryId) {
        params.categoryId = filters.categoryId;
      }
      if (filters?.userId) {
        params.userId = filters.userId;
      }
      if (filters?.search) {
        params.search = filters.search;
      }
      const response = await apiClient.get('/api/menu-items', { params });
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }

  /**
   * Actualiza un platillo existente
   */
  async updateMenuItem(
    menuItemId: string,
    menuItemData: UpdateMenuItemRequest
  ): Promise<ApiResponse<MenuItemResponse>> {
    try {
      const response = await apiClient.put(`/api/menu-items/${menuItemId}`, menuItemData);
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }

  /**
   * Elimina un platillo
   */
  async deleteMenuItem(menuItemId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/api/menu-items/${menuItemId}`);
      return response.data;
    } catch (error) {
      // Error ya convertido a AppError por el interceptor
      throw error;
    }
  }
}

// Exportar instancia singleton
export const menuItemRepository = new MenuItemRepository();

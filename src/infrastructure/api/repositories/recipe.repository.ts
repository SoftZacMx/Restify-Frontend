import apiClient from '../client';
import type {
  ApiResponse,
  GetRecipeResponse,
  ReplaceRecipeRequest,
  AddRecipeItemRequest,
  UpdateRecipeItemRequest,
} from '@/domain/types';

/**
 * Repository para operaciones sobre la receta (menu_item_ingredients) de un MenuItem.
 * Los errores de API se convierten automáticamente a AppError en el interceptor.
 */
export class RecipeRepository {
  /**
   * Obtiene la receta del MenuItem (lista de ingredientes con datos del producto).
   */
  async getRecipe(menuItemId: string): Promise<ApiResponse<GetRecipeResponse>> {
    const response = await apiClient.get(`/api/menu-items/${menuItemId}/recipe`);
    return response.data;
  }

  /**
   * Reemplaza la receta completa. Mínimo 1 ingrediente; sin productos duplicados.
   * El MenuItem no debe estar marcado como ítem directo (productId set).
   */
  async replaceRecipe(
    menuItemId: string,
    body: ReplaceRecipeRequest
  ): Promise<ApiResponse<{ menuItemId: string; ingredients: { productId: string; quantity: string }[] }>> {
    const response = await apiClient.put(`/api/menu-items/${menuItemId}/recipe`, body);
    return response.data;
  }

  /**
   * Agrega un ingrediente puntual (409 si el producto ya está en la receta).
   */
  async addItem(menuItemId: string, body: AddRecipeItemRequest): Promise<ApiResponse<unknown>> {
    const response = await apiClient.post(`/api/menu-items/${menuItemId}/recipe/items`, body);
    return response.data;
  }

  /**
   * Cambia la cantidad de un ingrediente existente.
   */
  async updateItem(
    menuItemId: string,
    productId: string,
    body: UpdateRecipeItemRequest
  ): Promise<ApiResponse<unknown>> {
    const response = await apiClient.patch(
      `/api/menu-items/${menuItemId}/recipe/items/${productId}`,
      body
    );
    return response.data;
  }

  /**
   * Quita un ingrediente. La API responde 200 con `{ message }`.
   */
  async removeItem(menuItemId: string, productId: string): Promise<ApiResponse<unknown>> {
    const response = await apiClient.delete(
      `/api/menu-items/${menuItemId}/recipe/items/${productId}`
    );
    return response.data;
  }
}

// Instancia singleton
export const recipeRepository = new RecipeRepository();

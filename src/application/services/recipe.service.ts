import { recipeRepository } from '@/infrastructure/api/repositories/recipe.repository';
import type {
  GetRecipeResponse,
  ReplaceRecipeRequest,
} from '@/domain/types';
import { AppError } from '@/domain/errors';

/**
 * Servicio de recetas. Encapsula los endpoints `/api/menu-items/:id/recipe[/items[/:productId]]`.
 * El UI usa `getRecipe` para cargar y `replaceRecipe` para guardar — los endpoints granulares
 * (add / update / remove) están disponibles pero la UI por simplicidad reemplaza todo de una.
 */
export class RecipeService {
  async getRecipe(menuItemId: string): Promise<GetRecipeResponse> {
    if (!menuItemId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del menu item es requerido');
    }

    try {
      const response = await recipeRepository.getRecipe(menuItemId);
      if (!response.success || !response.data) {
        // No existe receta = sin ingredientes (no es un error).
        return { menuItemId, ingredients: [] };
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('RECIPE_FETCH_FAILED', 'Error al cargar la receta');
    }
  }

  async replaceRecipe(menuItemId: string, body: ReplaceRecipeRequest): Promise<void> {
    if (!menuItemId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del menu item es requerido');
    }
    if (!body.ingredients || body.ingredients.length === 0) {
      throw new AppError('VALIDATION_ERROR', 'La receta debe tener al menos un ingrediente');
    }

    // Validación cliente: sin duplicados, cantidades > 0.
    const seen = new Set<string>();
    for (const ing of body.ingredients) {
      if (!ing.productId) {
        throw new AppError('VALIDATION_ERROR', 'Hay un ingrediente sin producto seleccionado');
      }
      if (seen.has(ing.productId)) {
        throw new AppError('VALIDATION_ERROR', 'No podés repetir el mismo producto en la receta');
      }
      if (!Number.isFinite(ing.quantity) || ing.quantity <= 0) {
        throw new AppError('VALIDATION_ERROR', 'La cantidad de cada ingrediente debe ser mayor a 0');
      }
      seen.add(ing.productId);
    }

    try {
      const response = await recipeRepository.replaceRecipe(menuItemId, body);
      if (!response.success) {
        throw new AppError('RECIPE_UPDATE_FAILED', 'No se pudo guardar la receta');
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('RECIPE_UPDATE_FAILED', 'Error al guardar la receta');
    }
  }

  async removeIngredient(menuItemId: string, productId: string): Promise<void> {
    if (!menuItemId || !productId) {
      throw new AppError('VALIDATION_ERROR', 'IDs requeridos');
    }
    try {
      const response = await recipeRepository.removeItem(menuItemId, productId);
      if (!response.success) {
        throw new AppError('RECIPE_UPDATE_FAILED', 'No se pudo quitar el ingrediente');
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('RECIPE_UPDATE_FAILED', 'Error al quitar el ingrediente');
    }
  }
}

// Instancia singleton
export const recipeService = new RecipeService();

/**
 * Tipos relacionados con las recetas de MenuItem (menu_item_ingredients).
 */

import type { UnitOfMeasure } from './expense.types';

/**
 * Ingrediente que viene de GET /api/menu-items/:id/recipe.
 * `unit`: la unidad efectiva con la que se interpretó la cantidad (la del ingrediente
 *         si fue declarada, sino la del producto). Se usa para mostrar al usuario.
 * `productUnitOfMeasure`: la unidad base del producto. Útil para el selector de unidades.
 */
export interface RecipeIngredientResponse {
  productId: string;
  productName: string;
  quantity: string; // decimal serializado
  unit: UnitOfMeasure | null;
  productUnitOfMeasure: UnitOfMeasure | null;
}

/** Response completa del endpoint de receta. */
export interface GetRecipeResponse {
  menuItemId: string;
  ingredients: RecipeIngredientResponse[];
}

/** Body para PUT /api/menu-items/:id/recipe (reemplazo completo). */
export interface ReplaceRecipeRequest {
  ingredients: {
    productId: string;
    quantity: number;
    /** Si null/omitida, el backend asume la unidad del producto. */
    unit?: UnitOfMeasure | null;
  }[];
}

/** Body para POST /api/menu-items/:id/recipe/items (agregar uno). */
export interface AddRecipeItemRequest {
  productId: string;
  quantity: number;
  unit?: UnitOfMeasure | null;
}

/** Body para PATCH /api/menu-items/:id/recipe/items/:productId. */
export interface UpdateRecipeItemRequest {
  quantity: number;
  unit?: UnitOfMeasure | null;
}

/** Item editable en el editor de receta (estado local del formulario). */
export interface RecipeIngredientDraft {
  /** ID temporal para keys de React (puede ser productId si ya existe). */
  rowId: string;
  productId: string;
  /** Nombre del producto, cacheado del select del dialog para mostrar en la fila. */
  productName: string;
  quantity: string; // string para soportar input vacío
  /** Unidad elegida en la fila (opcional — si null hereda la del producto). */
  unit: UnitOfMeasure | null;
  /** Unidad base del producto, para mostrar las opciones compatibles del selector. */
  productUnit: UnitOfMeasure | null;
}

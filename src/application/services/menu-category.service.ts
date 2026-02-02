import { menuCategoryRepository } from '@/infrastructure/api/repositories/menu-category.repository';
import type {
  MenuCategoryResponse,
  CreateMenuCategoryRequest,
  UpdateMenuCategoryRequest,
  ListMenuCategoriesRequest,
} from '@/domain/types';
import { AppError } from '@/domain/errors';

/**
 * Servicio de MenuCategories (Categorías del Menú)
 * Contiene la lógica de negocio para operaciones de categorías
 * Cumple SRP: Solo maneja lógica de negocio de categorías
 */
export class MenuCategoryService {
  /**
   * Crea una nueva categoría
   * Valida los datos antes de enviarlos al repositorio
   */
  async createMenuCategory(categoryData: CreateMenuCategoryRequest): Promise<MenuCategoryResponse> {
    // Validaciones de negocio
    this.validateCreateCategoryData(categoryData);

    try {
      const response = await menuCategoryRepository.createMenuCategory(categoryData);
      if (!response.success || !response.data) {
        throw new AppError('MENU_CATEGORY_CREATION_FAILED', 'No se pudo crear la categoría');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('MENU_CATEGORY_CREATION_FAILED', 'Error al crear la categoría');
    }
  }

  /**
   * Obtiene una categoría por ID
   */
  async getMenuCategoryById(categoryId: string): Promise<MenuCategoryResponse> {
    if (!categoryId) {
      throw new AppError('VALIDATION_ERROR', 'El ID de la categoría es requerido');
    }

    try {
      const response = await menuCategoryRepository.getMenuCategoryById(categoryId);
      if (!response.success || !response.data) {
        throw new AppError('MENU_CATEGORY_NOT_FOUND', 'Categoría no encontrada');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('MENU_CATEGORY_FETCH_FAILED', 'Error al obtener la categoría');
    }
  }

  /**
   * Lista categorías con filtros opcionales
   */
  async listMenuCategories(filters?: ListMenuCategoriesRequest): Promise<MenuCategoryResponse[]> {
    try {
      const response = await menuCategoryRepository.listMenuCategories(filters);
      if (!response.success || !response.data) {
        return [];
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('MENU_CATEGORY_LIST_FAILED', 'Error al listar categorías');
    }
  }

  /**
   * Actualiza una categoría existente
   */
  async updateMenuCategory(
    categoryId: string,
    categoryData: UpdateMenuCategoryRequest
  ): Promise<MenuCategoryResponse> {
    if (!categoryId) {
      throw new AppError('VALIDATION_ERROR', 'El ID de la categoría es requerido');
    }

    // Validaciones de negocio
    this.validateUpdateCategoryData(categoryData);

    try {
      const response = await menuCategoryRepository.updateMenuCategory(categoryId, categoryData);
      if (!response.success || !response.data) {
        throw new AppError('MENU_CATEGORY_UPDATE_FAILED', 'No se pudo actualizar la categoría');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('MENU_CATEGORY_UPDATE_FAILED', 'Error al actualizar la categoría');
    }
  }

  /**
   * Elimina una categoría
   */
  async deleteMenuCategory(categoryId: string): Promise<void> {
    if (!categoryId) {
      throw new AppError('VALIDATION_ERROR', 'El ID de la categoría es requerido');
    }

    try {
      const response = await menuCategoryRepository.deleteMenuCategory(categoryId);
      if (!response.success) {
        throw new AppError('MENU_CATEGORY_DELETE_FAILED', 'No se pudo eliminar la categoría');
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('MENU_CATEGORY_DELETE_FAILED', 'Error al eliminar la categoría');
    }
  }

  /**
   * Valida los datos para crear una categoría
   */
  private validateCreateCategoryData(categoryData: CreateMenuCategoryRequest): void {
    if (!categoryData.name || categoryData.name.trim().length === 0) {
      throw new AppError('VALIDATION_ERROR', 'El nombre de la categoría es requerido');
    }

    if (categoryData.name.length > 200) {
      throw new AppError('VALIDATION_ERROR', 'El nombre no puede exceder 200 caracteres');
    }
  }

  /**
   * Valida los datos para actualizar una categoría
   */
  private validateUpdateCategoryData(categoryData: UpdateMenuCategoryRequest): void {
    if (categoryData.name !== undefined) {
      if (categoryData.name.trim().length === 0) {
        throw new AppError('VALIDATION_ERROR', 'El nombre no puede estar vacío');
      }
      if (categoryData.name.length > 200) {
        throw new AppError('VALIDATION_ERROR', 'El nombre no puede exceder 200 caracteres');
      }
    }
  }
}

// Exportar instancia singleton
export const menuCategoryService = new MenuCategoryService();

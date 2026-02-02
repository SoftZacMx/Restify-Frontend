import { menuItemRepository } from '@/infrastructure/api/repositories/menu-item.repository';
import type {
  MenuItemResponse,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  ListMenuItemsRequest,
} from '@/domain/types';
import { AppError } from '@/domain/errors';

/**
 * Servicio de MenuItems (Platillos)
 * Contiene la lógica de negocio para operaciones de platillos
 * Cumple SRP: Solo maneja lógica de negocio de platillos
 */
export class MenuItemService {
  /**
   * Crea un nuevo platillo
   * Valida los datos antes de enviarlos al repositorio
   */
  async createMenuItem(menuItemData: CreateMenuItemRequest): Promise<MenuItemResponse> {
    // Validaciones de negocio
    this.validateCreateMenuItemData(menuItemData);

    try {
      const response = await menuItemRepository.createMenuItem(menuItemData);
      if (!response.success || !response.data) {
        throw new AppError('MENU_ITEM_CREATION_FAILED', 'No se pudo crear el platillo');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('MENU_ITEM_CREATION_FAILED', 'Error al crear el platillo');
    }
  }

  /**
   * Obtiene un platillo por ID
   */
  async getMenuItemById(menuItemId: string): Promise<MenuItemResponse> {
    if (!menuItemId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del platillo es requerido');
    }

    try {
      const response = await menuItemRepository.getMenuItemById(menuItemId);
      if (!response.success || !response.data) {
        throw new AppError('MENU_ITEM_NOT_FOUND', 'Platillo no encontrado');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('MENU_ITEM_FETCH_FAILED', 'Error al obtener el platillo');
    }
  }

  /**
   * Lista platillos con filtros opcionales
   */
  async listMenuItems(filters?: ListMenuItemsRequest): Promise<MenuItemResponse[]> {
    try {
      const response = await menuItemRepository.listMenuItems(filters);
      if (!response.success || !response.data) {
        return [];
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('MENU_ITEM_LIST_FAILED', 'Error al listar platillos');
    }
  }

  /**
   * Actualiza un platillo existente
   */
  async updateMenuItem(
    menuItemId: string,
    menuItemData: UpdateMenuItemRequest
  ): Promise<MenuItemResponse> {
    if (!menuItemId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del platillo es requerido');
    }

    // Validaciones de negocio
    this.validateUpdateMenuItemData(menuItemData);

    try {
      const response = await menuItemRepository.updateMenuItem(menuItemId, menuItemData);
      if (!response.success || !response.data) {
        throw new AppError('MENU_ITEM_UPDATE_FAILED', 'No se pudo actualizar el platillo');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('MENU_ITEM_UPDATE_FAILED', 'Error al actualizar el platillo');
    }
  }

  /**
   * Elimina un platillo
   */
  async deleteMenuItem(menuItemId: string): Promise<void> {
    if (!menuItemId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del platillo es requerido');
    }

    try {
      const response = await menuItemRepository.deleteMenuItem(menuItemId);
      if (!response.success) {
        throw new AppError('MENU_ITEM_DELETE_FAILED', 'No se pudo eliminar el platillo');
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('MENU_ITEM_DELETE_FAILED', 'Error al eliminar el platillo');
    }
  }

  /**
   * Valida los datos para crear un platillo
   */
  private validateCreateMenuItemData(menuItemData: CreateMenuItemRequest): void {
    if (!menuItemData.name || menuItemData.name.trim().length === 0) {
      throw new AppError('VALIDATION_ERROR', 'El nombre del platillo es requerido');
    }

    if (menuItemData.name.length > 200) {
      throw new AppError('VALIDATION_ERROR', 'El nombre no puede exceder 200 caracteres');
    }

    if (menuItemData.price === undefined || menuItemData.price === null) {
      throw new AppError('VALIDATION_ERROR', 'El precio es requerido');
    }

    if (menuItemData.price <= 0) {
      throw new AppError('VALIDATION_ERROR', 'El precio debe ser mayor a 0');
    }

    // Validar máximo 2 decimales
    const decimalPlaces = (menuItemData.price.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      throw new AppError('VALIDATION_ERROR', 'El precio debe tener máximo 2 decimales');
    }

    // Validar formato UUID básico
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // categoryId es opcional, pero si se proporciona debe ser un UUID válido
    if (menuItemData.categoryId && !uuidRegex.test(menuItemData.categoryId)) {
      throw new AppError('VALIDATION_ERROR', 'El categoryId debe ser un UUID válido');
    }

    if (!menuItemData.userId) {
      throw new AppError('VALIDATION_ERROR', 'El userId es requerido');
    }

    if (!uuidRegex.test(menuItemData.userId)) {
      throw new AppError('VALIDATION_ERROR', 'El userId debe ser un UUID válido');
    }
  }

  /**
   * Valida los datos para actualizar un platillo
   */
  private validateUpdateMenuItemData(menuItemData: UpdateMenuItemRequest): void {
    if (menuItemData.name !== undefined) {
      if (menuItemData.name.trim().length === 0) {
        throw new AppError('VALIDATION_ERROR', 'El nombre no puede estar vacío');
      }
      if (menuItemData.name.length > 200) {
        throw new AppError('VALIDATION_ERROR', 'El nombre no puede exceder 200 caracteres');
      }
    }

    if (menuItemData.price !== undefined) {
      if (menuItemData.price <= 0) {
        throw new AppError('VALIDATION_ERROR', 'El precio debe ser mayor a 0');
      }
      const decimalPlaces = (menuItemData.price.toString().split('.')[1] || '').length;
      if (decimalPlaces > 2) {
        throw new AppError('VALIDATION_ERROR', 'El precio debe tener máximo 2 decimales');
      }
    }

    if (menuItemData.categoryId !== undefined) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(menuItemData.categoryId)) {
        throw new AppError('VALIDATION_ERROR', 'El categoryId debe ser un UUID válido');
      }
    }

    if (menuItemData.userId !== undefined) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(menuItemData.userId)) {
        throw new AppError('VALIDATION_ERROR', 'El userId debe ser un UUID válido');
      }
    }
  }
}

// Exportar instancia singleton
export const menuItemService = new MenuItemService();

/**
 * Tipos relacionados con el CRUD de MenuCategories (Categorías del Menú)
 * Las categorías se usan para organizar los platillos del menú
 */

/**
 * MenuCategory (Categoría del Menú)
 * Representa una categoría para organizar platillos
 */
export interface MenuCategory {
  id: string;                       // UUID de la categoría
  name: string;                     // Nombre de la categoría (mín 1, máx 200 caracteres)
  status: boolean;                  // Estado activo/inactivo
  createdAt: string;                // ISO 8601 date string
  updatedAt: string;                // ISO 8601 date string
}

/**
 * Request para crear una categoría
 */
export interface CreateMenuCategoryRequest {
  name: string;                     // REQUERIDO - Nombre de la categoría (mín 1, máx 200 caracteres)
  status?: boolean;                 // Opcional - Estado activo/inactivo (default: true)
}

/**
 * Request para actualizar una categoría
 */
export interface UpdateMenuCategoryRequest {
  name?: string;                    // Opcional - Nombre de la categoría (mín 1, máx 200 caracteres)
  status?: boolean;                 // Opcional - Estado activo/inactivo
}

/**
 * Request para listar categorías (query parameters)
 */
export interface ListMenuCategoriesRequest {
  status?: boolean | string;        // Filtrar por estado (en query params viene como string)
  search?: string;                  // Buscar por nombre (búsqueda parcial)
}

/**
 * Response al crear/obtener/actualizar una categoría
 */
export interface MenuCategoryResponse {
  id: string;
  name: string;
  status: boolean;
  createdAt: string;                // ISO 8601
  updatedAt: string;                // ISO 8601
}

// Aliases para claridad
export type CreateMenuCategoryResponse = MenuCategoryResponse;
export type GetMenuCategoryResponse = MenuCategoryResponse;
export type UpdateMenuCategoryResponse = MenuCategoryResponse;
export type ListMenuCategoriesResponse = MenuCategoryResponse[];

/**
 * Filtros para la tabla de categorías
 */
export interface MenuCategoryTableFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
}

/**
 * Datos para mostrar en la tabla de categorías
 */
export interface MenuCategoryTableItem {
  id: string;
  name: string;
  status: boolean;
  statusLabel: 'Activa' | 'Inactiva';
  createdAt: string;
  updatedAt: string;
}

/**
 * Props para componentes de tabla de categorías
 */
export interface MenuCategoryTableProps {
  categories: MenuCategoryTableItem[];
  isLoading?: boolean;
  onCategoryAction?: (categoryId: string, action: 'edit' | 'delete' | 'toggle-status') => void;
}

export interface MenuCategorySearchBarProps {
  filters: MenuCategoryTableFilters;
  onFiltersChange: (filters: MenuCategoryTableFilters) => void;
}

export interface MenuCategoryPaginationProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  onPageChange: (page: number) => void;
}

/**
 * Errores de validación del formulario de categoría
 */
export interface MenuCategoryFormErrors {
  name?: string;
  status?: string;
}

/**
 * Datos del formulario para crear categoría
 */
export type MenuCategoryFormData = CreateMenuCategoryRequest;

/**
 * Datos del formulario para editar categoría
 */
export type MenuCategoryEditFormData = UpdateMenuCategoryRequest;

/**
 * Para uso en selectores (dropdown)
 */
export type CategorySelectOption = Pick<MenuCategoryResponse, 'id' | 'name'>;

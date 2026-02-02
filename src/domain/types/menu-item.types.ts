/**
 * Tipos relacionados con el CRUD de MenuItems (Platillos del Menú)
 * NOTA: Estos son platillos del menú del restaurante, diferentes de Products
 * Los MenuItems SÍ pueden tener extras, tienen precio fijo y pertenecen a una categoría
 */

/**
 * MenuItem (Platillo del Menú)
 * Platillo del restaurante que aparece en el menú
 */
export interface MenuItem {
  id: string;                       // UUID del platillo
  name: string;                     // Nombre del platillo (mín 1, máx 200 caracteres)
  price: number;                    // Precio del platillo (positivo, máximo 2 decimales)
  status: boolean;                  // Estado activo/inactivo
  isExtra: boolean;                 // Indica si es un extra (default: false)
  categoryId: string;               // UUID de la categoría del menú
  userId: string;                   // UUID del usuario propietario
  createdAt: string;                // ISO 8601 date string
  updatedAt: string;                // ISO 8601 date string
}

/**
 * Request para crear un platillo
 */
export interface CreateMenuItemRequest {
  name: string;                     // REQUERIDO - Nombre del platillo (mín 1, máx 200 caracteres)
  price: number;                    // REQUERIDO - Precio del platillo (positivo, máximo 2 decimales)
  status?: boolean;                  // Opcional - Estado activo/inactivo (default: true)
  isExtra?: boolean;                 // Opcional - Si es un extra (default: false)
  categoryId?: string;               // Opcional - UUID de la categoría del menú (puede ser null o undefined)
  userId: string;                    // REQUERIDO - UUID del usuario que crea el platillo
}

/**
 * Request para actualizar un platillo
 */
export interface UpdateMenuItemRequest {
  name?: string;                     // Opcional - Nombre del platillo (mín 1, máx 200 caracteres)
  price?: number;                    // Opcional - Precio (positivo, máximo 2 decimales)
  status?: boolean;                  // Opcional - Estado activo/inactivo
  isExtra?: boolean;                 // Opcional - Si es un extra
  categoryId?: string;               // Opcional - UUID de la categoría (debe existir)
  userId?: string;                   // Opcional - UUID del usuario propietario (debe existir)
}

/**
 * Request para listar platillos (query parameters)
 */
export interface ListMenuItemsRequest {
  status?: boolean | string;        // Filtrar por estado (en query params viene como string)
  categoryId?: string;               // Filtrar por categoría (UUID)
  userId?: string;                  // Filtrar por usuario (UUID)
  search?: string;                  // Buscar por nombre (búsqueda parcial)
}

/**
 * Response al crear/obtener/actualizar un platillo
 */
export interface MenuItemResponse {
  id: string;
  name: string;
  price: number;                     // Número, no string
  status: boolean;
  isExtra: boolean;                  // Campo automático, no se puede modificar
  categoryId: string;
  userId: string;
  createdAt: string;                 // ISO 8601
  updatedAt: string;                 // ISO 8601
}

// Aliases para claridad
export type CreateMenuItemResponse = MenuItemResponse;
export type GetMenuItemResponse = MenuItemResponse;
export type UpdateMenuItemResponse = MenuItemResponse;
export type ListMenuItemsResponse = MenuItemResponse[];

/**
 * Filtros para la tabla de platillos
 */
export interface MenuItemTableFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  categoryId?: string;
  userId?: string;
}

/**
 * Datos para mostrar en la tabla de platillos
 */
export interface MenuItemTableItem {
  id: string;
  name: string;
  price: number;
  status: boolean;
  statusLabel: 'Activo' | 'Inactivo';
  isExtra: boolean;
  isExtraLabel: 'Sí' | 'No';
  categoryId: string;
  categoryName?: string;            // Nombre de la categoría (opcional, se puede obtener de la API)
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName?: string;                 // Nombre del usuario propietario (opcional)
}

/**
 * Props para componentes de tabla de platillos
 */
export interface MenuItemTableProps {
  menuItems: MenuItemTableItem[];
  isLoading?: boolean;
  onMenuItemAction?: (menuItemId: string, action: 'edit' | 'delete' | 'toggle-status') => void;
}

export interface MenuItemSearchBarProps {
  filters: MenuItemTableFilters;
  onFiltersChange: (filters: MenuItemTableFilters) => void;
  onExport?: () => void;
}

export interface MenuItemPaginationProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  onPageChange: (page: number) => void;
}

/**
 * Errores de validación del formulario de platillo
 */
export interface MenuItemFormErrors {
  name?: string;
  price?: string;
  status?: string;
  categoryId?: string;
  userId?: string;
}

/**
 * Datos del formulario para crear platillo
 */
export type MenuItemFormData = Omit<CreateMenuItemRequest, 'userId'> & {
  userId?: string;                   // Opcional en el formulario, requerido al enviar
};

/**
 * Datos del formulario para editar platillo
 */
export type MenuItemEditFormData = UpdateMenuItemRequest;

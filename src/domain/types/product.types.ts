/**
 * Tipos relacionados con el CRUD de Productos
 * NOTA: Estos son productos genéricos (Product), diferentes de MenuItem
 * Los productos NO pueden tener extras, solo MenuItem puede tener extras
 */

/**
 * Producto genérico (Product)
 * Diferente de MenuItem - usado para inventario/productos adicionales
 */
export interface Product {
  id: string;                       // UUID del producto
  name: string;                     // Nombre del producto (mín 1, máx 200 caracteres)
  description: string | null;        // Descripción del producto (máx 1000 caracteres)
  registrationDate: string;          // ISO 8601 date string - Fecha de registro
  status: boolean;                  // Estado activo/inactivo
  userId: string;                    // UUID del usuario propietario
  createdAt: string;                // ISO 8601 date string
  updatedAt: string;                // ISO 8601 date string
}

/**
 * Request para crear un producto
 */
export interface CreateProductRequest {
  name: string;                     // REQUERIDO - Nombre del producto (mín 1, máx 200 caracteres)
  description?: string | null;       // Opcional - Descripción (máx 1000 caracteres)
  status?: boolean;                  // Opcional - Estado activo/inactivo (default: true)
  userId: string;                    // REQUERIDO - UUID del usuario que crea el producto
}

/**
 * Request para actualizar un producto
 */
export interface UpdateProductRequest {
  name?: string;                     // Opcional - Nombre del producto (mín 1, máx 200 caracteres)
  description?: string | null;       // Opcional - Descripción (máx 1000 caracteres, puede ser null)
  status?: boolean;                  // Opcional - Estado activo/inactivo
}

/**
 * Request para listar productos (query parameters)
 */
export interface ListProductsRequest {
  status?: boolean;                  // Filtrar por estado (true = activos, false = inactivos)
  userId?: string;                  // Filtrar por usuario (UUID)
  search?: string;                  // Buscar por nombre (búsqueda parcial)
}

/**
 * Response al crear/obtener/actualizar un producto
 */
export interface ProductResponse {
  id: string;
  name: string;
  description: string | null;
  registrationDate: string;          // ISO 8601
  status: boolean;
  userId: string;
  createdAt: string;                  // ISO 8601
  updatedAt: string;                 // ISO 8601
}

// Aliases para claridad
export type CreateProductResponse = ProductResponse;
export type GetProductResponse = ProductResponse;
export type UpdateProductResponse = ProductResponse;
export type ListProductsResponse = ProductResponse[];

/**
 * Filtros para la tabla de productos
 */
export interface ProductTableFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  userId?: string;
}

/**
 * Datos para mostrar en la tabla de productos
 */
export interface ProductTableItem {
  id: string;
  name: string;
  description: string | null;
  status: boolean;
  statusLabel: 'Activo' | 'Inactivo';
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName?: string;                 // Nombre del usuario propietario (opcional, se puede obtener de la API)
}

/**
 * Props para componentes de tabla de productos
 */
export interface ProductTableProps {
  products: ProductTableItem[];
  isLoading?: boolean;
  onProductAction?: (productId: string, action: 'edit' | 'delete' | 'toggle-status') => void;
}

export interface ProductSearchBarProps {
  filters: ProductTableFilters;
  onFiltersChange: (filters: ProductTableFilters) => void;
  onExport?: () => void;
}

export interface ProductPaginationProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  onPageChange: (page: number) => void;
}

/**
 * Errores de validación del formulario de producto
 */
export interface ProductFormErrors {
  name?: string;
  description?: string;
  status?: string;
  userId?: string;
}

/**
 * Datos del formulario para crear producto
 */
export type ProductFormData = Omit<CreateProductRequest, 'userId'> & {
  userId?: string;                   // Opcional en el formulario, requerido al enviar
};

/**
 * Datos del formulario para editar producto
 */
export type ProductEditFormData = UpdateProductRequest;

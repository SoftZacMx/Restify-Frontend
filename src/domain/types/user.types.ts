import type { User, UserRole } from './index';

/**
 * Estado del usuario para filtros (Activo/Inactivo)
 */
export type UserStatusFilter = 'active' | 'inactive';

/**
 * Filtros para la tabla de usuarios
 */
export interface UserTableFilters {
  search?: string;
  role?: UserRole | 'all';
  status?: UserStatusFilter | 'all';
}

/**
 * Datos de paginación
 */
export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Datos para mostrar en la tabla de usuarios
 * Extiende User con información adicional para la UI
 */
export interface UserTableItem extends Omit<User, 'password'> {
  fullName: string; // Nombre completo concatenado
  statusLabel: 'Activo' | 'Inactivo'; // Etiqueta para mostrar
  roleLabel: string; // Etiqueta del rol para mostrar
}

/**
 * Props para componentes de tabla de usuarios
 */
export interface UserTableProps {
  users: UserTableItem[];
  isLoading?: boolean;
  onUserAction?: (userId: string, action: 'delete' | 'reactivate' | 'toggle-status') => void;
}

export interface UserSearchBarProps {
  filters: UserTableFilters;
  onFiltersChange: (filters: UserTableFilters) => void;
  onExport?: () => void;
}

export interface UserPaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

/**
 * Datos para crear un nuevo usuario
 */
export interface CreateUserRequest {
  name: string;
  last_name: string;
  second_last_name?: string | null;
  email: string;
  phone?: string | null;
  password: string;
  rol: UserRole;
  status: boolean;
}

/**
 * Datos para actualizar un usuario existente
 */
export interface UpdateUserRequest {
  name?: string;
  last_name?: string;
  second_last_name?: string | null;
  email?: string;
  phone?: string | null;
  password?: string;
  rol?: UserRole;
  status?: boolean;
}

/**
 * Errores de validación del formulario de usuario
 */
export interface UserFormErrors {
  name?: string;
  last_name?: string;
  second_last_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  rol?: string;
  status?: string;
}

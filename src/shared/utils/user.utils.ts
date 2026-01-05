import type { User, UserRole, UserTableItem } from '@/domain/types';

/**
 * Mapeo de roles a etiquetas en español
 */
const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  WAITER: 'Mesero',
  CHEF: 'Cocinero',
};

/**
 * Obtiene la etiqueta en español para un rol
 */
export const getRoleLabel = (role: UserRole): string => {
  return ROLE_LABELS[role] || role;
};

/**
 * Obtiene la etiqueta de estado (Activo/Inactivo)
 */
export const getStatusLabel = (status: boolean): 'Activo' | 'Inactivo' => {
  return status ? 'Activo' : 'Inactivo';
};

/**
 * Obtiene el nombre completo del usuario
 */
export const getFullName = (user: User): string => {
  const parts = [user.name, user.last_name];
  if (user.second_last_name) {
    parts.push(user.second_last_name);
  }
  return parts.join(' ');
};

/**
 * Formatea una fecha para mostrar en la UI
 * Formato: DD/MM/YYYY
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }

  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Convierte un User a UserTableItem para mostrar en la tabla
 */
export const formatUserForTable = (user: User): UserTableItem => {
  return {
    ...user,
    fullName: getFullName(user),
    statusLabel: getStatusLabel(user.status),
    roleLabel: getRoleLabel(user.rol),
  };
};

/**
 * Convierte un array de User a UserTableItem[]
 */
export const formatUsersForTable = (users: User[]): UserTableItem[] => {
  return users.map(formatUserForTable);
};


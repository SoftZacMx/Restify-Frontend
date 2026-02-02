import type { UserRole } from '@/domain/types';

/**
 * Rutas que un mesero (WAITER) puede acceder.
 * Solo punto de venta y órdenes (y sus subrutas).
 */
export const WAITER_ALLOWED_PATH_PREFIXES = ['/pos', '/orders'] as const;

/**
 * Indica si la ruta actual está permitida para el rol WAITER.
 */
export function isWaiterAllowedPath(pathname: string): boolean {
  return WAITER_ALLOWED_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'));
}

/**
 * Roles con acceso completo a todos los módulos (admin, gerente).
 * Meseros (WAITER) solo tienen acceso a POS y Órdenes.
 */
export const FULL_ACCESS_ROLES: UserRole[] = ['ADMIN', 'MANAGER', 'CHEF'];

/**
 * Indica si el rol tiene acceso completo a la aplicación.
 */
export function hasFullAccess(role: UserRole | undefined | null): boolean {
  return role != null && FULL_ACCESS_ROLES.includes(role);
}

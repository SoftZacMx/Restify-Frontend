import type { UserRole } from "@/domain/types";

/**
 * Rutas que un rol operativo (WAITER, CHEF) puede acceder.
 * Solo punto de venta y órdenes (y sus subrutas).
 */
export const OPERATIONAL_ALLOWED_PATH_PREFIXES = ["/pos", "/orders"] as const;

/** @deprecated Usar OPERATIONAL_ALLOWED_PATH_PREFIXES. Alias por compatibilidad. */
export const WAITER_ALLOWED_PATH_PREFIXES = OPERATIONAL_ALLOWED_PATH_PREFIXES;

/**
 * Indica si la ruta actual está permitida para los roles operativos (WAITER, CHEF).
 */
export function isWaiterAllowedPath(pathname: string): boolean {
  return OPERATIONAL_ALLOWED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

/**
 * Roles con acceso completo a todos los módulos (owner, admin, gerente).
 * Los roles operativos (WAITER, CHEF) solo tienen acceso a POS y Órdenes.
 */
export const FULL_ACCESS_ROLES: UserRole[] = [
  "OWNER",
  "ADMIN",
  "MANAGER",
];

/**
 * Indica si el rol tiene acceso completo a la aplicación.
 */
export function hasFullAccess(role: UserRole | undefined | null): boolean {
  return role != null && FULL_ACCESS_ROLES.includes(role);
}

/**
 * Roles con permisos críticos: billing, settings de pagos y correcciones
 * administrativas. Equivale a OWNER_ADMIN en la API.
 */
export const CRITICAL_ACCESS_ROLES: UserRole[] = [
  "OWNER",
  "ADMIN",
];

/**
 * Indica si el rol puede ejecutar acciones críticas.
 */
export function hasCriticalAccess(role: UserRole | undefined | null): boolean {
  return role != null && CRITICAL_ACCESS_ROLES.includes(role);
}

/**
 * Ruta por defecto tras iniciar sesión / elegir sucursal según el rol.
 * Los roles operativos (WAITER, CHEF) van a POS; el resto al dashboard.
 */
export function getDefaultRouteForRole(role: UserRole | undefined | null): string {
  return hasFullAccess(role) ? "/dashboard" : "/pos";
}

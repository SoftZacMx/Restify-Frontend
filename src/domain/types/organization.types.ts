/**
 * Tipos del módulo Organization (multi-tenancy).
 * El backend resuelve la organización desde el JWT: el frontend nunca envía el id.
 */

/** Resultado de cerrar la organización (soft-delete). */
export interface CloseOrganizationResult {
  id: string;
  status: string;
  closedAt: string | null;
}

/** Solicitud del enlace de reactivación por correo (paso 1, ruta pública). */
export interface RequestReactivationRequest {
  email: string;
}

/** Confirmación de reactivación con el token del correo (paso 2, ruta pública). */
export interface ReactivateOrganizationRequest {
  token: string;
}

/**
 * Resultado de reactivar la organización. Misma forma que el login: el owner queda
 * con sesión iniciada directamente (el backend setea la cookie HttpOnly), sin volver
 * a pedir contraseña.
 */
export interface ReactivateOrganizationResult {
  token: string;
  user: {
    id: string;
    name: string;
    last_name: string;
    second_last_name: string | null;
    email: string;
    rol: string;
    organizationId: string;
    organizationName: string;
    mustChangePassword: boolean;
    emailVerified: boolean;
  };
  branches?: Array<{ id: string; name: string }>;
}

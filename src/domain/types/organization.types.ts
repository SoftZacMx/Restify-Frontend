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

/** Credenciales para reactivar una organización cerrada (ruta pública). */
export interface ReactivateOrganizationRequest {
  email: string;
  password: string;
}

/** Resultado de reactivar la organización. */
export interface ReactivateOrganizationResult {
  token: string;
  organization: { id: string; name: string; status: string };
}

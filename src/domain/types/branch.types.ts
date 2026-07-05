/**
 * Tipos del módulo de Sucursales (Branch)
 * Espejo del contrato del backend (`/api/branches`).
 * El `organizationId` lo resuelve el backend desde el JWT: el frontend nunca lo envía.
 */

export type BranchStatus = 'active' | 'disabled';

/**
 * Item de la lista — respuesta de `GET /api/branches`.
 * Versión reducida: el backend no expone aquí dirección, teléfono ni datos sensibles.
 */
export interface BranchListItem {
  id: string;
  name: string;
  city: string;
  state: string;
  status: BranchStatus;
  assignedUsersCount: number;       // usuarios con acceso a esta sucursal
  lastOrderAt: string | null;        // ISO 8601 o null si nunca tuvo pedidos
}

/**
 * Detalle completo — respuesta de GET/POST/PATCH/disable/enable.
 */
export interface BranchDetail {
  id: string;
  organizationId: string;
  slug: string | null;               // identificador de la URL pública /menu/<slug>; null en sucursales legacy sin backfill
  name: string;
  state: string;
  city: string;
  street: string;
  exteriorNumber: string;
  phone: string;
  rfc: string | null;
  logoUrl: string | null;
  startOperations: string | null;   // "HH:mm"
  endOperations: string | null;      // "HH:mm"
  timezone: string;                  // default "America/Mexico_City"
  currency: string;                  // default "MXN"
  ticketConfig: unknown | null;
  paymentConfig: string | null;      // JSON serializado; no renderizar crudo
  hasPaymentConfig: boolean;         // derivado por el backend; usar este, no parsear paymentConfig
  status: BranchStatus;
  createdAt: string;                 // ISO 8601
  updatedAt: string;                 // ISO 8601
}

/**
 * Body para crear una sucursal — `POST /api/branches`.
 * Límites reflejan el `createBranchSchema` del backend.
 * No se incluyen `paymentConfig`/`ticketConfig`: se administran fuera de este módulo.
 */
export interface CreateBranchRequest {
  name: string;                      // requerido, 1–200
  state: string;                     // requerido, 1–100
  city: string;                      // requerido, 1–100
  street: string;                    // requerido, 1–200
  exteriorNumber: string;            // requerido, 1–20
  phone: string;                     // requerido, 1–30
  rfc?: string | null;               // opcional, ≤20
  logoUrl?: string | null;           // opcional, URL válida, ≤500
  startOperations?: string | null;   // opcional, "HH:mm"
  endOperations?: string | null;     // opcional, "HH:mm"
  timezone?: string;                 // opcional, default CDMX en backend
  currency?: string;                 // opcional, 1–8
}

/**
 * Body para actualizar — `PATCH /api/branches/:id`. Todos los campos opcionales.
 * Incluye `ticketConfig` (config de ticket térmico) porque la pantalla de configuración
 * de la sucursal sí lo administra; el backend lo acepta como objeto opcional/nullable.
 */
export type UpdateBranchRequest = Partial<CreateBranchRequest> & {
  ticketConfig?: Record<string, unknown> | null;
};

/**
 * Estado de los filtros de la UI del listado (no se mapea 1:1 al backend:
 * solo `includeDisabled` viaja como query param; `search` filtra en cliente).
 */
export interface BranchFilters {
  search: string;
  includeDisabled: boolean;
}

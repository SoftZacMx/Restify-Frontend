/**
 * Tipos relacionados con la gestión de stock (inventario).
 */

import type { UnitOfMeasure } from './expense.types';

/** Tipos de movimiento del backend (StockMovementType en Prisma). */
export type StockMovementType = 'PURCHASE' | 'SALE' | 'WASTE' | 'ADJUSTMENT' | 'SALE_REVERSAL';

/** Motivos válidos para una merma. */
export type WasteReason = 'EXPIRED' | 'BROKEN' | 'THEFT' | 'OTHER';

/**
 * Item de stock devuelto por GET /api/products/stock.
 * Decimales llegan como string desde el backend (Prisma Decimal serializado).
 */
export interface StockSummaryResponse {
  productId: string;
  name: string;
  description: string | null;
  unitOfMeasure: UnitOfMeasure | null;
  stockActual: string;
  averageCost: string;
  minStockAlert: string | null;
  trackStock: boolean;
  isLowStock: boolean;
}

/** Filtros que la UI envía al endpoint de listado de stock. */
export interface StockListApiFilters {
  search?: string;
  lowStock?: boolean;
}

/** Filtros del listado de stock en la UI (incluye estado intermedio que no va a la API). */
export interface StockListFilters {
  search: string;
  lowStockOnly: boolean;
}

/**
 * Body de PATCH /api/products/:id/stock-config.
 * Todos los campos son opcionales — el backend solo actualiza los presentes.
 */
export interface UpdateStockConfigRequest {
  trackStock?: boolean;
  unitOfMeasure?: UnitOfMeasure | null;
  minStockAlert?: number | null;
}

/**
 * Body de POST /api/stock/waste — registrar una merma.
 * `quantity` siempre positiva (el backend la convierte en negativa).
 */
export interface RecordWasteRequest {
  productId: string;
  quantity: number;
  reason: WasteReason;
  notes?: string | null;
}

/**
 * Body de POST /api/stock/adjust — ajuste por conteo físico.
 * El movement se calcula como `newStock - stockActual`.
 */
export interface RecordAdjustmentRequest {
  productId: string;
  newStock: number;
  reason: string;
  notes?: string | null;
}

/** Movement creado por el backend tras un waste/adjust. Algunos campos son `null` cuando no aplican. */
export interface StockMovementResponse {
  id: string;
  productId: string;
  quantity: string; // signed decimal
  type: StockMovementType;
  reason: string | null;
  createdAt: string; // ISO
}

/** Resultado de waste/adjust. `recorded=false` si no se generó movement (trackStock=false o diff=0). */
export interface RecordMovementResult {
  recorded: boolean;
  movement: StockMovementResponse | null;
}

/**
 * Item completo del historial de movimientos
 * (response de GET /api/products/:id/movements y GET /api/stock/movements).
 */
export interface StockMovementListItem {
  id: string;
  productId: string;
  quantity: string; // signed decimal
  type: StockMovementType;
  reason: string | null;
  notes: string | null;
  expenseItemId: string | null;
  orderItemId: string | null;
  userId: string | null;
  /** Nombre legible del usuario que generó el movement (Nombre + Apellido). null si es del sistema. */
  userName?: string | null;
  createdAt: string; // ISO
}

/** Filtros que la UI envía al endpoint de movements. */
export interface MovementsListApiFilters {
  type?: StockMovementType;
  from?: string; // ISO date
  to?: string; // ISO date
  limit?: number;
  offset?: number;
}

/** Filtros del listado de movements en la UI. */
export interface MovementsListFilters {
  type: StockMovementType | 'ALL';
  from: string; // YYYY-MM-DD o vacío
  to: string;
}

/** Item formateado para la tabla de movimientos (con cantidad como number signed). */
export interface MovementTableItem {
  id: string;
  productId: string;
  quantity: number; // signed
  type: StockMovementType;
  reason: string | null;
  notes: string | null;
  expenseItemId: string | null;
  orderItemId: string | null;
  userId: string | null;
  userName?: string | null;
  createdAt: string;
}

/** Estado de salud visual del stock (semáforo verde/amarillo/rojo). */
export type StockHealth = 'healthy' | 'warning' | 'critical';

/**
 * Item ya formateado para la tabla de stock.
 * Convierte strings a number y deriva el indicador de salud.
 */
export interface StockTableItem {
  productId: string;
  name: string;
  description: string | null;
  unitOfMeasure: UnitOfMeasure | null;
  stockActual: number;
  averageCost: number;
  minStockAlert: number | null;
  trackStock: boolean;
  isLowStock: boolean;
  health: StockHealth;
}

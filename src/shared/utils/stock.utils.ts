import type {
  StockSummaryResponse,
  StockTableItem,
  StockHealth,
  UnitOfMeasure,
} from '@/domain/types';

/** Etiqueta corta de cada unidad (la que se muestra al lado de cantidades, ej. "12.5 kg"). */
const UNIT_LABELS: Record<UnitOfMeasure, string> = {
  KG: 'kg',
  G: 'g',
  L: 'l',
  ML: 'ml',
  PCS: 'pcs',
  OTHER: 'u',
};

/**
 * Opciones canónicas de unidades para selects.
 * `name`  → texto que ve el usuario (ej. "Kilogramos").
 * `value` → enum del backend (ej. "KG"). Lo que se manda en los requests.
 *
 * Centralizado acá para que TODA la app use el mismo formato y mapeo.
 */
export const UNIT_OPTIONS: { name: string; value: UnitOfMeasure }[] = [
  { name: 'Kilogramos', value: 'KG' },
  { name: 'Gramos', value: 'G' },
  { name: 'Litros', value: 'L' },
  { name: 'Mililitros', value: 'ML' },
  { name: 'Piezas', value: 'PCS' },
  { name: 'Otro', value: 'OTHER' },
];

/** Mapa rápido de value → name (para mostrar la etiqueta larga dado un enum). */
const UNIT_NAME_BY_VALUE: Record<UnitOfMeasure, string> = UNIT_OPTIONS.reduce(
  (acc, opt) => ({ ...acc, [opt.value]: opt.name }),
  {} as Record<UnitOfMeasure, string>
);

/**
 * Opciones canónicas de motivos de movement de stock.
 * `value`       → string que persiste el backend (ej. "EXPIRED", "order cancelled").
 *                 Es lo que se manda/recibe a nivel API y queda guardado en DB.
 * `description` → texto legible en español que se muestra al usuario.
 *
 * Centralizado para que toda la UI traduzca igual y los flujos que insertan motivos
 * automáticos compartan el mismo vocabulario.
 *
 * Hay 3 grupos:
 *  - Mermas (WASTE) — el owner elige uno desde el modal "Registrar merma".
 *  - Reversas automáticas — backend los inserta (cancelar orden, editar items, etc).
 *  - Ajustes manuales (ADJUSTMENT) — el owner escribe libre, NO entran acá; se muestra
 *    el texto tal cual lo escribió.
 */
export const MOVEMENT_REASON_OPTIONS: { value: string; description: string }[] = [
  // WASTE
  { value: 'EXPIRED', description: 'Vencido' },
  { value: 'BROKEN', description: 'Roto / dañado' },
  { value: 'THEFT', description: 'Robo / faltante' },
  { value: 'OTHER', description: 'Otro' },
  // SALE_REVERSAL automáticos
  { value: 'order cancelled', description: 'Orden cancelada' },
  { value: 'order edited', description: 'Orden editada' },
  // ADJUSTMENT automático (compensación al borrar un Expense MERCHANDISE)
  { value: 'expense deleted', description: 'Gasto eliminado' },
];

/** Mapa rápido de value → description. */
const REASON_DESCRIPTION_BY_VALUE: Record<string, string> = MOVEMENT_REASON_OPTIONS.reduce(
  (acc, opt) => ({ ...acc, [opt.value]: opt.description }),
  {} as Record<string, string>
);

/**
 * Devuelve la descripción legible de un motivo de movement.
 * Si el value no está en el catálogo (ej. ajuste manual con texto libre),
 * devuelve el value tal cual — el owner ve lo que escribió.
 */
export const getMovementReasonDescription = (
  value: string | null | undefined
): string => {
  if (!value) return '';
  return REASON_DESCRIPTION_BY_VALUE[value] ?? value;
};

/** Devuelve el nombre largo de una unidad (ej. "Kilogramos"). */
export const getUnitName = (unit: UnitOfMeasure | null | undefined): string => {
  if (!unit) return '';
  return UNIT_NAME_BY_VALUE[unit] ?? '';
};

/** Convierte la unidad enum a su etiqueta corta. Devuelve string vacío si es null. */
export const formatUnit = (unit: UnitOfMeasure | null | undefined): string => {
  if (!unit) return '';
  return UNIT_LABELS[unit] ?? '';
};

/** Formatea una cantidad con su unidad (ej. "12.500 kg"). */
export const formatStockQuantity = (
  amount: number,
  unit: UnitOfMeasure | null | undefined
): string => {
  const unitLabel = formatUnit(unit);
  const formattedAmount = amount.toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
  return unitLabel ? `${formattedAmount} ${unitLabel}` : formattedAmount;
};

/** Formatea un costo promedio en formato moneda (ej. "$5.6700"). */
export const formatAverageCost = (cost: number): string => {
  return cost.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
};

/**
 * Calcula el indicador de salud del stock.
 * - critical (rojo): isLowStock === true (stock bajo o igual al mínimo).
 * - warning (amarillo): hay min configurado y stock <= min × 1.5.
 * - healthy (verde): el resto (incluye sin min configurado).
 */
export const getStockHealth = (
  stockActual: number,
  minStockAlert: number | null,
  isLowStock: boolean
): StockHealth => {
  if (isLowStock) return 'critical';
  if (minStockAlert != null && stockActual <= minStockAlert * 1.5) return 'warning';
  return 'healthy';
};

/** Convierte el response del backend al item formateado para la tabla. */
export const toStockTableItem = (item: StockSummaryResponse): StockTableItem => {
  const stockActual = Number(item.stockActual);
  const averageCost = Number(item.averageCost);
  const minStockAlert = item.minStockAlert != null ? Number(item.minStockAlert) : null;

  return {
    productId: item.productId,
    name: item.name,
    description: item.description,
    unitOfMeasure: item.unitOfMeasure,
    stockActual,
    averageCost,
    minStockAlert,
    trackStock: item.trackStock,
    isLowStock: item.isLowStock,
    health: getStockHealth(stockActual, minStockAlert, item.isLowStock),
  };
};

/** Map directo de un array de responses a items de tabla. */
export const formatStockForTable = (items: StockSummaryResponse[]): StockTableItem[] => {
  return items.map(toStockTableItem);
};

/**
 * Devuelve las unidades compatibles con la unidad base del producto.
 * Si la unidad base es KG/G, devuelve [KG, G]. Si es L/ML, devuelve [L, ML].
 * Para PCS/OTHER/null, solo permite la propia (PCS o OTHER) o la unidad existente.
 */
export const getCompatibleUnits = (productUnit: UnitOfMeasure | null): UnitOfMeasure[] => {
  if (!productUnit) return [];
  if (productUnit === 'KG' || productUnit === 'G') return ['KG', 'G'];
  if (productUnit === 'L' || productUnit === 'ML') return ['L', 'ML'];
  return [productUnit];
};

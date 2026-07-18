import type { LucideIcon } from 'lucide-react';
import { ShoppingCart, Receipt, Trash2, Sliders, RotateCcw } from 'lucide-react';
import type {
  StockSummaryResponse,
  StockTableItem,
  StockHealth,
  StockMovementType,
  UnitOfMeasure,
} from '@/domain/types';

/** Etiqueta corta de cada unidad (la que se muestra al lado de cantidades, ej. "12.5 kg"). */
const UNIT_LABELS: Record<UnitOfMeasure, string> = {
  KG: 'kg',
  G: 'g',
  L: 'L',
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

/**
 * Opción canónica de un tipo de movement (PURCHASE, SALE, etc.).
 * Trae el value (enum del backend), texto singular para el badge en la tabla,
 * texto plural para el filtro ("Compras"), ícono y clases de color del badge.
 *
 * Centralizado para que la tabla, los filtros y cualquier reporte usen el mismo
 * vocabulario y los mismos íconos. Si en el futuro cambia "Reversa" por "Anulación"
 * (o querés cambiar el color), se actualiza acá una sola vez.
 */
export interface MovementTypeOption {
  value: StockMovementType;
  description: string;       // singular — para badges y referencias en línea
  descriptionPlural: string; // plural — para filtros tipo "Tipo: Compras"
  icon: LucideIcon;          // ícono para badges/listas
  badgeClassName: string;    // tailwind classes con dark mode incluido (color base "fuerte")
  /**
   * Clase para hover/focus en items interactivos (filas, opciones de select, etc).
   * Mismo color base que el badge pero con opacidad reducida — el hover se siente
   * "del mismo elemento" en vez de un gris neutro.
   */
  hoverClassName: string;
}

export const MOVEMENT_TYPE_OPTIONS: MovementTypeOption[] = [
  {
    value: 'PURCHASE',
    description: 'Compra',
    descriptionPlural: 'Compras',
    icon: ShoppingCart,
    badgeClassName: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
    hoverClassName: 'hover:bg-green-200 dark:hover:bg-green-900/60 focus:bg-green-200 dark:focus:bg-green-900/60',
  },
  {
    value: 'SALE',
    description: 'Venta',
    descriptionPlural: 'Ventas',
    icon: Receipt,
    badgeClassName: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
    hoverClassName: 'hover:bg-blue-200 dark:hover:bg-blue-900/60 focus:bg-blue-200 dark:focus:bg-blue-900/60',
  },
  {
    value: 'WASTE',
    description: 'Merma',
    descriptionPlural: 'Mermas',
    icon: Trash2,
    badgeClassName: 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300',
    hoverClassName: 'hover:bg-orange-200 dark:hover:bg-orange-900/60 focus:bg-orange-200 dark:focus:bg-orange-900/60',
  },
  {
    value: 'ADJUSTMENT',
    description: 'Ajuste',
    descriptionPlural: 'Ajustes',
    icon: Sliders,
    badgeClassName: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
    hoverClassName: 'hover:bg-yellow-200 dark:hover:bg-yellow-900/60 focus:bg-yellow-200 dark:focus:bg-yellow-900/60',
  },
  {
    value: 'SALE_REVERSAL',
    description: 'Reversa',
    descriptionPlural: 'Reversas',
    icon: RotateCcw,
    badgeClassName: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300',
    hoverClassName: 'hover:bg-slate-300 dark:hover:bg-slate-600 focus:bg-slate-300 dark:focus:bg-slate-600',
  },
];

/** Mapa rápido de value → option. */
const TYPE_OPTION_BY_VALUE: Record<StockMovementType, MovementTypeOption> =
  MOVEMENT_TYPE_OPTIONS.reduce(
    (acc, opt) => ({ ...acc, [opt.value]: opt }),
    {} as Record<StockMovementType, MovementTypeOption>
  );

/** Devuelve la opción completa de un tipo (con icon, colores y descriptions). */
export const getMovementTypeOption = (
  value: StockMovementType
): MovementTypeOption => TYPE_OPTION_BY_VALUE[value];

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

/**
 * Utilidades para formatear y procesar órdenes
 */

import type { OrderResponse } from '@/domain/types';
import { formatCurrency } from './currency.utils';

/**
 * Información de estado de una orden para UI
 */
export interface OrderStatusInfo {
  label: string;
  color: 'yellow' | 'orange' | 'blue' | 'green' | 'gray';
  bgClass: string;
  textClass: string;
}

/**
 * Obtiene el label y color del estado de una orden
 */
export const getOrderStatusInfo = (order: OrderResponse): OrderStatusInfo => {
  if (!order.status && !order.delivered) {
    return {
      label: 'Pendiente',
      color: 'yellow',
      bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
      textClass: 'text-yellow-800 dark:text-yellow-300',
    };
  }
  if (!order.status && order.delivered) {
    return {
      label: 'Entregada',
      color: 'orange',
      bgClass: 'bg-orange-100 dark:bg-orange-900/30',
      textClass: 'text-orange-800 dark:text-orange-300',
    };
  }
  if (order.status && !order.delivered) {
    return {
      label: 'Pagada',
      color: 'blue',
      bgClass: 'bg-blue-100 dark:bg-blue-900/30',
      textClass: 'text-blue-800 dark:text-blue-300',
    };
  }
  if (order.status && order.delivered) {
    return {
      label: 'Completada',
      color: 'green',
      bgClass: 'bg-green-100 dark:bg-green-900/30',
      textClass: 'text-green-800 dark:text-green-300',
    };
  }
  return {
    label: 'Desconocido',
    color: 'gray',
    bgClass: 'bg-gray-100 dark:bg-gray-900/30',
    textClass: 'text-gray-800 dark:text-gray-300',
  };
};

/**
 * Obtiene el nombre del método de pago
 */
export const getPaymentMethodName = (method: number | null): string => {
  switch (method) {
    case 1:
      return 'Efectivo';
    case 2:
      return 'Transferencia';
    case 3:
      return 'Tarjeta';
    case null:
      return 'Pago dividido';
    default:
      return 'No especificado';
  }
};

/**
 * Obtiene el icono del método de pago
 */
export const getPaymentMethodIcon = (method: number | null): string => {
  switch (method) {
    case 1:
      return '💵';
    case 2:
      return '🏦';
    case 3:
      return '💳';
    case null:
      return '➗';
    default:
      return '❓';
  }
};

/**
 * Formatea el número de orden (últimos 8 caracteres del UUID)
 */
export const formatOrderNumber = (orderId: string): string => {
  return `#${orderId.slice(-8).toUpperCase()}`;
};

/**
 * Formatea la fecha de la orden
 */
export const formatOrderDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Formatea la hora de la orden
 */
export const formatOrderTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formatea la fecha y hora de la orden
 */
export const formatOrderDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export { formatCurrency } from './currency.utils';

/**
 * Cuenta los items totales de una orden
 */
export const countOrderItems = (order: OrderResponse): number => {
  if (!order.orderItems) return 0;
  return order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
};

/**
 * Obtiene el nombre para mostrar de la mesa o tipo de orden
 */
export const getOrderLocationDisplay = (order: OrderResponse): string => {
  if (order.table) {
    return `Mesa ${order.table.name}`;
  }
  if (order.origin === 'Delivery') {
    return 'Delivery';
  }
  if (order.origin === 'Pickup') {
    return 'Para llevar';
  }
  return order.origin || 'Sin mesa';
};

/** Etiqueta del origen para la tarjeta (solo tipo de servicio, sin mesa). */
export const getOrderOriginLabel = (order: OrderResponse): string => {
  const o = (order.origin || '').trim();
  if (!o) return '—';
  if (o.toLowerCase() === 'local') return 'Local';
  if (o === 'Pickup') return 'Para llevar';
  return o;
};

/** Origen comida en local (mesa / salón). */
export const isOrderLocalOrigin = (order: OrderResponse): boolean => {
  return (order.origin || '').trim().toLowerCase() === 'local';
};

/**
 * Nombre de mesa para mostrar: relación `order.table`, o mapa id→nombre desde la lista de mesas.
 */
export const getOrderTableDisplayName = (
  order: OrderResponse,
  tableNameById?: Map<string, string>
): string | null => {
  if (order.table?.name) return order.table.name.trim();
  if (order.tableId && tableNameById?.has(order.tableId)) {
    return tableNameById.get(order.tableId)!.trim();
  }
  return null;
};

/**
 * Texto de mesa para la card cuando el origen es local (siempre una línea: nombre o Sin mesa).
 * `null` si el origen no es local.
 */
export const getLocalOrderMesaLine = (
  order: OrderResponse,
  tableNameById?: Map<string, string>
): string | null => {
  if (!isOrderLocalOrigin(order)) return null;
  const name = getOrderTableDisplayName(order, tableNameById);
  if (name) return `Mesa ${name}`;
  if (order.tableId) return 'Mesa';
  return 'Sin mesa';
};

/**
 * Item de orden formateado para la tabla/lista
 */
export interface OrderTableItem {
  id: string;
  orderNumber: string;
  date: string;
  time: string;
  dateTime: string;
  location: string;
  client: string;
  itemsCount: number;
  subtotal: string;
  iva: string;
  tip: string;
  total: string;
  status: OrderStatusInfo;
  paymentMethod: string;
  paymentMethodIcon: string;
  origin: string;
  note: string | null;
  delivered: boolean;
  paid: boolean;
  raw: OrderResponse;
}

/**
 * Formatea una orden para mostrar en tabla/lista
 */
export const formatOrderForDisplay = (order: OrderResponse): OrderTableItem => {
  return {
    id: order.id,
    orderNumber: formatOrderNumber(order.id),
    date: formatOrderDate(order.date),
    time: formatOrderTime(order.date),
    dateTime: formatOrderDateTime(order.date),
    location: getOrderLocationDisplay(order),
    client: order.client || 'Sin nombre',
    itemsCount: countOrderItems(order),
    subtotal: formatCurrency(order.subtotal),
    iva: formatCurrency(order.iva),
    tip: formatCurrency(order.tip),
    total: formatCurrency(order.total),
    status: getOrderStatusInfo(order),
    paymentMethod: getPaymentMethodName(order.paymentMethod),
    paymentMethodIcon: getPaymentMethodIcon(order.paymentMethod),
    origin: order.origin,
    note: order.note,
    delivered: order.delivered,
    paid: order.status,
    raw: order,
  };
};

/**
 * Formatea múltiples órdenes para mostrar en tabla/lista
 */
export const formatOrdersForDisplay = (orders: OrderResponse[]): OrderTableItem[] => {
  return orders.map(formatOrderForDisplay);
};

/**
 * Filtros disponibles para la vista de órdenes
 */
export interface OrderViewFilters {
  search: string;
  status: 'all' | 'pending' | 'paid' | 'delivered' | 'completed';
  dateFrom: string;
  dateTo: string;
  tableId: string;
  origin: string;
}

/**
 * Valores por defecto de los filtros
 */
export const defaultOrderFilters: OrderViewFilters = {
  search: '',
  status: 'all',
  dateFrom: '',
  dateTo: '',
  tableId: '',
  origin: '',
};

/**
 * Fecha de hoy en formato YYYY-MM-DD (para inputs type="date" y filtros de API)
 */
export const getTodayDateString = (): string => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

/**
 * Filtros por defecto con fecha de hoy (órdenes del día al cargar)
 */
export const getDefaultOrderFiltersForToday = (): OrderViewFilters => ({
  ...defaultOrderFilters,
  dateFrom: getTodayDateString(),
  dateTo: getTodayDateString(),
});

/**
 * Convierte los filtros de la vista a filtros de la API
 */
export const convertViewFiltersToApiFilters = (
  filters: OrderViewFilters
): {
  status?: boolean;
  tableId?: string;
  origin?: string;
  dateFrom?: string;
  dateTo?: string;
} => {
  const apiFilters: {
    status?: boolean;
    tableId?: string;
    origin?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {};

  // Convertir status
  switch (filters.status) {
    case 'pending':
      apiFilters.status = false;
      break;
    case 'paid':
    case 'completed':
      apiFilters.status = true;
      break;
    // 'all' y 'delivered' no filtran por status
  }

  if (filters.tableId) {
    apiFilters.tableId = filters.tableId;
  }

  if (filters.origin) {
    apiFilters.origin = filters.origin;
  }

  // Fechas en ISO 8601 (UTC). Sin zona en el string, el backend interpreta en UTC.
  if (filters.dateFrom) {
    apiFilters.dateFrom = `${filters.dateFrom}T00:00:00.000Z`;
  }

  if (filters.dateTo) {
    apiFilters.dateTo = `${filters.dateTo}T23:59:59.999Z`;
  }

  return apiFilters;
};

/**
 * Filtra órdenes en el cliente (para búsqueda por texto y estado delivered)
 */
export const filterOrdersClient = (
  orders: OrderResponse[],
  filters: OrderViewFilters
): OrderResponse[] => {
  const list = Array.isArray(orders) ? orders : [];
  let filtered = [...list];

  // Filtrar por búsqueda (cliente o número de orden)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (order) =>
        order.id.toLowerCase().includes(searchLower) ||
        order.client?.toLowerCase().includes(searchLower) ||
        formatOrderNumber(order.id).toLowerCase().includes(searchLower)
    );
  }

  // Filtrar por estado delivered
  if (filters.status === 'delivered') {
    filtered = filtered.filter((order) => order.delivered && !order.status);
  }

  // Filtrar por completada (pagada Y entregada)
  if (filters.status === 'completed') {
    filtered = filtered.filter((order) => order.status && order.delivered);
  }

  return filtered;
};

/**
 * Filtros que aún dependen del cliente (búsqueda texto, entregada, completada con doble condición).
 * En ese modo se pide hasta 100 órdenes al API y se pagina en cliente.
 */
export const orderListNeedsClientSideFiltering = (filters: OrderViewFilters): boolean => {
  return (
    Boolean(filters.search?.trim()) ||
    filters.status === 'delivered' ||
    filters.status === 'completed'
  );
};

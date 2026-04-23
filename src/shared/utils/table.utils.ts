import type { TableResponse, TableTableItem, TableStatusInfo } from '@/domain/types';
import { APP_TIMEZONE } from '@/shared/constants';

/**
 * Formatea una mesa para mostrar en la tabla
 */
export function formatTableForDisplay(table: TableResponse): TableTableItem {
  return {
    id: table.id,
    name: table.name,
    status: table.status,
    statusLabel: table.status ? 'Activa' : 'Inactiva',
    availabilityStatus: table.availabilityStatus,
    availabilityLabel: table.availabilityStatus ? 'Libre' : 'Ocupada',
    createdAt: new Date(table.createdAt).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: APP_TIMEZONE,
    }),
    updatedAt: new Date(table.updatedAt).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: APP_TIMEZONE,
    }),
  };
}

/**
 * Formatea un array de mesas para mostrar en la tabla
 */
export function formatTablesForDisplay(tables: TableResponse[]): TableTableItem[] {
  return tables.map(formatTableForDisplay);
}

/**
 * Obtiene información del estado visual de una mesa
 */
export function getTableStatusInfo(table: TableResponse): TableStatusInfo {
  if (!table.status) {
    return {
      label: 'Deshabilitada',
      color: 'gray',
      canAssignOrder: false,
    };
  }

  if (table.availabilityStatus) {
    return {
      label: 'Libre',
      color: 'green',
      canAssignOrder: true,
    };
  }

  return {
    label: 'Ocupada',
    color: 'red',
    canAssignOrder: false,
  };
}

/**
 * Valida el nombre de mesa (texto no vacío, longitud razonable)
 */
export function validateTableName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'El nombre de la mesa es requerido';
  }
  if (trimmed.length > 64) {
    return 'El nombre no puede exceder 64 caracteres';
  }
  return null;
}

/**
 * Obtiene las clases CSS para el badge de estado
 */
export function getStatusBadgeClasses(status: boolean): string {
  return status
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
}

/**
 * Obtiene las clases CSS para el badge de disponibilidad
 */
export function getAvailabilityBadgeClasses(availabilityStatus: boolean): string {
  return availabilityStatus
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
}

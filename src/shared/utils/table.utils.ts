import type { TableResponse, TableTableItem, TableStatusInfo } from '@/domain/types';
import { APP_TIMEZONE } from '@/shared/constants';

/**
 * Formatea una ubicación para mostrar en la tabla
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
 * Formatea un array de ubicaciones para mostrar en la tabla
 */
export function formatTablesForDisplay(tables: TableResponse[]): TableTableItem[] {
  return tables.map(formatTableForDisplay);
}

/**
 * Obtiene información del estado visual de una ubicación
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
 * Valida el nombre de ubicación (texto no vacío, longitud razonable)
 */
export function validateTableName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'El nombre de la ubicación es requerido';
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
    ? 'bg-fresco-suave text-fresco-texto'
    : 'bg-destructive-suave text-destructive-texto';
}

/**
 * Obtiene las clases CSS para el badge de disponibilidad
 */
export function getAvailabilityBadgeClasses(availabilityStatus: boolean): string {
  return availabilityStatus
    ? 'bg-fresco-suave text-fresco-texto'
    : 'bg-apoyo-suave text-apoyo-texto';
}

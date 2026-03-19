// ============================================
// REQUEST INTERFACES
// ============================================

export interface CreateTableRequest {
  name: string;
  status?: boolean;
  availabilityStatus?: boolean;
  userId: string;
}

export interface UpdateTableRequest {
  name?: string;
  status?: boolean;
  availabilityStatus?: boolean;
}

export interface ListTablesRequest {
  status?: boolean;
  availabilityStatus?: boolean;
  userId?: string;
  /** Filtro exacto por nombre de mesa */
  name?: string;
}

// ============================================
// RESPONSE INTERFACES
// ============================================

export interface TableResponse {
  id: string;
  name: string;
  userId: string;
  status: boolean;
  availabilityStatus: boolean;
  createdAt: string;
  updatedAt: string;
}

// Aliases para claridad
export type CreateTableResponse = TableResponse;
export type GetTableResponse = TableResponse;
export type UpdateTableResponse = TableResponse;
export type ListTablesResponse = TableResponse[];

// ============================================
// UTILITY TYPES
// ============================================

// Para formularios de creación
export type TableFormData = Omit<CreateTableRequest, 'userId'>;

// Para formularios de edición
export type TableEditFormData = UpdateTableRequest;

// Para mostrar en listas/selectores (mesas disponibles)
export type AvailableTableOption = Pick<TableResponse, 'id' | 'name'>;

// Para uso en Order
export type TableForOrder = Pick<TableResponse, 'id' | 'name' | 'availabilityStatus'>;

// Estado visual de la mesa
export interface TableStatusInfo {
  label: string;
  color: 'green' | 'red' | 'gray';
  canAssignOrder: boolean;
}

// Para mostrar en tablas
export interface TableTableItem {
  id: string;
  name: string;
  status: boolean;
  statusLabel: 'Activa' | 'Inactiva';
  availabilityStatus: boolean;
  availabilityLabel: 'Libre' | 'Ocupada';
  createdAt: string;
  updatedAt: string;
}

// Para errores de formulario
export interface TableFormErrors {
  name?: string;
  status?: string;
  availabilityStatus?: string;
}

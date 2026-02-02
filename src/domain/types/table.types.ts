// ============================================
// REQUEST INTERFACES
// ============================================

export interface CreateTableRequest {
  numberTable: number;
  status?: boolean;
  availabilityStatus?: boolean;
  userId: string;
}

export interface UpdateTableRequest {
  numberTable?: number;
  status?: boolean;
  availabilityStatus?: boolean;
}

export interface ListTablesRequest {
  status?: boolean;
  availabilityStatus?: boolean;
  userId?: string;
  numberTable?: number;
}

// ============================================
// RESPONSE INTERFACES
// ============================================

export interface TableResponse {
  id: string;
  numberTable: number;
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
export type AvailableTableOption = Pick<TableResponse, 'id' | 'numberTable'>;

// Para uso en Order
export type TableForOrder = Pick<TableResponse, 'id' | 'numberTable' | 'availabilityStatus'>;

// Estado visual de la mesa
export interface TableStatusInfo {
  label: string;
  color: 'green' | 'red' | 'gray';
  canAssignOrder: boolean;
}

// Para mostrar en tablas
export interface TableTableItem {
  id: string;
  numberTable: number;
  status: boolean;
  statusLabel: 'Activa' | 'Inactiva';
  availabilityStatus: boolean;
  availabilityLabel: 'Libre' | 'Ocupada';
  createdAt: string;
  updatedAt: string;
}

// Para errores de formulario
export interface TableFormErrors {
  numberTable?: string;
  status?: string;
  availabilityStatus?: string;
}

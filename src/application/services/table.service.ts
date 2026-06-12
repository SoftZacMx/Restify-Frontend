import { tableRepository } from '@/infrastructure/api/repositories/table.repository';
import type {
  TableResponse,
  CreateTableRequest,
  UpdateTableRequest,
  ListTablesRequest,
} from '@/domain/types';
import { AppError } from '@/domain/errors';

export class TableService {
  /**
   * Crea una nueva ubicación
   */
  async createTable(data: CreateTableRequest): Promise<TableResponse> {
    this.validateCreateTableData(data);

    const response = await tableRepository.createTable(data);

    if (!response.success || !response.data) {
      throw new AppError('TABLE_CREATION_FAILED', 'No se pudo crear la ubicación');
    }

    return response.data;
  }

  /**
   * Obtiene una ubicación por su ID
   */
  async getTableById(id: string): Promise<TableResponse> {
    if (!id) {
      throw new AppError('VALIDATION_ERROR', 'El ID de la ubicación es requerido');
    }

    const response = await tableRepository.getTableById(id);

    if (!response.success || !response.data) {
      throw new AppError('TABLE_NOT_FOUND', 'Ubicación no encontrada');
    }

    return response.data;
  }

  /**
   * Lista todas las ubicaciones con filtros opcionales
   */
  async listTables(filters?: ListTablesRequest): Promise<TableResponse[]> {
    const response = await tableRepository.listTables(filters);

    if (!response.success || !response.data) {
      return [];
    }

    return response.data.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  }

  /**
   * Actualiza una ubicación existente
   */
  async updateTable(id: string, data: UpdateTableRequest): Promise<TableResponse> {
    if (!id) {
      throw new AppError('VALIDATION_ERROR', 'El ID de la ubicación es requerido');
    }

    this.validateUpdateTableData(data);

    const response = await tableRepository.updateTable(id, data);

    if (!response.success || !response.data) {
      throw new AppError('TABLE_UPDATE_FAILED', 'No se pudo actualizar la ubicación');
    }

    return response.data;
  }

  /**
   * Elimina una ubicación
   */
  async deleteTable(id: string): Promise<void> {
    if (!id) {
      throw new AppError('VALIDATION_ERROR', 'El ID de la ubicación es requerido');
    }

    const response = await tableRepository.deleteTable(id);

    if (!response.success) {
      throw new AppError('TABLE_DELETE_FAILED', 'No se pudo eliminar la ubicación');
    }
  }

  // ============================================
  // MÉTODOS DE CONVENIENCIA
  // ============================================

  /**
   * Obtiene todas las ubicaciones disponibles (activas y libres)
   */
  async getAvailableTables(): Promise<TableResponse[]> {
    return this.listTables({ status: true, availabilityStatus: true });
  }

  /**
   * Obtiene todas las ubicaciones ocupadas
   */
  async getOccupiedTables(): Promise<TableResponse[]> {
    return this.listTables({ status: true, availabilityStatus: false });
  }

  /**
   * Marca una ubicación como ocupada
   */
  async markAsOccupied(id: string): Promise<TableResponse> {
    return this.updateTable(id, { availabilityStatus: false });
  }

  /**
   * Marca una ubicación como libre
   */
  async markAsFree(id: string): Promise<TableResponse> {
    return this.updateTable(id, { availabilityStatus: true });
  }

  // ============================================
  // VALIDACIONES
  // ============================================

  private validateCreateTableData(data: CreateTableRequest): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const name = data.name?.trim();
    if (!name) {
      throw new AppError('VALIDATION_ERROR', 'El nombre de la ubicación es requerido');
    }
    if (name.length > 64) {
      throw new AppError('VALIDATION_ERROR', 'El nombre no puede exceder 64 caracteres');
    }

    if (!data.userId) {
      throw new AppError('VALIDATION_ERROR', 'El userId es requerido');
    }

    if (!uuidRegex.test(data.userId)) {
      throw new AppError('VALIDATION_ERROR', 'El userId debe ser un UUID válido');
    }
  }

  private validateUpdateTableData(data: UpdateTableRequest): void {
    if (data.name !== undefined) {
      const name = data.name.trim();
      if (!name) {
        throw new AppError('VALIDATION_ERROR', 'El nombre de la ubicación no puede estar vacío');
      }
      if (name.length > 64) {
        throw new AppError('VALIDATION_ERROR', 'El nombre no puede exceder 64 caracteres');
      }
    }
  }
}

export const tableService = new TableService();

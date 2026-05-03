import { stockRepository } from '@/infrastructure/api/repositories/stock.repository';
import type {
  StockListApiFilters,
  StockSummaryResponse,
  UpdateStockConfigRequest,
  RecordWasteRequest,
  RecordAdjustmentRequest,
  RecordMovementResult,
  StockMovementListItem,
  MovementsListApiFilters,
} from '@/domain/types';
import { AppError } from '@/domain/errors';

/**
 * Servicio de stock / inventario.
 * Encapsula la lógica de listar productos trackeados y sus alertas.
 */
export class StockService {
  /**
   * Lista los productos trackeados con su stock actual y costo promedio.
   * Si `lowStock=true`, devuelve sólo los que están bajo el mínimo configurado.
   */
  async listStock(filters?: StockListApiFilters): Promise<StockSummaryResponse[]> {
    try {
      const response = await stockRepository.listStock(filters);
      if (!response.success || !response.data) {
        return [];
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('STOCK_LIST_FAILED', 'Error al listar el stock');
    }
  }

  /**
   * Activa/configura el tracking de stock de un producto.
   * Si trackStock pasa a true, idealmente también se mandan unidad y mínimo;
   * si pasa a false, se preservan los valores existentes (para no perder config al reactivar).
   */
  async updateStockConfig(productId: string, config: UpdateStockConfigRequest): Promise<void> {
    if (!productId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del producto es requerido');
    }

    try {
      const response = await stockRepository.updateStockConfig(productId, config);
      if (!response.success) {
        throw new AppError('STOCK_CONFIG_UPDATE_FAILED', 'No se pudo actualizar la configuración de stock');
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('STOCK_CONFIG_UPDATE_FAILED', 'Error al actualizar la configuración de stock');
    }
  }

  /**
   * Registra una merma. Devuelve el resultado (puede ser `recorded=false` si el producto
   * no trackea stock — la API responde 200 pero sin movement).
   */
  async recordWaste(body: RecordWasteRequest): Promise<RecordMovementResult> {
    if (!body.productId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del producto es requerido');
    }
    if (!body.quantity || body.quantity <= 0) {
      throw new AppError('VALIDATION_ERROR', 'La cantidad debe ser mayor a 0');
    }

    try {
      const response = await stockRepository.recordWaste(body);
      if (!response.success || !response.data) {
        throw new AppError('STOCK_WASTE_FAILED', 'No se pudo registrar la merma');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('STOCK_WASTE_FAILED', 'Error al registrar la merma');
    }
  }

  /**
   * Ajuste por conteo físico. `newStock` >= 0; el motivo es obligatorio.
   */
  async recordAdjustment(body: RecordAdjustmentRequest): Promise<RecordMovementResult> {
    if (!body.productId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del producto es requerido');
    }
    if (body.newStock < 0) {
      throw new AppError('VALIDATION_ERROR', 'El nuevo stock no puede ser negativo');
    }
    if (!body.reason?.trim()) {
      throw new AppError('VALIDATION_ERROR', 'El motivo del ajuste es obligatorio');
    }

    try {
      const response = await stockRepository.recordAdjustment(body);
      if (!response.success || !response.data) {
        throw new AppError('STOCK_ADJUSTMENT_FAILED', 'No se pudo registrar el ajuste');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('STOCK_ADJUSTMENT_FAILED', 'Error al registrar el ajuste');
    }
  }

  /**
   * Lista el historial de movimientos de un producto. Soporta filtros por tipo y rango.
   */
  async listProductMovements(
    productId: string,
    filters?: MovementsListApiFilters
  ): Promise<StockMovementListItem[]> {
    if (!productId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del producto es requerido');
    }

    try {
      const response = await stockRepository.listProductMovements(productId, filters);
      if (!response.success || !response.data) {
        return [];
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('STOCK_MOVEMENTS_LIST_FAILED', 'Error al cargar los movimientos');
    }
  }
}

// Instancia singleton
export const stockService = new StockService();

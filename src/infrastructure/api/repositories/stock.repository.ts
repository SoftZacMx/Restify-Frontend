import apiClient from '../client';
import type {
  ApiResponse,
  StockListApiFilters,
  StockSummaryResponse,
  UpdateStockConfigRequest,
  RecordWasteRequest,
  RecordAdjustmentRequest,
  RecordMovementResult,
  StockMovementListItem,
  MovementsListApiFilters,
} from '@/domain/types';

/**
 * Repository para operaciones de stock / inventario.
 * Implementa el patrón Repository para abstraer el acceso a datos.
 * Los errores de API se convierten automáticamente a AppError en el interceptor.
 */
export class StockRepository {
  /**
   * Lista productos con stock (solo trackeados). Soporta filtro por bajo mínimo y búsqueda.
   * Normaliza la respuesta: acepta array directo o `{ success, data }`.
   */
  async listStock(filters?: StockListApiFilters): Promise<ApiResponse<StockSummaryResponse[]>> {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.lowStock !== undefined) params.lowStock = String(filters.lowStock);

    const response = await apiClient.get('/api/products/stock', { params });
    const body = response.data as unknown;

    if (Array.isArray(body)) {
      return { success: true, data: body, timestamp: new Date().toISOString() };
    }
    if (body && typeof body === 'object' && 'data' in (body as object)) {
      const b = body as ApiResponse<StockSummaryResponse[]>;
      if (Array.isArray(b.data)) {
        return {
          success: true,
          data: b.data,
          timestamp: b.timestamp ?? new Date().toISOString(),
        };
      }
    }
    return { success: true, data: [], timestamp: new Date().toISOString() };
  }

  /**
   * Actualiza la configuración de stock de un producto: trackStock, unidad de medida,
   * mínimo de alerta. Solo manda los campos presentes — el backend hace patch parcial.
   */
  async updateStockConfig(
    productId: string,
    config: UpdateStockConfigRequest
  ): Promise<ApiResponse<{ updated: true }>> {
    const response = await apiClient.patch(
      `/api/products/${productId}/stock-config`,
      config
    );
    return response.data;
  }

  /**
   * Registra una merma. `quantity` siempre positiva.
   * El backend devuelve `recorded=false` si el producto no trackea stock.
   */
  async recordWaste(body: RecordWasteRequest): Promise<ApiResponse<RecordMovementResult>> {
    const response = await apiClient.post('/api/stock/waste', body);
    return response.data;
  }

  /**
   * Ajuste por conteo físico. `newStock` >= 0.
   * El backend calcula el movement como diferencia con el stock actual.
   */
  async recordAdjustment(body: RecordAdjustmentRequest): Promise<ApiResponse<RecordMovementResult>> {
    const response = await apiClient.post('/api/stock/adjust', body);
    return response.data;
  }

  /**
   * Lista los movimientos de stock de un producto específico.
   * Filtros opcionales: rango de fechas, tipo, paginación.
   * Normaliza la respuesta: acepta array directo o `{ success, data }`.
   */
  async listProductMovements(
    productId: string,
    filters?: MovementsListApiFilters
  ): Promise<ApiResponse<StockMovementListItem[]>> {
    const params: Record<string, string> = {};
    if (filters?.type) params.type = filters.type;
    if (filters?.from) params.from = filters.from;
    if (filters?.to) params.to = filters.to;
    if (filters?.limit !== undefined) params.limit = String(filters.limit);
    if (filters?.offset !== undefined) params.offset = String(filters.offset);

    const response = await apiClient.get(`/api/products/${productId}/movements`, { params });
    const body = response.data as unknown;

    if (Array.isArray(body)) {
      return { success: true, data: body, timestamp: new Date().toISOString() };
    }
    if (body && typeof body === 'object' && 'data' in (body as object)) {
      const b = body as ApiResponse<StockMovementListItem[]>;
      if (Array.isArray(b.data)) {
        return {
          success: true,
          data: b.data,
          timestamp: b.timestamp ?? new Date().toISOString(),
        };
      }
    }
    return { success: true, data: [], timestamp: new Date().toISOString() };
  }
}

// Instancia singleton
export const stockRepository = new StockRepository();

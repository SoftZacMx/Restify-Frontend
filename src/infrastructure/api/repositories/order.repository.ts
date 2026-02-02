import apiClient from '../client';
import type {
  CreateOrderRequest,
  OrderResponse,
  UpdateOrderRequest,
  ListOrdersRequest,
  PayOrderRequest,
  PayOrderResult,
  ApiResponse,
} from '@/domain/types';

/**
 * Repository para operaciones de órdenes
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Los errores de API se convierten automáticamente a AppError en el interceptor
 */
export class OrderRepository {
  /**
   * Crea una nueva orden
   */
  async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> {
    try {
      const response = await apiClient.post('/api/orders', orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene una orden por ID
   */
  async getOrderById(orderId: string): Promise<ApiResponse<OrderResponse>> {
    try {
      const response = await apiClient.get(`/api/orders/${orderId}`);
      const data = response.data as ApiResponse<OrderResponse>;
      if (data?.data) {
        const raw = data.data as unknown as Record<string, unknown>;
        (response.data as ApiResponse<OrderResponse>).data = this.normalizeOrder(raw);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Paga una orden (POST /api/orders/:order_id/pay)
   * Backend crea el pago, actualiza la orden y libera la mesa si aplica.
   */
  async payOrder(
    orderId: string,
    body: PayOrderRequest
  ): Promise<ApiResponse<PayOrderResult>> {
    try {
      const response = await apiClient.post(`/api/orders/${orderId}/pay`, body);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza una orden existente
   */
  async updateOrder(
    orderId: string,
    orderData: UpdateOrderRequest
  ): Promise<ApiResponse<OrderResponse>> {
    try {
      const response = await apiClient.put(`/api/orders/${orderId}`, orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Normaliza una orden de la API (acepta snake_case del backend: order_items, etc.)
   */
  private normalizeOrder(raw: Record<string, unknown>): OrderResponse {
    const order = raw as unknown as OrderResponse;
    const items = order.orderItems ?? (raw.order_items as OrderResponse['orderItems']);
    return { ...order, orderItems: items };
  }

  /**
   * Lista órdenes con filtros opcionales
   */
  async listOrders(filters?: ListOrdersRequest): Promise<ApiResponse<OrderResponse[]>> {
    try {
      const response = await apiClient.get('/api/orders', {
        params: { ...filters, include: 'orderItems' },
      });
      const data = response.data as ApiResponse<OrderResponse[]>;
      if (data?.data && Array.isArray(data.data)) {
        data.data = data.data.map((o) => this.normalizeOrder(o as unknown as Record<string, unknown>));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina una orden
   */
  async deleteOrder(orderId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene órdenes pendientes de una mesa
   */
  async getOrdersByTable(tableId: string, status?: boolean): Promise<ApiResponse<OrderResponse[]>> {
    try {
      const response = await apiClient.get('/api/orders', {
        params: { tableId, status },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene órdenes de un usuario/mesero
   */
  async getOrdersByUser(userId: string, status?: boolean): Promise<ApiResponse<OrderResponse[]>> {
    try {
      const response = await apiClient.get('/api/orders', {
        params: { userId, status },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Exportar instancia singleton
export const orderRepository = new OrderRepository();

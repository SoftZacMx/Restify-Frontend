import apiClient from '../client';
import type {
  CreateOrderRequest,
  OrderResponse,
  UpdateOrderRequest,
  ListOrdersRequest,
  ListOrdersResponse,
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
   * Lista órdenes con filtros opcionales.
   * Devuelve la respuesta del backend tal cual: { data: { data: Order[], pagination } }.
   */
  async listOrders(filters?: ListOrdersRequest): Promise<ApiResponse<ListOrdersResponse>> {
    try {
      const response = await apiClient.get('/api/orders', {
        params: { ...filters, include: 'orderItems' },
      });
      const body = response.data as ApiResponse<ListOrdersResponse>;
      if (body?.data?.data && Array.isArray(body.data.data)) {
        body.data.data = body.data.data.map((o: unknown) =>
          this.normalizeOrder(o as Record<string, unknown>)
        );
      }
      return body;
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

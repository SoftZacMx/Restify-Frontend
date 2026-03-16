import apiClient from '../client';
import type {
  CreateOrderRequest,
  OrderResponse,
  OrderItemResponse,
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
   * Obtiene una orden por ID y asegura que ítems y extras tengan nombre (enriquece si el backend no los envía).
   */
  async getOrderById(orderId: string): Promise<ApiResponse<OrderResponse>> {
    try {
      const response = await apiClient.get(`/api/orders/${orderId}`);
      const data = response.data as ApiResponse<OrderResponse>;
      if (data?.data) {
        const raw = data.data as unknown as Record<string, unknown>;
        const normalized = this.normalizeOrder(raw);
        (response.data as ApiResponse<OrderResponse>).data = await this.enrichOrderWithNames(normalized);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Si la API no devolvió menuItem/product/extra con nombre, los obtiene de menu-items y products.
   */
  private async enrichOrderWithNames(order: OrderResponse): Promise<OrderResponse> {
    const items = order.orderItems ?? [];
    if (items.length === 0) return order;

    const menuItemIdsToFetch = new Set<string>();
    const productIdsToFetch = new Set<string>();
    for (const item of items) {
      if (item.menuItemId && !(item.menuItem as { name?: string } | undefined)?.name) {
        menuItemIdsToFetch.add(item.menuItemId);
      }
      if (item.productId && !(item.product as { name?: string } | undefined)?.name) {
        productIdsToFetch.add(item.productId);
      }
      for (const ex of item.extras ?? []) {
        if (ex.extraId && !(ex.extra as { name?: string } | undefined)?.name) {
          menuItemIdsToFetch.add(ex.extraId);
        }
      }
    }

    const fetchMenuItem = async (id: string): Promise<{ id: string; name: string } | null> => {
      try {
        const res = await apiClient.get(`/api/menu-items/${id}`);
        const d = (res.data as ApiResponse<{ id: string; name: string }>)?.data;
        return d ? { id: d.id, name: d.name } : null;
      } catch {
        return null;
      }
    };
    const fetchProduct = async (id: string): Promise<{ id: string; name: string } | null> => {
      try {
        const res = await apiClient.get(`/api/products/${id}`);
        const d = (res.data as ApiResponse<{ id: string; name: string }>)?.data;
        return d ? { id: d.id, name: d.name } : null;
      } catch {
        return null;
      }
    };

    const [menuResults, productResults] = await Promise.all([
      Promise.all([...menuItemIdsToFetch].map((id) => fetchMenuItem(id).then((r) => [id, r] as const))),
      Promise.all([...productIdsToFetch].map((id) => fetchProduct(id).then((r) => [id, r] as const))),
    ]);
    const menuMap = new Map<string, { id: string; name: string }>();
    const productMap = new Map<string, { id: string; name: string }>();
    menuResults.forEach(([id, r]) => r && menuMap.set(id, r));
    productResults.forEach(([id, r]) => r && productMap.set(id, r));

    const orderItems = items.map((item): OrderItemResponse => {
      const menuItem = (item.menuItem as { name?: string } | undefined)?.name
        ? item.menuItem
        : item.menuItemId
          ? menuMap.get(item.menuItemId) ?? item.menuItem
          : item.menuItem;
      const product = (item.product as { name?: string } | undefined)?.name
        ? item.product
        : item.productId
          ? productMap.get(item.productId) ?? item.product
          : item.product;
      const extras = (item.extras ?? []).map((ex) => {
        const extra = (ex.extra as { name?: string } | undefined)?.name
          ? ex.extra
          : menuMap.get(ex.extraId) ?? ex.extra;
        return { ...ex, extra };
      });
      return { ...item, menuItem, product, extras } as OrderItemResponse;
    });

    return { ...order, orderItems };
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
   * Normaliza una orden de la API (acepta snake_case: order_items, menu_item, etc.)
   * para que el detalle muestre siempre los nombres de producto/menuItem y extras.
   */
  private normalizeOrder(raw: Record<string, unknown>): OrderResponse {
    const order = raw as unknown as OrderResponse;
    const rawItems = (order.orderItems ?? raw.order_items) as OrderResponse['orderItems'] | undefined;
    if (!rawItems || !Array.isArray(rawItems)) {
      return { ...order, orderItems: [] };
    }
    const orderItems: OrderItemResponse[] = rawItems.map((item) => {
      const it = item as unknown as Record<string, unknown>;
      const menuItem = it.menuItem ?? it.menu_item;
      const product = it.product;
      const rawExtras = (it.extras ?? []) as Array<Record<string, unknown>>;
      const extras = rawExtras.map((ex) => ({ ...ex, extra: ex.extra ?? ex.extra }));
      return { ...item, menuItem, product, extras } as OrderItemResponse;
    });
    return { ...order, orderItems };
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

import { publicApiClient } from '../public-client';

export interface CreatePublicOrderItem {
  menuItemId: string;
  quantity: number;
  note?: string | null;
  extras?: { extraId: string; quantity: number }[];
}

export interface CreatePublicOrderRequest {
  customerName: string;
  customerPhone: string;
  orderType: 'DELIVERY' | 'PICKUP';
  deliveryAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  scheduledAt?: string | null;
  items: CreatePublicOrderItem[];
}

export interface CreatePublicOrderResponse {
  id: string;
  trackingToken: string;
  total: number;
  subtotal: number;
  origin: string;
  customerName: string;
  orderType: 'DELIVERY' | 'PICKUP';
  createdAt: string;
}

export interface PayPublicOrderResponse {
  paymentId: string;
  preferenceId: string;
  initPoint: string;
  expiresAt: string;
}

export interface StartCheckoutResponse {
  checkoutId: string;
  trackingToken: string;
  paymentId: string;
  preferenceId: string;
  initPoint: string;
  expiresAt: string;
  total: number;
}

export interface PublicOrderStatusResponse {
  trackingToken: string;
  status: 'PENDING_PAYMENT' | 'PAID' | 'PREPARING' | 'READY' | 'ON_THE_WAY' | 'DELIVERED';
  customerName: string;
  orderType: 'DELIVERY' | 'PICKUP';
  scheduledAt: string | null;
  items: { name: string; quantity: number; total: number }[];
  total: number;
  createdAt: string;
}

export class PublicOrderRepository {
  async createOrder(
    branchId: string,
    data: CreatePublicOrderRequest
  ): Promise<CreatePublicOrderResponse> {
    const response = await publicApiClient.post('/api/public/orders', { ...data, branchId });
    return response.data.data;
  }

  async payOrder(orderId: string): Promise<PayPublicOrderResponse> {
    const response = await publicApiClient.post(`/api/public/orders/${orderId}/pay`);
    return response.data.data;
  }

  /**
   * Inicia el pago SIN crear la orden todavía (Opción A). Guarda un borrador y
   * devuelve el initPoint de Mercado Pago + trackingToken. La orden real se materializa
   * al confirmar el pago. Reemplaza al par createOrder + payOrder para evitar órdenes
   * huérfanas en pagos rechazados y duplicados al reintentar.
   */
  async startCheckout(
    branchId: string,
    data: CreatePublicOrderRequest
  ): Promise<StartCheckoutResponse> {
    const response = await publicApiClient.post('/api/public/checkout', { ...data, branchId });
    return response.data.data;
  }

  async getOrderStatus(trackingToken: string): Promise<PublicOrderStatusResponse> {
    const response = await publicApiClient.get(`/api/public/orders/${trackingToken}/status`);
    return response.data.data;
  }

  /**
   * Status por orderId. Se usa al volver de Mercado Pago (la back_url trae el orderId
   * en el external_reference) cuando el cliente perdió el trackingToken guardado en
   * localStorage (típico si MP abrió el checkout en su webview con storage aparte).
   */
  async getOrderStatusByOrderId(orderId: string): Promise<PublicOrderStatusResponse> {
    const response = await publicApiClient.get(`/api/public/orders/by-order-id/${orderId}/status`);
    return response.data.data;
  }
}

export const publicOrderRepository = new PublicOrderRepository();

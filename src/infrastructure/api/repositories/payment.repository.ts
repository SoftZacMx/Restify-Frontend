import apiClient from '../client';
import type {
  PayOrderWithSplitPaymentRequest,
  PayOrderWithQrMpRequest,
  ListPaymentsRequest,
  PaymentResponse,
  SplitPaymentResponse,
  PaymentSessionResponse,
  QrMpPaymentResponse,
  QrMpPaymentStatusResponse,
  CreateRefundRequest,
  ListRefundsRequest,
  RefundResponse,
} from '@/domain/types/payment.types';
import type { ApiResponse } from '@/domain/types';

/**
 * Repository para operaciones de pagos
 * Implementa el patrón Repository para abstraer el acceso a datos de pagos
 * Los errores de API se convierten automáticamente a AppError en el interceptor
 */
export class PaymentRepository {
  // ============ MÉTODOS DE PAGO ============
  // El pago simple (efectivo/transferencia/tarjeta) va por el endpoint unificado
  // POST /api/orders/:id/pay (ver order.repository.payOrder).

  /**
   * Procesa pago dividido (split payment)
   * Mismo endpoint que pago único: POST /api/orders/:order_id/pay
   * Body: solo { firstPayment, secondPayment }; order_id va en la URL.
   * Solo permite CASH, TRANSFER y CARD_PHYSICAL.
   */
  async payWithSplit(
    data: PayOrderWithSplitPaymentRequest
  ): Promise<ApiResponse<SplitPaymentResponse>> {
    try {
      const { orderId, firstPayment, secondPayment } = data;
      const body = { firstPayment, secondPayment };
      const response = await apiClient.post(`/api/orders/${orderId}/pay`, body);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Inicia pago con QR de Mercado Pago
   */
  async payWithQrMp(data: PayOrderWithQrMpRequest): Promise<ApiResponse<QrMpPaymentResponse>> {
    try {
      const response = await apiClient.post('/api/payments/qr-mercado-pago', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene el estado del pago QR de Mercado Pago
   */
  async getQrMpPaymentStatus(orderId: string): Promise<ApiResponse<QrMpPaymentStatusResponse>> {
    try {
      const response = await apiClient.get(`/api/payments/qr-mercado-pago/${orderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ============ CONSULTAS DE PAGO ============

  /**
   * Lista pagos con filtros opcionales
   */
  async listPayments(filters?: ListPaymentsRequest): Promise<ApiResponse<PaymentResponse[]>> {
    try {
      const response = await apiClient.get('/api/payments', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene un pago por ID
   */
  async getPaymentById(paymentId: string): Promise<ApiResponse<PaymentResponse>> {
    try {
      const response = await apiClient.get(`/api/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene la sesión de pago (initPoint de MP para pagos QR)
   */
  async getPaymentSession(paymentId: string): Promise<ApiResponse<PaymentSessionResponse>> {
    try {
      const response = await apiClient.get(`/api/payments/${paymentId}/session`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ============ REEMBOLSOS ============

  /**
   * Crea un reembolso
   */
  async createRefund(data: CreateRefundRequest): Promise<ApiResponse<RefundResponse>> {
    try {
      const response = await apiClient.post('/api/refunds', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lista reembolsos con filtros opcionales
   */
  async listRefunds(filters?: ListRefundsRequest): Promise<ApiResponse<RefundResponse[]>> {
    try {
      const response = await apiClient.get('/api/refunds', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene un reembolso por ID
   */
  async getRefundById(refundId: string): Promise<ApiResponse<RefundResponse>> {
    try {
      const response = await apiClient.get(`/api/refunds/${refundId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

}

// Exportar instancia singleton
export const paymentRepository = new PaymentRepository();

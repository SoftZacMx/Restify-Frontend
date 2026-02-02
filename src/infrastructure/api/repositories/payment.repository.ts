import apiClient from '../client';
import type {
  PayOrderWithCashRequest,
  PayOrderWithTransferRequest,
  PayOrderWithCardPhysicalRequest,
  PayOrderWithCardStripeRequest,
  PayOrderWithSplitPaymentRequest,
  ConfirmStripePaymentRequest,
  ListPaymentsRequest,
  PaymentResponse,
  StripePaymentResponse,
  SplitPaymentResponse,
  PaymentSessionResponse,
  CreateRefundRequest,
  ProcessStripeRefundRequest,
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

  /**
   * Procesa pago con efectivo
   */
  async payWithCash(data: PayOrderWithCashRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      const response = await apiClient.post('/api/payments/cash', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Procesa pago con transferencia
   */
  async payWithTransfer(data: PayOrderWithTransferRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      const response = await apiClient.post('/api/payments/transfer', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Procesa pago con tarjeta física (POS terminal)
   */
  async payWithCardPhysical(
    data: PayOrderWithCardPhysicalRequest
  ): Promise<ApiResponse<PaymentResponse>> {
    try {
      const response = await apiClient.post('/api/payments/card-physical', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Procesa pago con Stripe (tarjeta online)
   * Retorna clientSecret para completar el pago en frontend con Stripe.js
   */
  async payWithCardStripe(
    data: PayOrderWithCardStripeRequest
  ): Promise<ApiResponse<StripePaymentResponse>> {
    try {
      const response = await apiClient.post('/api/payments/card-stripe', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Procesa pago dividido (split payment)
   * Mismo endpoint que pago único: POST /api/orders/:order_id/pay
   * Body: solo { firstPayment, secondPayment }; order_id va en la URL.
   * Solo permite CASH, TRANSFER y CARD_PHYSICAL (no Stripe).
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
   * Confirma pago de Stripe después de completar en frontend
   */
  async confirmStripePayment(
    data: ConfirmStripePaymentRequest
  ): Promise<ApiResponse<PaymentResponse>> {
    try {
      const response = await apiClient.post('/api/payments/stripe/confirm', data);
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
   * Obtiene la sesión de pago (para Stripe)
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

  /**
   * Crea un reembolso para pago con Stripe
   */
  async createStripeRefund(data: CreateRefundRequest): Promise<ApiResponse<RefundResponse>> {
    try {
      const response = await apiClient.post('/api/refunds/stripe', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Procesa reembolso de Stripe después de completar en Stripe
   */
  async processStripeRefund(
    data: ProcessStripeRefundRequest
  ): Promise<ApiResponse<RefundResponse>> {
    try {
      const response = await apiClient.post('/api/refunds/stripe/process', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Exportar instancia singleton
export const paymentRepository = new PaymentRepository();

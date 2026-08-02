import type { ApiResponse } from '@/domain/types';
import type {
  PayOrderWithSplitPaymentRequest,
  ListPaymentsRequest,
  PaymentResponse,
  SplitPaymentResponse,
  QrMpPaymentResponse,
  QrMpPaymentStatusResponse,
  CreateRefundRequest,
  RefundResponse,
  PaymentFormErrors,
  SplitPaymentPart,
} from '@/domain/types/payment.types';
import { paymentRepository } from '@/infrastructure/api/repositories/payment.repository';

/**
 * Servicio de pagos
 * Contiene la lógica de negocio para operaciones de pagos y reembolsos
 * Cumple SRP: Solo maneja lógica de negocio de pagos
 */
export class PaymentService {
  // ============ VALIDACIONES ============

  /**
   * Valida los datos de un pago simple
   */
  validatePaymentData(orderId: string, amount: number): { isValid: boolean; errors: PaymentFormErrors } {
    const errors: PaymentFormErrors = {};

    // Validar orderId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!orderId) {
      errors.orderId = 'El ID de la orden es requerido';
    } else if (!uuidRegex.test(orderId)) {
      errors.orderId = 'El ID de la orden debe ser un UUID válido';
    }

    // Validar monto
    if (amount <= 0) {
      errors.amount = 'El monto debe ser mayor a 0';
    }

    // Validar decimales (máximo 2)
    const decimalPlaces = (amount.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      errors.amount = 'El monto debe tener máximo 2 decimales';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Valida los datos de un pago dividido (pago diferido).
   * Única validación: la suma de ambos métodos no puede ser mayor al total de la orden.
   */
  validateSplitPaymentData(
    _orderId: string,
    firstPayment: SplitPaymentPart,
    secondPayment: SplitPaymentPart,
    orderTotal: number
  ): { isValid: boolean; errors: PaymentFormErrors } {
    const errors: PaymentFormErrors = {};

    const total = firstPayment.amount + secondPayment.amount;
    const tolerance = 0.01;
    if (total > orderTotal + tolerance) {
      errors.splitPayment = `La suma de los pagos ($${total.toFixed(2)}) no puede ser mayor al total de la orden ($${orderTotal.toFixed(2)})`;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // ============ PROCESAMIENTO DE PAGOS ============
  // El cobro simple de órdenes (efectivo/transferencia/tarjeta) va por el endpoint
  // unificado POST /api/orders/:id/pay vía orderService.payOrder. Aquí solo viven
  // los flujos con lógica propia: QR de Mercado Pago y pago dividido.

  /**
   * Inicia pago con QR de Mercado Pago
   */
  async payWithQrMp(orderId: string, userId: string): Promise<QrMpPaymentResponse> {
    const validation = this.validatePaymentData(orderId, 1);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors).join(', '));
    }

    const response = await paymentRepository.payWithQrMp({ orderId, userId });
    return response.data!;
  }

  /**
   * Obtiene estado del pago QR de Mercado Pago
   */
  async getQrMpPaymentStatus(orderId: string): Promise<QrMpPaymentStatusResponse> {
    const response = await paymentRepository.getQrMpPaymentStatus(orderId);
    return response.data!;
  }

  /**
   * Procesa pago dividido
   * Solo permite CASH, TRANSFER y CARD_PHYSICAL
   */
  async payWithSplit(
    orderId: string,
    firstPayment: SplitPaymentPart,
    secondPayment: SplitPaymentPart,
    orderTotal: number
  ): Promise<ApiResponse<SplitPaymentResponse>> {
    const validation = this.validateSplitPaymentData(orderId, firstPayment, secondPayment, orderTotal);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors).join(', '));
    }

    const data: PayOrderWithSplitPaymentRequest = {
      orderId,
      firstPayment,
      secondPayment,
    };
    return await paymentRepository.payWithSplit(data);
  }

  // ============ CONSULTAS ============

  /**
   * Lista pagos con filtros opcionales
   */
  async listPayments(filters?: ListPaymentsRequest): Promise<PaymentResponse[]> {
    const response = await paymentRepository.listPayments(filters);
    if (!response.success || !response.data) {
      throw new Error('No se pudieron obtener los pagos');
    }
    return response.data;
  }

  /**
   * Obtiene un pago por ID
   */
  async getPaymentById(paymentId: string): Promise<PaymentResponse> {
    const response = await paymentRepository.getPaymentById(paymentId);
    if (!response.success || !response.data) {
      throw new Error('No se pudo obtener el pago');
    }
    return response.data;
  }

  /**
   * Obtiene los pagos de una orden
   */
  async getPaymentsByOrderId(orderId: string): Promise<PaymentResponse[]> {
    return await this.listPayments({ orderId });
  }

  // ============ REEMBOLSOS ============

  /**
   * Crea un reembolso
   */
  async createRefund(
    paymentId: string,
    amount: number,
    reason?: string
  ): Promise<RefundResponse> {
    // Validar datos
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(paymentId)) {
      throw new Error('El ID del pago debe ser un UUID válido');
    }
    if (amount <= 0) {
      throw new Error('El monto del reembolso debe ser mayor a 0');
    }

    const data: CreateRefundRequest = {
      paymentId,
      amount,
      reason,
    };
    const response = await paymentRepository.createRefund(data);
    if (!response.success || !response.data) {
      throw new Error('No se pudo crear el reembolso');
    }
    return response.data;
  }

}

// Exportar instancia singleton
export const paymentService = new PaymentService();

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
  CreateRefundRequest,
  RefundResponse,
  PaymentFormErrors,
  PaymentMethodType,
  SplitPaymentPart,
} from '@/domain/types/payment.types';
import type { PosPaymentMethod } from '@/domain/types/order.types';
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
   * Valida los datos de un pago dividido
   */
  validateSplitPaymentData(
    orderId: string,
    firstPayment: SplitPaymentPart,
    secondPayment: SplitPaymentPart,
    orderTotal: number
  ): { isValid: boolean; errors: PaymentFormErrors } {
    const errors: PaymentFormErrors = {};

    // Validar orderId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!orderId) {
      errors.orderId = 'El ID de la orden es requerido';
    } else if (!uuidRegex.test(orderId)) {
      errors.orderId = 'El ID de la orden debe ser un UUID válido';
    }

    // Validar que los métodos sean diferentes
    if (firstPayment.paymentMethod === secondPayment.paymentMethod) {
      errors.splitPayment = 'Los métodos de pago deben ser diferentes';
    }

    // Validar montos positivos
    if (firstPayment.amount <= 0) {
      errors.firstPayment = 'El monto del primer pago debe ser mayor a 0';
    }
    if (secondPayment.amount <= 0) {
      errors.secondPayment = 'El monto del segundo pago debe ser mayor a 0';
    }

    // Validar que la suma sea exactamente el total (tolerancia 0.01)
    const total = firstPayment.amount + secondPayment.amount;
    const tolerance = 0.01;
    if (total < orderTotal - tolerance) {
      errors.splitPayment = `La suma de los pagos ($${total.toFixed(2)}) debe ser igual al total ($${orderTotal.toFixed(2)})`;
    }
    if (total > orderTotal + tolerance) {
      errors.splitPayment = `La suma de los pagos ($${total.toFixed(2)}) no puede ser mayor al total ($${orderTotal.toFixed(2)})`;
    }

    // Validar que no se use CARD_STRIPE en split payment
    if (firstPayment.paymentMethod === 'CARD_STRIPE' as unknown || secondPayment.paymentMethod === 'CARD_STRIPE' as unknown) {
      errors.splitPayment = 'No se puede usar tarjeta Stripe en pagos divididos';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // ============ MAPEO DE MÉTODOS DE PAGO ============

  /**
   * Convierte método de pago del POS al formato del backend
   */
  mapPosMethodToBackend(posMethod: PosPaymentMethod): PaymentMethodType {
    const mapping: Record<PosPaymentMethod, PaymentMethodType> = {
      CASH: 'CASH',
      CARD: 'CARD_PHYSICAL', // Por defecto tarjeta física
      TRANSFER: 'TRANSFER',
    };
    return mapping[posMethod];
  }

  /**
   * Convierte método de pago del POS a número para crear orden
   */
  mapPosMethodToNumber(posMethod: PosPaymentMethod): number {
    const mapping: Record<PosPaymentMethod, number> = {
      CASH: 1,
      TRANSFER: 2,
      CARD: 3,
    };
    return mapping[posMethod];
  }

  /**
   * Convierte método de pago del backend a número
   */
  mapBackendMethodToNumber(method: PaymentMethodType): number {
    const mapping: Record<PaymentMethodType, number> = {
      CASH: 1,
      TRANSFER: 2,
      CARD_PHYSICAL: 3,
      CARD_STRIPE: 3,
    };
    return mapping[method];
  }

  // ============ PROCESAMIENTO DE PAGOS ============

  /**
   * Procesa pago con efectivo
   */
  async payWithCash(orderId: string): Promise<ApiResponse<PaymentResponse>> {
    const validation = this.validatePaymentData(orderId, 1); // Solo validar orderId
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors).join(', '));
    }

    const data: PayOrderWithCashRequest = { orderId };
    return await paymentRepository.payWithCash(data);
  }

  /**
   * Procesa pago con transferencia
   */
  async payWithTransfer(
    orderId: string,
    transferNumber?: string
  ): Promise<ApiResponse<PaymentResponse>> {
    const validation = this.validatePaymentData(orderId, 1);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors).join(', '));
    }

    const data: PayOrderWithTransferRequest = {
      orderId,
      transferNumber,
    };
    return await paymentRepository.payWithTransfer(data);
  }

  /**
   * Procesa pago con tarjeta física
   */
  async payWithCardPhysical(orderId: string): Promise<ApiResponse<PaymentResponse>> {
    const validation = this.validatePaymentData(orderId, 1);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors).join(', '));
    }

    const data: PayOrderWithCardPhysicalRequest = { orderId };
    return await paymentRepository.payWithCardPhysical(data);
  }

  /**
   * Procesa pago con Stripe (inicia el proceso)
   * Retorna clientSecret para completar en frontend con Stripe.js
   */
  async payWithCardStripe(
    orderId: string,
    connectionId?: string
  ): Promise<ApiResponse<StripePaymentResponse>> {
    const validation = this.validatePaymentData(orderId, 1);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors).join(', '));
    }

    const data: PayOrderWithCardStripeRequest = {
      orderId,
      connectionId,
    };
    return await paymentRepository.payWithCardStripe(data);
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

  /**
   * Confirma pago de Stripe
   */
  async confirmStripePayment(
    paymentIntentId: string,
    status: 'succeeded' | 'failed'
  ): Promise<ApiResponse<PaymentResponse>> {
    const data: ConfirmStripePaymentRequest = {
      paymentIntentId,
      status,
    };
    return await paymentRepository.confirmStripePayment(data);
  }

  /**
   * Procesa el pago basado en el método seleccionado en el POS
   * Maneja tanto pagos simples como divididos
   */
  async processPayment(
    orderId: string,
    posMethod1: PosPaymentMethod,
    amount1: number,
    posMethod2?: PosPaymentMethod | null,
    amount2?: number,
    orderTotal?: number,
    options?: {
      transferNumber?: string;
      useStripe?: boolean;
      connectionId?: string;
    }
  ): Promise<ApiResponse<PaymentResponse | SplitPaymentResponse>> {
    // Si hay dos métodos, es pago dividido
    if (posMethod2 && amount2 && orderTotal) {
      const firstPayment: SplitPaymentPart = {
        amount: amount1,
        paymentMethod: this.mapPosMethodToBackend(posMethod1) as 'CASH' | 'TRANSFER' | 'CARD_PHYSICAL',
      };
      const secondPayment: SplitPaymentPart = {
        amount: amount2,
        paymentMethod: this.mapPosMethodToBackend(posMethod2) as 'CASH' | 'TRANSFER' | 'CARD_PHYSICAL',
      };
      return await this.payWithSplit(orderId, firstPayment, secondPayment, orderTotal);
    }

    // Pago simple basado en el método
    switch (posMethod1) {
      case 'CASH':
        return await this.payWithCash(orderId);
      case 'TRANSFER':
        return await this.payWithTransfer(orderId, options?.transferNumber);
      case 'CARD':
        if (options?.useStripe) {
          return await this.payWithCardStripe(orderId, options.connectionId);
        }
        return await this.payWithCardPhysical(orderId);
      default:
        throw new Error('Método de pago no soportado');
    }
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

  /**
   * Crea un reembolso para pago con Stripe
   */
  async createStripeRefund(
    paymentId: string,
    amount: number,
    reason?: string
  ): Promise<RefundResponse> {
    const data: CreateRefundRequest = {
      paymentId,
      amount,
      reason,
    };
    const response = await paymentRepository.createStripeRefund(data);
    if (!response.success || !response.data) {
      throw new Error('No se pudo crear el reembolso en Stripe');
    }
    return response.data;
  }
}

// Exportar instancia singleton
export const paymentService = new PaymentService();

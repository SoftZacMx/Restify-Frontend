/**
 * Tipos relacionados con pagos (payments) y reembolsos (refunds)
 * Basado en la API de Restify Backend
 */

// ============ ENUMS DE PAGO ============

/**
 * Métodos de pago soportados por el backend
 */
export type PaymentMethodType = 'CASH' | 'TRANSFER' | 'CARD_PHYSICAL' | 'CARD_STRIPE';

/**
 * Estados de pago
 */
export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'REQUIRES_ACTION'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

/**
 * Estados de reembolso
 */
export type RefundStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';

/**
 * Gateways de pago
 */
export type PaymentGateway = 'STRIPE' | 'PAYPAL' | 'CASH';

/**
 * Valor numérico del método de pago para órdenes
 */
export const PaymentMethodNumber = {
  CASH: 1,
  TRANSFER: 2,
  CARD: 3,
} as const;

export type PaymentMethodNumberType = typeof PaymentMethodNumber[keyof typeof PaymentMethodNumber];

// ============ REQUESTS DE PAGO ============

/**
 * Request para pagar con efectivo
 */
export interface PayOrderWithCashRequest {
  orderId: string; // UUID de la orden
}

/**
 * Request para pagar con transferencia
 */
export interface PayOrderWithTransferRequest {
  orderId: string; // UUID de la orden
  transferNumber?: string; // Número de referencia (máx 100 chars)
}

/**
 * Request para pagar con tarjeta física (POS)
 */
export interface PayOrderWithCardPhysicalRequest {
  orderId: string; // UUID de la orden
}

/**
 * Request para pagar con Stripe (Online)
 */
export interface PayOrderWithCardStripeRequest {
  orderId: string; // UUID de la orden
  connectionId?: string | null; // ID de conexión WebSocket para notificaciones
}

/**
 * Parte de un pago dividido
 */
export interface SplitPaymentPart {
  amount: number; // Monto (positivo, máx 2 decimales)
  paymentMethod: 'CASH' | 'TRANSFER' | 'CARD_PHYSICAL'; // Solo métodos sin Stripe
}

/**
 * Request para pago dividido (Split Payment)
 */
export interface PayOrderWithSplitPaymentRequest {
  orderId: string; // UUID de la orden
  firstPayment: SplitPaymentPart;
  secondPayment: SplitPaymentPart;
}

/**
 * Request para confirmar pago de Stripe
 */
export interface ConfirmStripePaymentRequest {
  paymentIntentId: string; // ID del PaymentIntent de Stripe
  status: 'succeeded' | 'failed'; // Estado del pago
}

/**
 * Filtros para listar pagos
 */
export interface ListPaymentsRequest {
  orderId?: string;
  userId?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethodType;
  dateFrom?: string; // ISO 8601
  dateTo?: string; // ISO 8601
}

// ============ RESPONSES DE PAGO ============

/**
 * Respuesta de pago del backend
 */
export interface PaymentResponse {
  id: string;
  orderId: string | null;
  userId: string;
  amount: number;
  currency: string; // 'USD' por defecto
  status: PaymentStatus;
  paymentMethod: PaymentMethodType;
  gateway: PaymentGateway | null;
  gatewayTransactionId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Respuesta de pago con Stripe (incluye clientSecret)
 */
export interface StripePaymentResponse extends PaymentResponse {
  clientSecret: string; // Para completar pago en frontend con Stripe.js
}

/**
 * Información de diferenciación de pago dividido
 */
export interface PaymentDifferentiation {
  id: string;
  orderId: string;
  firstPaymentAmount: number;
  firstPaymentMethod: PaymentMethodType;
  secondPaymentAmount: number;
  secondPaymentMethod: PaymentMethodType;
}

/**
 * Respuesta de pago dividido
 */
export interface SplitPaymentResponse {
  order: import('./order.types').CreateOrderResponse;
  payments: PaymentResponse[];
  paymentDifferentiation: PaymentDifferentiation;
  /** true si la orden era Local con mesa y el backend liberó la mesa */
  tableReleased?: boolean;
}

/**
 * Respuesta de sesión de pago
 */
export interface PaymentSessionResponse {
  id: string;
  url: string;
  status: string;
}

// ============ REQUESTS DE REEMBOLSO ============

/**
 * Request para crear un reembolso
 */
export interface CreateRefundRequest {
  paymentId: string; // UUID del pago a reembolsar
  amount: number; // Monto (positivo, máx 2 decimales)
  reason?: string | null; // Razón del reembolso (máx 500 chars)
}

/**
 * Request para procesar reembolso de Stripe
 */
export interface ProcessStripeRefundRequest {
  refundId: string; // UUID del reembolso
  stripeRefundId: string; // ID del refund en Stripe
  status: 'succeeded' | 'failed';
}

/**
 * Filtros para listar reembolsos
 */
export interface ListRefundsRequest {
  paymentId?: string;
  status?: RefundStatus;
  dateFrom?: string; // ISO 8601
  dateTo?: string; // ISO 8601
}

// ============ RESPONSES DE REEMBOLSO ============

/**
 * Respuesta de reembolso del backend
 */
export interface RefundResponse {
  id: string;
  paymentId: string;
  amount: number;
  reason: string | null;
  gatewayRefundId: string | null;
  status: RefundStatus;
  createdAt: string; // ISO 8601
}

// ============ TIPOS DE UI PARA PAGOS ============

/**
 * Estado del formulario de pago en UI
 */
export interface PaymentFormState {
  orderId: string;
  paymentMethod: PaymentMethodType | null;
  amount: number;
  transferNumber?: string;
  isSplitPayment: boolean;
  splitPayment?: {
    firstMethod: PaymentMethodType;
    firstAmount: number;
    secondMethod: PaymentMethodType;
    secondAmount: number;
  };
}

/**
 * Errores de validación del formulario de pago
 */
export interface PaymentFormErrors {
  orderId?: string;
  paymentMethod?: string;
  amount?: string;
  transferNumber?: string;
  splitPayment?: string;
  firstPayment?: string;
  secondPayment?: string;
}

/**
 * Mapeo de métodos de pago del POS al backend
 */
export const PosPaymentMethodToBackend: Record<string, PaymentMethodType> = {
  CASH: 'CASH',
  CARD: 'CARD_PHYSICAL', // Por defecto tarjeta física, puede cambiar a CARD_STRIPE
  TRANSFER: 'TRANSFER',
};

/**
 * Mapeo de métodos de pago numéricos a string
 */
export const PaymentMethodNumberToString: Record<number, PaymentMethodType> = {
  1: 'CASH',
  2: 'TRANSFER',
  3: 'CARD_PHYSICAL',
};

/**
 * Mapeo de métodos de pago string a numérico
 */
export const PaymentMethodStringToNumber: Record<string, number> = {
  CASH: 1,
  TRANSFER: 2,
  CARD_PHYSICAL: 3,
  CARD_STRIPE: 3, // Ambos tipos de tarjeta usan el mismo número
};

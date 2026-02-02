/**
 * Tipos para WebSocket - Notificaciones en tiempo real
 * Basado en: websocket-frontend-guide.md
 */

// ============ ENUM DE EVENTOS ============

/**
 * Tipos de eventos WebSocket (const object for erasableSyntaxOnly)
 */
export const WebSocketEventType = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECTION_ACK: 'connection_ack',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_PENDING: 'payment_pending',
  ORDER_CREATED: 'order_created',
  ORDER_UPDATED: 'order_updated',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELED: 'order_canceled',
  ERROR: 'error',
} as const;

export type WebSocketEventType = (typeof WebSocketEventType)[keyof typeof WebSocketEventType];

// ============ INTERFACES DE MENSAJE ============

/**
 * Estructura base de mensaje WebSocket
 */
export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType;
  data: T;
  timestamp: string;
  connectionId?: string;
}

// ============ DATOS DE NOTIFICACIONES ============

/**
 * Datos de orden reducidos en notificación
 */
export interface OrderNotificationOrderData {
  id: string;
  date: string;
  status: boolean; // true = pagada
  total: number;
  subtotal: number;
  delivered: boolean;
  tableId: string | null;
  origin: string;
  client: string | null;
}

/**
 * Datos de notificación de orden
 */
export interface OrderNotificationData {
  orderId: string;
  status: 'created' | 'updated' | 'delivered' | 'canceled';
  message: string;
  order: OrderNotificationOrderData;
}

/**
 * Datos de pago en notificación
 */
export interface PaymentNotificationData {
  paymentId: string;
  status: 'confirmed' | 'failed' | 'pending';
  message: string;
  payment?: {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
  };
}

/**
 * Datos de error WebSocket
 */
export interface WebSocketErrorData {
  message: string;
  error?: string;
}

/**
 * Datos de confirmación de conexión
 */
export interface ConnectionAckData {
  connectionId: string;
  message: string;
}

// ============ CONFIGURACIÓN ============

/**
 * Opciones para el hook useWebSocket
 */
export interface UseWebSocketOptions {
  userId: string;
  token: string;
  autoConnect?: boolean;
  onOrderCreated?: (data: OrderNotificationData) => void;
  onOrderUpdated?: (data: OrderNotificationData) => void;
  onOrderDelivered?: (data: OrderNotificationData) => void;
  onOrderCanceled?: (data: OrderNotificationData) => void;
  onPaymentConfirmed?: (data: PaymentNotificationData) => void;
  onPaymentFailed?: (data: PaymentNotificationData) => void;
  onPaymentPending?: (data: PaymentNotificationData) => void;
  onError?: (error: WebSocketErrorData) => void;
  onConnectionChange?: (isConnected: boolean) => void;
}

/**
 * Retorno del hook useWebSocket
 */
export interface UseWebSocketReturn {
  isConnected: boolean;
  connectionId: string | null;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Payload para registrar conexión
 */
export interface RegisterConnectionPayload {
  connectionId: string;
  userId?: string;
  token?: string;
  paymentId?: string;
}

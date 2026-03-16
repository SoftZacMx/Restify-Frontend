/**
 * Tipos relacionados con órdenes (orders) y punto de venta (POS)
 * Basado en la API de Restify Backend
 */

// ============ TIPOS DE UI DEL POS ============

export type OrderType = 'DINE_IN' | 'TAKEOUT';

export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type PosPaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

/**
 * Modo del punto de venta (estado de UI)
 * ORDER_BUILDING: Construcción/edición de orden (puede agregar/eliminar items)
 * PAYMENT_PROCESSING: Proceso de pago (solo puede modificar métodos de pago)
 */
export type PosMode = 'ORDER_BUILDING' | 'PAYMENT_PROCESSING';

/**
 * Orígenes de orden soportados
 */
export const OrderOrigins = {
  LOCAL: 'Local',
  DELIVERY: 'Delivery',
  ORDER: 'Order',
  PICKUP: 'Pickup',
} as const;

export type OrderOriginType = typeof OrderOrigins[keyof typeof OrderOrigins];

/**
 * Mesa del restaurante (formato UI)
 */
export interface Table {
  id: string;
  number: number;
  capacity: number;
  isAvailable: boolean;
  location?: string;
}

/**
 * Categoría de producto
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

/**
 * Extra de producto
 */
export interface ProductExtra {
  id: string;
  name: string;
  price: number;
  description?: string;
}

/**
 * Producto del menú (extendido para POS)
 */
export interface PosProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  imageUrl?: string;
  status: boolean;
  isExtra?: boolean; // Indica si el producto es un extra
}

/**
 * Item de orden con extras seleccionados (formato UI)
 */
export interface OrderItem {
  id: string;
  productId: string; // ID del producto o menuItem
  menuItemId?: string; // ID específico del menuItem (si aplica)
  product: PosProduct;
  quantity: number;
  basePrice: number;
  selectedExtras: PosProduct[]; // Los extras ahora son productos
  extrasTotal: number;
  itemSubtotal: number;
  itemTotal: number;
  note?: string; // Nota específica del item
}

/**
 * Método de pago de la orden (formato UI)
 */
export interface OrderPaymentMethod {
  method: PosPaymentMethod;
  amount: number;
}

/**
 * Orden completa (formato UI)
 */
export interface Order {
  id: string;
  type: OrderType;
  tableId?: string;
  table?: Table;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethods: OrderPaymentMethod[];
  status: OrderStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ============ REQUESTS PARA EL BACKEND ============

/**
 * Extra de item para crear orden (formato backend)
 */
export interface OrderItemExtraInput {
  extraId: string; // UUID del MenuItem con isExtra: true
  quantity?: number; // Opcional (default: 1)
  price: number; // Precio del extra (positivo, máx 2 decimales)
}

/**
 * Item de orden para crear orden (formato backend)
 * IMPORTANTE: Debe tener productId O menuItemId, pero NO ambos
 */
export interface OrderItemInput {
  productId?: string | null; // UUID del producto (uno de los dos es requerido)
  menuItemId?: string | null; // UUID del item del menú (uno de los dos es requerido)
  quantity: number; // Entero positivo
  price: number; // Precio unitario (positivo, máx 2 decimales)
  note?: string | null; // Nota del item (máx 50 caracteres)
  extras?: OrderItemExtraInput[]; // Extras para este item
}

/**
 * Request para crear una orden (formato backend)
 */
export interface CreateOrderRequest {
  paymentMethod?: number; // 1: Cash, 2: Transfer, 3: Card (opcional, default: 1)
  tableId?: string | null; // UUID de la mesa (opcional)
  tip?: number; // Propina (default: 0)
  origin: string; // REQUERIDO - 'Local', 'Delivery', 'Order', etc. (máx 50 chars)
  client?: string | null; // Nombre del cliente (máx 200 chars)
  paymentDiffer?: boolean; // Pago diferido (default: false)
  note?: string | null; // Nota de la orden (máx 1000 chars)
  userId: string; // REQUERIDO - UUID del usuario (mesero)
  orderItems: OrderItemInput[]; // REQUERIDO - Mínimo 1 item
}

/**
 * Input para actualizar un item de orden
 * Se usa cuando se actualizan los items de una orden existente
 */
export interface UpdateOrderItemInput {
  id?: string; // Opcional - Si se proporciona, se ignora (para compatibilidad)
  productId?: string | null; // UUID del producto
  menuItemId?: string | null; // UUID del item del menú
  quantity: number; // REQUERIDO - Entero positivo
  price: number; // REQUERIDO - Precio unitario
  note?: string | null; // Opcional - Nota del item
  extras?: OrderItemExtraInput[]; // Opcional - Extras para este item
}

/**
 * Request para actualizar una orden
 * IMPORTANTE: Si se envía orderItems, se REEMPLAZAN todos los items existentes
 * Solo se pueden modificar items de órdenes NO pagadas (status: false)
 */
export interface UpdateOrderRequest {
  status?: boolean; // true = pagada/completada
  paymentMethod?: number | null; // Puede ser null para split payments
  delivered?: boolean; // true = entregada
  tip?: number;
  origin?: string;
  client?: string | null;
  paymentDiffer?: boolean;
  note?: string | null;
  tableId?: string | null;
  orderItems?: UpdateOrderItemInput[]; // Opcional - Si se envía, REEMPLAZA todos los items
}

/**
 * Filtros para listar órdenes
 */
export interface ListOrdersRequest {
  status?: boolean; // true = pagadas, false = pendientes
  userId?: string; // Filtrar por mesero
  tableId?: string; // Filtrar por mesa
  paymentMethod?: number; // 1, 2, o 3
  origin?: string; // Filtrar por origen
  dateFrom?: string; // Fecha inicio (ISO string)
  dateTo?: string; // Fecha fin (ISO string)
}

/** Respuesta de GET /api/orders: mismo formato que el backend (data + pagination) */
export interface ListOrdersResponse {
  data: OrderResponse[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

/**
 * Request para POST /api/orders/:order_id/pay (guía payment-frontend-guide)
 */
export interface PayOrderRequest {
  paymentMethod: 'CASH' | 'TRANSFER' | 'CARD_PHYSICAL';
  amount: number; // Debe coincidir con order.total (tolerancia 0.01)
  transferNumber?: string; // Opcional, solo para TRANSFER (máx 100 chars)
}

/**
 * Respuesta de POST /api/orders/:order_id/pay
 */
export interface PayOrderResult {
  payment: {
    id: string;
    orderId: string;
    amount: number;
    status: string; // "SUCCEEDED"
    paymentMethod: string;
    createdAt: string; // ISO 8601
  };
  order: {
    id: string;
    status: boolean; // true = pagada
    paymentMethod: number | null; // 1: Cash, 2: Transfer, 3: Card
  };
  tableReleased: boolean; // true si se liberó la mesa (Local + mesa asignada)
}

// ============ TIPOS LEGACY (compatibilidad) ============

/**
 * @deprecated Use OrderItemInput instead
 */
export interface OrderItemRequest {
  productId?: string | null;
  menuItemId?: string | null;
  quantity: number;
  price: number;
  note?: string | null;
  extras?: OrderItemExtraRequest[];
}

/**
 * @deprecated Use OrderItemExtraInput instead
 */
export interface OrderItemExtraRequest {
  extraId: string;
  quantity?: number;
  price: number;
}

// ============ RESPONSES DEL BACKEND ============

/**
 * Response de extra de item del backend
 */
export interface OrderItemExtraResponse {
  id: string;
  orderId: string;
  orderItemId: string;
  extraId: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  extra?: import('./menu-item.types').MenuItemResponse; // Información del extra
}

/**
 * Response de item de orden del backend
 */
export interface OrderItemResponse {
  id: string;
  quantity: number;
  price: number;
  orderId: string;
  productId: string | null;
  menuItemId: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  product?: import('./product.types').ProductResponse; // Si productId no es null
  menuItem?: import('./menu-item.types').MenuItemResponse; // Si menuItemId no es null
  extras?: OrderItemExtraResponse[];
}

/**
 * Response de orden del backend
 */
export interface OrderResponse {
  id: string;
  date: string; // ISO 8601
  status: boolean; // true = pagada/completada
  paymentMethod: number | null; // 1: Cash, 2: Transfer, 3: Card, null: Split
  total: number; // Total con IVA y propina
  subtotal: number; // Subtotal sin IVA
  iva: number; // IVA calculado
  delivered: boolean; // true = entregada
  tableId: string | null;
  tip: number;
  origin: string;
  client: string | null;
  paymentDiffer: boolean;
  note: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  orderItems?: OrderItemResponse[];
  table?: import('./table.types').TableResponse;
  payments?: import('./payment.types').PaymentResponse[];
}

/**
 * @deprecated Use OrderResponse instead
 */
export interface CreateOrderResponse extends OrderResponse {}

/**
 * Estado del carrito de compra
 */
export interface CartState {
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * Estado del formulario de pago
 */
export interface PaymentState {
  cashAmount: number;
  cardAmount: number;
  transferAmount: number;
  selectedMethod1: PosPaymentMethod | null;
  selectedMethod2: PosPaymentMethod | null;
  total: number;
}

/**
 * Errores de validación del formulario de orden
 */
export interface OrderFormErrors {
  type?: string;
  tableId?: string;
  customerName?: string;
  items?: string;
  paymentMethods?: string;
  cashAmount?: string;
  cardAmount?: string;
  transferAmount?: string;
  method1?: string;
  method2?: string;
}

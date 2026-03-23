import type {
  OrderItem,
  PosProduct,
  CartState,
  PaymentState,
  OrderFormErrors,
  PosPaymentMethod,
  CreateOrderRequest,
  OrderResponse,
  UpdateOrderRequest,
  OrderItemInput,
  OrderItemExtraInput,
  ListOrdersRequest,
  ListOrdersResponse,
  PayOrderRequest,
  PayOrderResult,
  OrderType,
} from '@/domain/types';
import { orderRepository } from '@/infrastructure/api/repositories/order.repository';

/**
 * Servicio de órdenes
 * Contiene la lógica de negocio para operaciones de órdenes y cálculos del POS
 * Cumple SRP: Solo maneja lógica de negocio de órdenes
 */
export class OrderService {
  /**
   * Calcula el subtotal de un item de orden
   */
  calculateItemSubtotal(
    basePrice: number,
    quantity: number,
    selectedExtras: PosProduct[]
  ): number {
    const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    return (basePrice + extrasTotal) * quantity;
  }

  /**
   * Calcula el total de un item (sin IVA aplicado automáticamente)
   */
  calculateItemTotal(itemSubtotal: number): number {
    return itemSubtotal;
  }

  /**
   * Crea un item de orden desde un producto y extras seleccionados
   */
  createOrderItem(
    product: PosProduct,
    quantity: number,
    selectedExtras: PosProduct[],
    itemId?: string,
    note?: string | null
  ): OrderItem {
    const basePrice = product.price;
    const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    const itemSubtotal = (basePrice + extrasTotal) * quantity;
    const itemTotal = this.calculateItemTotal(itemSubtotal);

    return {
      id: itemId || `item-${Date.now()}-${Math.random()}`,
      productId: product.id,
      product,
      quantity,
      basePrice,
      selectedExtras,
      extrasTotal,
      itemSubtotal,
      itemTotal,
      ...(note != null && note.trim() !== '' ? { note: note.trim().slice(0, 50) } : {}),
    };
  }

  /**
   * Calcula el estado del carrito desde los items
   */
  calculateCartState(items: OrderItem[]): CartState {
    const subtotal = items.reduce((sum, item) => sum + item.itemSubtotal, 0);
    const tax = 0; // IVA no aplicado automáticamente
    const total = subtotal;

    return {
      items,
      subtotal,
      tax,
      total,
    };
  }

  /**
   * Agrega un item al carrito
   */
  addItemToCart(
    currentItems: OrderItem[],
    product: PosProduct,
    quantity: number,
    selectedExtras: PosProduct[],
    note?: string | null
  ): OrderItem[] {
    const newItem = this.createOrderItem(product, quantity, selectedExtras, undefined, note);
    return [...currentItems, newItem];
  }

  /**
   * Actualiza la cantidad de un item en el carrito
   */
  updateItemQuantity(cartItems: OrderItem[], itemId: string, newQuantity: number): OrderItem[] {
    if (newQuantity <= 0) {
      return this.removeItemFromCart(cartItems, itemId);
    }

    return cartItems.map((item) => {
      if (item.id === itemId) {
        const itemSubtotal = (item.basePrice + item.extrasTotal) * newQuantity;
        const itemTotal = this.calculateItemTotal(itemSubtotal);
        return {
          ...item,
          quantity: newQuantity,
          itemSubtotal,
          itemTotal,
        };
      }
      return item;
    });
  }

  /**
   * Elimina un item del carrito
   */
  removeItemFromCart(cartItems: OrderItem[], itemId: string): OrderItem[] {
    return cartItems.filter((item) => item.id !== itemId);
  }

  /**
   * Calcula el estado de pago
   */
  calculatePaymentState(
    total: number,
    cashAmount: number,
    cardAmount: number,
    transferAmount: number,
    selectedMethod1: PosPaymentMethod | null,
    selectedMethod2: PosPaymentMethod | null
  ): PaymentState {
    return {
      cashAmount,
      cardAmount,
      transferAmount,
      selectedMethod1,
      selectedMethod2,
      total,
    };
  }

  /**
   * Calcula el monto automático del segundo método de pago
   */
  calculateSecondPaymentAmount(total: number, firstAmount: number): number {
    const remaining = total - firstAmount;
    return Math.max(0, Math.min(remaining, total));
  }

  /**
   * Obtiene el monto de un método de pago específico
   */
  getPaymentAmount(
    method: PosPaymentMethod | null,
    cashAmount: number,
    cardAmount: number,
    transferAmount: number
  ): number {
    if (!method) return 0;
    switch (method) {
      case 'CASH':
        return cashAmount;
      case 'CARD':
        return cardAmount;
      case 'TRANSFER':
        return transferAmount;
      default:
        return 0;
    }
  }

  /**
   * Valida el estado de pago
   */
  validatePayment(paymentState: PaymentState): { isValid: boolean; errors: OrderFormErrors } {
    const errors: OrderFormErrors = {};
    const {
      cashAmount,
      cardAmount,
      transferAmount,
      selectedMethod1,
      selectedMethod2,
      total,
    } = paymentState;

    const isSplitPayment = Boolean(selectedMethod2);

    // Para pago diferido (dos métodos) solo se valida suma <= total más abajo; se omiten el resto de validaciones
    if (!isSplitPayment) {
      if (!selectedMethod1) {
        errors.method1 = 'Debe seleccionar al menos un método de pago';
      }

      if (selectedMethod1 && selectedMethod2 && selectedMethod1 === selectedMethod2) {
        errors.method2 = 'Los métodos de pago deben ser diferentes';
      }

      if (cashAmount < 0) {
        errors.cashAmount = 'El monto en efectivo no puede ser negativo';
      }
      if (cardAmount < 0) {
        errors.cardAmount = 'El monto con tarjeta no puede ser negativo';
      }
      if (transferAmount < 0) {
        errors.transferAmount = 'El monto de transferencia no puede ser negativo';
      }

      if (selectedMethod1) {
        const amount1 = this.getPaymentAmount(selectedMethod1, cashAmount, cardAmount, transferAmount);
        if (amount1 <= 0) {
          const methodName =
            selectedMethod1 === 'CASH'
              ? 'efectivo'
              : selectedMethod1 === 'CARD'
                ? 'tarjeta'
                : 'transferencia';
          errors.method1 = `Debe ingresar un monto para ${methodName}`;
        }
        if ((selectedMethod1 === 'CARD' || selectedMethod1 === 'TRANSFER') && amount1 > total) {
          const methodName = selectedMethod1 === 'CARD' ? 'tarjeta' : 'transferencia';
          errors.method1 = `El monto de ${methodName} no puede exceder el total ($${total.toFixed(2)})`;
        }
      }

      if (selectedMethod2) {
        const amount2 = this.getPaymentAmount(selectedMethod2, cashAmount, cardAmount, transferAmount);
        if (amount2 <= 0) {
          const methodName =
            selectedMethod2 === 'CASH'
              ? 'efectivo'
              : selectedMethod2 === 'CARD'
                ? 'tarjeta'
                : 'transferencia';
          errors.method2 = `Debe ingresar un monto para ${methodName}`;
        }
        if ((selectedMethod2 === 'CARD' || selectedMethod2 === 'TRANSFER') && amount2 > total) {
          const methodName = selectedMethod2 === 'CARD' ? 'tarjeta' : 'transferencia';
          errors.method2 = `El monto de ${methodName} no puede exceder el total ($${total.toFixed(2)})`;
        }
      }
    }

    // Calcular la suma de los métodos seleccionados (redondear a 2 decimales para evitar errores de punto flotante)
    const amount1 = selectedMethod1
      ? this.getPaymentAmount(selectedMethod1, cashAmount, cardAmount, transferAmount)
      : 0;
    const amount2 = selectedMethod2
      ? this.getPaymentAmount(selectedMethod2, cashAmount, cardAmount, transferAmount)
      : 0;
    const sumRaw = amount1 + amount2;
    const sum = Math.round(sumRaw * 100) / 100;
    const totalRounded = Math.round(total * 100) / 100;

    const tolerance = 0.01;

    if (isSplitPayment) {
      // Pago diferido (dos métodos): única validación — la suma no puede ser mayor al total
      if (sum > totalRounded + tolerance) {
        errors.paymentMethods = `La suma de los pagos ($${sum.toFixed(2)}) no puede ser mayor al total de la orden ($${total.toFixed(2)})`;
      }
    } else {
      // Un solo método
      const isCashOnly = selectedMethod1 === 'CASH';
      if (isCashOnly) {
        if (sum < totalRounded - tolerance) {
          errors.paymentMethods = `La suma de los pagos ($${sum.toFixed(2)}) debe ser al menos el total ($${total.toFixed(2)})`;
        }
      } else {
        if (sum > totalRounded + tolerance) {
          errors.paymentMethods = `La suma de los pagos ($${sum.toFixed(2)}) no puede ser mayor al total de la orden ($${total.toFixed(2)})`;
        } else if (Math.abs(sum - totalRounded) > tolerance) {
          errors.paymentMethods = `La suma de los pagos ($${sum.toFixed(2)}) debe ser igual al total ($${total.toFixed(2)})`;
        }
      }

      // Validar que solo se usen los métodos seleccionados (los demás deben ser 0)
      if (selectedMethod1 !== 'CASH' && cashAmount > 0) {
        errors.cashAmount = 'El monto en efectivo no debe tener valor si no está seleccionado';
      }
      if (selectedMethod1 !== 'CARD' && cardAmount > 0) {
        errors.cardAmount = 'El monto con tarjeta no debe tener valor si no está seleccionado';
      }
      if (selectedMethod1 !== 'TRANSFER' && transferAmount > 0) {
        errors.transferAmount = 'El monto de transferencia no debe tener valor si no está seleccionado';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Valida una orden completa antes de procesar
   * @param posMode - Modo del POS. Si es 'PAYMENT_PROCESSING', valida métodos de pago. Si es 'ORDER_BUILDING', solo valida items y datos básicos.
   */
  validateOrder(
    orderType: 'DINE_IN' | 'TAKEOUT' | null,
    tableId: string | null,
    customerName: string | null,
    items: OrderItem[],
    paymentState: PaymentState,
    posMode: 'ORDER_BUILDING' | 'PAYMENT_PROCESSING' = 'ORDER_BUILDING'
  ): { isValid: boolean; errors: OrderFormErrors } {
    const errors: OrderFormErrors = {};

    // Validar tipo de orden
    if (!orderType) {
      errors.type = 'Debe seleccionar un tipo de orden';
    }

    // Validar mesa o nombre de cliente según el tipo
    if (orderType === 'DINE_IN' && !tableId) {
      errors.tableId = 'Debe seleccionar una mesa';
    }

    if (orderType === 'TAKEOUT' && !customerName?.trim()) {
      errors.customerName = 'Debe ingresar el nombre del cliente';
    }

    // Validar que haya items
    if (items.length === 0) {
      errors.items = 'Debe agregar al menos un producto';
    }

    // Solo validar pagos si estamos en modo PAYMENT_PROCESSING
    if (posMode === 'PAYMENT_PROCESSING') {
      const paymentValidation = this.validatePayment(paymentState);
      if (!paymentValidation.isValid) {
        Object.assign(errors, paymentValidation.errors);
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // ============ TRANSFORMACIONES POS -> BACKEND ============

  /**
   * Convierte un item del carrito POS al formato del backend
   */
  convertOrderItemToInput(item: OrderItem): OrderItemInput {
    // Convertir extras al formato del backend
    const extras: OrderItemExtraInput[] = item.selectedExtras.map((extra) => ({
      extraId: extra.id,
      quantity: 1,
      price: extra.price,
    }));

    // El backend espera menuItemId O productId, pero NO ambos
    // Los productos del POS vienen de menu-items, así que usamos menuItemId
    // IMPORTANTE: No incluir productId para evitar que el backend lo busque en Products
    const orderItemInput: OrderItemInput = {
      menuItemId: item.productId, // El ID del POS corresponde a un MenuItem
      quantity: item.quantity,
      price: item.basePrice, // Precio unitario sin extras
    };

    // Solo agregar campos opcionales si tienen valor (nota máx 50 caracteres)
    if (item.note && item.note.trim() !== '') {
      orderItemInput.note = item.note.trim().slice(0, 50);
    }

    if (extras.length > 0) {
      orderItemInput.extras = extras;
    }

    return orderItemInput;
  }

  /**
   * Convierte los items del carrito POS al formato del backend
   */
  convertCartItemsToInput(items: OrderItem[]): OrderItemInput[] {
    return items.map((item) => this.convertOrderItemToInput(item));
  }

  /**
   * Convierte el método de pago del POS al formato numérico del backend
   */
  convertPaymentMethodToNumber(method: PosPaymentMethod): number {
    const mapping: Record<PosPaymentMethod, number> = {
      CASH: 1,
      TRANSFER: 2,
      CARD: 3,
    };
    return mapping[method];
  }

  /**
   * Convierte el tipo de orden del POS al origen del backend
   */
  convertOrderTypeToOrigin(type: OrderType): string {
    const mapping: Record<OrderType, string> = {
      DINE_IN: 'Local',
      TAKEOUT: 'Pickup',
    };
    return mapping[type];
  }

  /**
   * Construye el request para crear una orden desde los datos del POS
   */
  buildCreateOrderRequest(
    userId: string,
    orderType: OrderType,
    tableId: string | null,
    customerName: string | null,
    items: OrderItem[],
    paymentMethod?: PosPaymentMethod | null,
    tip?: number,
    note?: string
  ): CreateOrderRequest {
    return {
      userId,
      origin: this.convertOrderTypeToOrigin(orderType),
      tableId: orderType === 'DINE_IN' ? tableId : null,
      client: customerName || null,
      paymentMethod: paymentMethod ? this.convertPaymentMethodToNumber(paymentMethod) : 1, // Default: efectivo
      tip: tip || 0,
      note: note || null,
      paymentDiffer: false, // Por defecto no es diferido
      orderItems: this.convertCartItemsToInput(items),
    };
  }

  /**
   * Valida los datos antes de crear una orden en el backend
   */
  validateCreateOrderData(request: CreateOrderRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar userId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!request.userId) {
      errors.push('El ID del usuario es requerido');
    } else if (!uuidRegex.test(request.userId)) {
      errors.push('El ID del usuario debe ser un UUID válido');
    }

    // Validar origin
    if (!request.origin || request.origin.trim() === '') {
      errors.push('El origen de la orden es requerido');
    } else if (request.origin.length > 50) {
      errors.push('El origen de la orden debe tener máximo 50 caracteres');
    }

    // Validar orderItems
    if (!request.orderItems || request.orderItems.length === 0) {
      errors.push('La orden debe tener al menos un item');
    } else {
      request.orderItems.forEach((item, index) => {
        // Validar que tenga productId O menuItemId
        if (!item.productId && !item.menuItemId) {
          errors.push(`Item ${index + 1}: Debe tener productId o menuItemId`);
        }
        if (item.productId && item.menuItemId) {
          errors.push(`Item ${index + 1}: No puede tener productId y menuItemId al mismo tiempo`);
        }
        // Validar quantity
        if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
          errors.push(`Item ${index + 1}: La cantidad debe ser un entero positivo`);
        }
        // Validar price
        if (item.price === undefined || item.price < 0) {
          errors.push(`Item ${index + 1}: El precio debe ser positivo`);
        }
      });
    }

    // Validar tableId si se proporciona
    if (request.tableId && !uuidRegex.test(request.tableId)) {
      errors.push('El ID de la mesa debe ser un UUID válido');
    }

    // Validar tip
    if (request.tip !== undefined && request.tip < 0) {
      errors.push('La propina no puede ser negativa');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ============ OPERACIONES CON EL BACKEND ============

  /**
   * Crea una nueva orden en el backend
   */
  async createOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    // Validar datos antes de enviar
    const validation = this.validateCreateOrderData(orderData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join('. '));
    }

    // Debug: Mostrar datos que se envían al backend
    const response = await orderRepository.createOrder(orderData);
    if (!response.success || !response.data) {
      throw new Error('No se pudo crear la orden');
    }
    return response.data;
  }

  /**
   * Crea una orden desde los datos del POS
   */
  async createOrderFromPos(
    userId: string,
    orderType: OrderType,
    tableId: string | null,
    customerName: string | null,
    items: OrderItem[],
    paymentMethod?: PosPaymentMethod | null,
    tip?: number,
    note?: string
  ): Promise<OrderResponse> {
    const request = this.buildCreateOrderRequest(
      userId,
      orderType,
      tableId,
      customerName,
      items,
      paymentMethod,
      tip,
      note
    );
    return await this.createOrder(request);
  }

  /**
   * Obtiene una orden por ID del backend
   */
  async getOrderById(orderId: string): Promise<OrderResponse> {
    const response = await orderRepository.getOrderById(orderId);
    if (!response.success || !response.data) {
      throw new Error('No se pudo obtener la orden');
    }
    return response.data;
  }

  /**
   * Paga una orden (POST /api/orders/:order_id/pay).
   * Backend crea el pago, actualiza la orden y libera la mesa si aplica.
   */
  async payOrder(
    orderId: string,
    body: PayOrderRequest
  ): Promise<PayOrderResult> {
    const response = await orderRepository.payOrder(orderId, body);
    if (!response.success || !response.data) {
      throw new Error('No se pudo procesar el pago');
    }
    return response.data;
  }

  /**
   * Actualiza una orden existente en el backend
   */
  async updateOrder(orderId: string, orderData: UpdateOrderRequest): Promise<OrderResponse> {
    const response = await orderRepository.updateOrder(orderId, orderData);
    if (!response.success || !response.data) {
      throw new Error('No se pudo actualizar la orden');
    }
    return response.data;
  }

  /**
   * Marca una orden como pagada
   */
  async markOrderAsPaid(orderId: string): Promise<OrderResponse> {
    return await this.updateOrder(orderId, { status: true });
  }

  /**
   * Marca una orden como entregada
   */
  async markOrderAsDelivered(orderId: string): Promise<OrderResponse> {
    return await this.updateOrder(orderId, { delivered: true });
  }

  /**
   * Lista órdenes con filtros y paginación del backend.
   * Devuelve datos y metadatos de paginación (total, totalPages, etc.).
   */
  async listOrders(
    filters?: ListOrdersRequest
  ): Promise<{
    orders: OrderResponse[];
    pagination: ListOrdersResponse['pagination'];
    summary: ListOrdersResponse['summary'];
  }> {
    const response = await orderRepository.listOrders(filters);
    if (!response.success || response.data == null) {
      throw new Error('No se pudieron obtener las órdenes');
    }
    const payload = response.data;
    const orders = Array.isArray(payload.data) ? payload.data : [];
    const pagination = payload.pagination ?? {
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 20,
      total: orders.length,
      totalPages: 1,
    };
    const summary = payload.summary ?? {
      totalOrdersPending: 0,
      totalOrdersPaid: 0,
    };
    return { orders, pagination, summary };
  }

  /**
   * Obtiene órdenes pendientes (no pagadas)
   */
  async getPendingOrders(): Promise<OrderResponse[]> {
    const { orders } = await this.listOrders({ status: false, page: 1, limit: 100 });
    return orders;
  }

  /**
   * Obtiene órdenes pendientes de una mesa
   */
  async getPendingOrdersByTable(tableId: string): Promise<OrderResponse[]> {
    const { orders } = await this.listOrders({ tableId, status: false, page: 1, limit: 100 });
    return orders;
  }

  /**
   * Obtiene órdenes de un usuario/mesero
   */
  async getOrdersByUser(userId: string, status?: boolean): Promise<OrderResponse[]> {
    const { orders } = await this.listOrders({ userId, status, page: 1, limit: 100 });
    return orders;
  }

  /**
   * Elimina una orden
   */
  async deleteOrder(orderId: string): Promise<void> {
    const response = await orderRepository.deleteOrder(orderId);
    if (!response.success) {
      throw new Error('No se pudo eliminar la orden');
    }
  }
}

// Exportar instancia singleton
export const orderService = new OrderService();

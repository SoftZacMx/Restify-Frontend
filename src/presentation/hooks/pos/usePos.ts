import { useState, useCallback, useEffect, useMemo } from 'react';
import type {
  PosMode,
  Order,
  OrderResponse,
} from '@/domain/types';
import type { PaymentResponse, SplitPaymentResponse } from '@/domain/types/payment.types';
import { orderService, tableService } from '@/application/services';
import { usePosFetch } from './usePosFetch';
import { useOrderBuilder } from './useOrderBuilder';
import { usePosPayment } from './usePosPayment';
import { mapOrderItemResponseToOrderItem } from './pos.mappers';

interface UsePosOptions {
  initialMode?: PosMode;
  orderId?: string;
  initialOrder?: Order;
}

/**
 * Hook orquestador del POS.
 * Compone usePosFetch, useOrderBuilder y usePosPayment,
 * y gestiona el modo, la carga de órdenes existentes y operaciones de backend.
 */
export const usePos = (options?: UsePosOptions) => {
  const { initialMode = 'ORDER_BUILDING', orderId, initialOrder } = options || {};

  // Estado del modo
  const [posMode, setPosMode] = useState<PosMode>(initialMode);
  const [currentOrderId, setCurrentOrderId] = useState<string | undefined>(orderId);

  // Estado de orden cargada
  const [loadedOrder, setLoadedOrder] = useState<OrderResponse | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [loadOrderError, setLoadOrderError] = useState<string | null>(null);

  // Estado de creación de orden
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);

  // --- Hooks compuestos ---
  const fetchData = usePosFetch({ currentOrderId });

  const orderBuilder = useOrderBuilder({
    posMode,
    tables: fetchData.tables,
  });

  // Total de pago: en pago diferido usar total de la orden cargada
  const paymentTotal = (posMode === 'PAYMENT_PROCESSING' && loadedOrder)
    ? loadedOrder.total
    : orderBuilder.cartState.total;

  const payment = usePosPayment({
    cartState: orderBuilder.cartState,
    paymentTotal,
    selectedTableId: orderBuilder.selectedTableId,
  });

  // Productos filtrados (combina productos de fetch con filtros del builder)
  const filteredProducts = useMemo(() => {
    return orderBuilder.getFilteredProducts(fetchData.products);
  }, [orderBuilder.getFilteredProducts, fetchData.products]);

  // --- Carga de orden existente ---
  useEffect(() => {
    const loadExistingOrder = async () => {
      if (!orderId || fetchData.isLoadingProducts || fetchData.products.length === 0) return;
      if (loadedOrder && loadedOrder.id === orderId) return;

      setIsLoadingOrder(true);
      setLoadOrderError(null);

      try {
        const order = await orderService.getOrderById(orderId);
        setLoadedOrder(order);
        setCurrentOrderId(order.id);

        // Mapear items de la orden al carrito
        const mappedItems = (order.orderItems || [])
          .map(item => mapOrderItemResponseToOrderItem(item, fetchData.products))
          .filter((item): item is NonNullable<typeof item> => item !== null);

        orderBuilder.populateFromOrder(order, mappedItems);
        payment.populatePaymentFromMethod(order.paymentMethod ?? null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'No se pudo cargar la orden';
        setLoadOrderError(errorMessage);
      } finally {
        setIsLoadingOrder(false);
      }
    };

    loadExistingOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, fetchData.isLoadingProducts, fetchData.products]);

  // Cargar orden inicial si se proporciona
  const loadOrder = useCallback((order: Order) => {
    setCurrentOrderId(order.id);
    orderBuilder.populateFromOrder(
      { tableId: order.tableId, client: order.customerName },
      order.items || []
    );
    if (order.paymentMethods && order.paymentMethods.length > 0) {
      const method1 = order.paymentMethods[0];
      payment.handleMethod1Change(method1.method);
      payment.handlePaymentAmountChange(method1.method, method1.amount);
      if (order.paymentMethods.length > 1) {
        const method2 = order.paymentMethods[1];
        payment.handleMethod2Change(method2.method);
        payment.handlePaymentAmountChange(method2.method, method2.amount);
      }
    }
  }, [orderBuilder, payment]);

  useEffect(() => {
    if (initialOrder) {
      loadOrder(initialOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrder]);

  // Wrapper de validateOrder sin args (inyecta paymentState)
  const validateOrder = useCallback(() => {
    return orderBuilder.validateOrder(payment.paymentState);
  }, [orderBuilder, payment.paymentState]);

  // --- Operaciones de backend ---
  const createOrderInBackend = useCallback(
    async (userId: string, tip?: number, note?: string): Promise<OrderResponse | null> => {
      const validation = validateOrder();
      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).filter(Boolean).join('. ');
        setOrderError(errorMessages);
        return null;
      }

      if (!orderBuilder.orderType) {
        setOrderError('Debe seleccionar un tipo de orden');
        return null;
      }

      setIsCreatingOrder(true);
      setOrderError(null);

      try {
        const order = await orderService.createOrderFromPos(
          userId,
          orderBuilder.orderType,
          orderBuilder.selectedTableId,
          orderBuilder.customerName,
          orderBuilder.cartItems,
          payment.selectedMethod1,
          tip,
          note
        );

        setCreatedOrder(order);
        setCurrentOrderId(order.id);

        if (orderBuilder.selectedTableId) {
          try {
            await tableService.updateTable(orderBuilder.selectedTableId, { availabilityStatus: false });
          } catch {
            // Mesa: no se pudo actualizar estado
          }
        }

        return order;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'No se pudo crear la orden';
        setOrderError(errorMessage);
        return null;
      } finally {
        setIsCreatingOrder(false);
      }
    },
    [validateOrder, orderBuilder, payment.selectedMethod1]
  );

  const submitOrderWithPayment = useCallback(
    async (
      userId: string,
      tip?: number,
      note?: string,
      paymentOptions?: { transferNumber?: string; useStripe?: boolean; connectionId?: string }
    ): Promise<{ order: OrderResponse | null; payment: PaymentResponse | SplitPaymentResponse | null }> => {
      const order = await createOrderInBackend(userId, tip, note);
      if (!order) return { order: null, payment: null };
      const paymentResult = await payment.processPaymentInBackend(order.id, paymentOptions);
      return { order, payment: paymentResult };
    },
    [createOrderInBackend, payment]
  );

  const submitOrderDeferred = useCallback(
    async (userId: string, tip?: number, note?: string): Promise<OrderResponse | null> => {
      return await createOrderInBackend(userId, tip, note);
    },
    [createOrderInBackend]
  );

  const clearOrderError = useCallback(() => setOrderError(null), []);

  const changePosMode = useCallback((mode: PosMode) => setPosMode(mode), []);

  const resetPos = useCallback(() => {
    setPosMode('ORDER_BUILDING');
    setCurrentOrderId(undefined);
    setIsCreatingOrder(false);
    setOrderError(null);
    setCreatedOrder(null);
    setLoadedOrder(null);
    orderBuilder.resetOrderBuilder();
    payment.resetPayment();
  }, [orderBuilder, payment]);

  // --- Return: misma interfaz que el usePos original ---
  return {
    // Estado del POS
    posMode,
    currentOrderId,
    orderType: orderBuilder.orderType,
    selectedTableId: orderBuilder.selectedTableId,
    selectedTable: orderBuilder.selectedTable,
    customerName: orderBuilder.customerName,
    cartItems: orderBuilder.cartItems,
    cartState: orderBuilder.cartState,
    cashAmount: payment.cashAmount,
    cardAmount: payment.cardAmount,
    transferAmount: payment.transferAmount,
    selectedMethod1: payment.selectedMethod1,
    selectedMethod2: payment.selectedMethod2,
    showSecondPaymentMethod: payment.showSecondPaymentMethod,
    paymentState: payment.paymentState,
    selectedCategoryId: orderBuilder.selectedCategoryId,
    productSearch: orderBuilder.productSearch,
    setProductSearch: orderBuilder.setProductSearch,
    filteredProducts,
    isExtrasDialogOpen: orderBuilder.isExtrasDialogOpen,
    selectedProductForExtras: orderBuilder.selectedProductForExtras,

    // Estado de productos del backend
    isLoadingProducts: fetchData.isLoadingProducts,
    productsError: fetchData.productsError,
    availableExtras: fetchData.availableExtras,

    // Estado de mesas del backend
    tables: fetchData.tables,
    isLoadingTables: fetchData.isLoadingTables,
    tablesError: fetchData.tablesError,

    // Estado de categorías del backend
    categories: fetchData.categories,
    isLoadingCategories: fetchData.isLoadingCategories,
    categoriesError: fetchData.categoriesError,

    // Estado de operaciones con backend
    isCreatingOrder,
    isProcessingPayment: payment.isProcessingPayment,
    orderError,
    paymentError: payment.paymentError,
    createdOrder,
    paymentResult: payment.paymentResult,

    // Estado de orden cargada
    loadedOrder,
    isLoadingOrder,
    loadOrderError,

    // Handlers de UI
    handleOrderTypeChange: orderBuilder.handleOrderTypeChange,
    handleTableSelect: orderBuilder.handleTableSelect,
    handleCustomerNameChange: orderBuilder.handleCustomerNameChange,
    handleCategorySelect: orderBuilder.handleCategorySelect,
    handleProductSelect: orderBuilder.handleProductSelect,
    handleAddProductToCart: orderBuilder.handleAddProductToCart,
    handleUpdateItemQuantity: orderBuilder.handleUpdateItemQuantity,
    handleRemoveItem: orderBuilder.handleRemoveItem,
    handlePaymentAmountChange: payment.handlePaymentAmountChange,
    handleMethod1Change: payment.handleMethod1Change,
    handleMethod2Change: payment.handleMethod2Change,
    setShowSecondPaymentMethod: payment.setShowSecondPaymentMethod,
    changePosMode,
    loadOrder,
    validateOrder,
    resetPos,

    // Dialog handlers
    setIsExtrasDialogOpen: orderBuilder.setIsExtrasDialogOpen,

    // Handlers de operaciones con backend
    createOrderInBackend,
    processPaymentInBackend: payment.processPaymentInBackend,
    submitOrderWithPayment,
    submitOrderDeferred,
    payExistingOrder: payment.payExistingOrder,
    clearOrderError,
    clearPaymentError: payment.clearPaymentError,
  };
};

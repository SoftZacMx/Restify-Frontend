import { useState, useCallback, useMemo, useEffect } from 'react';
import type {
  OrderType,
  OrderItem,
  PosProduct,
  CartState,
  PaymentState,
  Table,
  PosPaymentMethod,
  PosMode,
  Order,
  MenuItemResponse,
  TableResponse,
  OrderResponse,
  OrderItemResponse,
  Category,
  MenuCategoryResponse,
} from '@/domain/types';
import type { PaymentResponse, SplitPaymentResponse } from '@/domain/types/payment.types';
import { orderService, menuItemService, tableService, menuCategoryService } from '@/application/services';
import { paymentService } from '@/application/services/payment.service';

/**
 * Constante para el IVA (16%)
 */
const TAX_RATE = 0.16;

interface UsePosOptions {
  initialMode?: PosMode;
  orderId?: string;
  initialOrder?: Order;
}

/**
 * Convierte un MenuItemResponse del backend al formato PosProduct
 */
const mapMenuItemToPosProduct = (menuItem: MenuItemResponse): PosProduct => ({
  id: menuItem.id,
  name: menuItem.name,
  description: '', // El backend no tiene descripción por ahora
  price: menuItem.price,
  categoryId: menuItem.categoryId || '',
  status: menuItem.status,
  // Asegurar que isExtra siempre sea booleano (el backend puede no devolverlo)
  isExtra: menuItem.isExtra ?? false,
});

/**
 * Convierte un TableResponse del backend al formato Table del POS
 */
const mapTableResponseToTable = (tableResponse: TableResponse): Table => ({
  id: tableResponse.id,
  number: tableResponse.numberTable,
  capacity: 4, // El backend no maneja capacidad, usar valor por defecto
  isAvailable: tableResponse.status && tableResponse.availabilityStatus,
  location: undefined, // El backend no maneja ubicación
});

/**
 * Convierte un OrderItemResponse del backend al formato OrderItem del carrito POS
 */
const mapOrderItemResponseToOrderItem = (
  orderItemResponse: OrderItemResponse,
  products: PosProduct[]
): OrderItem | null => {
  // Buscar el producto correspondiente en la lista de productos
  const productId = orderItemResponse.menuItemId || orderItemResponse.productId;
  if (!productId) return null;

  // Buscar el producto en la lista de productos cargados
  let product = products.find(p => p.id === productId);
  
  // Si no encontramos el producto, intentar crearlo desde los datos del item
  if (!product) {
    // Intentar usar los datos del menuItem o product del response
    if (orderItemResponse.menuItem) {
      product = mapMenuItemToPosProduct(orderItemResponse.menuItem);
    } else if (orderItemResponse.product) {
      // Crear un PosProduct básico desde el product response
      product = {
        id: orderItemResponse.product.id,
        name: orderItemResponse.product.name,
        description: '',
        price: orderItemResponse.price,
        categoryId: '',
        status: true,
        isExtra: false,
      };
    } else {
      product = {
        id: productId,
        name: `Producto ${productId.substring(0, 8)}...`,
        description: '',
        price: orderItemResponse.price,
        categoryId: '',
        status: true,
        isExtra: false,
      };
    }
  }

  // Mapear extras si existen
  const selectedExtras: PosProduct[] = [];
  let extrasTotal = 0;
  
  if (orderItemResponse.extras && orderItemResponse.extras.length > 0) {
    orderItemResponse.extras.forEach(extra => {
      const extraProduct = products.find(p => p.id === extra.extraId);
      if (extraProduct) {
        // Agregar el extra tantas veces como su cantidad
        for (let i = 0; i < extra.quantity; i++) {
          selectedExtras.push(extraProduct);
          extrasTotal += extra.price;
        }
      } else {
        // Crear un producto extra placeholder
        const extraPlaceholder: PosProduct = {
          id: extra.extraId,
          name: extra.extra?.name || `Extra ${extra.extraId.substring(0, 8)}...`,
          description: '',
          price: extra.price,
          categoryId: '',
          status: true,
          isExtra: true,
        };
        for (let i = 0; i < extra.quantity; i++) {
          selectedExtras.push(extraPlaceholder);
          extrasTotal += extra.price;
        }
      }
    });
  }

  const basePrice = orderItemResponse.price;
  const quantity = orderItemResponse.quantity;
  const itemSubtotal = (basePrice + extrasTotal) * quantity;
  const itemTotal = itemSubtotal * (1 + TAX_RATE);

  return {
    id: orderItemResponse.id,
    productId: productId,
    menuItemId: orderItemResponse.menuItemId || undefined,
    product,
    quantity,
    basePrice,
    selectedExtras,
    extrasTotal,
    itemSubtotal,
    itemTotal,
    note: orderItemResponse.note || undefined,
  };
};

/**
 * Hook personalizado para manejar el estado del punto de venta
 * Responsabilidad única: Gestionar el estado y lógica del POS
 * Cumple SRP: Solo maneja la lógica del POS
 */
export const usePos = (options?: UsePosOptions) => {
  const { initialMode = 'ORDER_BUILDING', orderId, initialOrder } = options || {};

  // Estado del modo del POS
  const [posMode, setPosMode] = useState<PosMode>(initialMode);
  const [currentOrderId, setCurrentOrderId] = useState<string | undefined>(orderId);

  // Estado del tipo de orden
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>('');

  // Estado del carrito
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);

  // Estado de productos cargados desde el backend
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Estado de mesas cargadas desde el backend
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [tablesError, setTablesError] = useState<string | null>(null);

  // Estado de categorías cargadas desde el backend
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Estado de pagos
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [selectedMethod1, setSelectedMethod1] = useState<PosPaymentMethod | null>(null);
  const [selectedMethod2, setSelectedMethod2] = useState<PosPaymentMethod | null>(null);
  const [showSecondPaymentMethod, setShowSecondPaymentMethodState] = useState(false);

  // Estado de filtros
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Estado del diálogo de extras
  const [isExtrasDialogOpen, setIsExtrasDialogOpen] = useState(false);
  const [selectedProductForExtras, setSelectedProductForExtras] = useState<PosProduct | null>(null);

  // Estado de operaciones con backend (crear orden, procesar pago)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | SplitPaymentResponse | null>(null);

  // Estado para la orden cargada (modo edición/visualización)
  const [loadedOrder, setLoadedOrder] = useState<OrderResponse | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [loadOrderError, setLoadOrderError] = useState<string | null>(null);

  // Cargar productos desde el backend al montar el componente
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      setProductsError(null);
      try {
        const menuItems = await menuItemService.listMenuItems();
        const posProducts = menuItems.map(mapMenuItemToPosProduct);
        setProducts(posProducts);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        setProductsError('No se pudieron cargar los productos');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  // Cargar categorías desde el backend al montar el componente
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      setCategoriesError(null);
      try {
        const menuCategories = await menuCategoryService.listMenuCategories({ status: true });
        const posCategories: Category[] = menuCategories.map((cat: MenuCategoryResponse) => ({
          id: cat.id,
          name: cat.name,
          description: '',
          icon: undefined,
        }));
        setCategories(posCategories);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        setCategoriesError('No se pudieron cargar las categorías');
        setCategories([]); // Fallback a array vacío
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Cargar mesas desde el backend al montar el componente
  useEffect(() => {
    const loadTables = async () => {
      setIsLoadingTables(true);
      setTablesError(null);
      try {
        const isEditingOrder = !!currentOrderId;
        const tablesResponse = isEditingOrder
          ? await tableService.listTables({ status: true })
          : await tableService.listTables({ status: true, availabilityStatus: true });
        const posTables = tablesResponse.map(mapTableResponseToTable);
        setTables(posTables);
      } catch (error) {
        console.error('Error al cargar mesas:', error);
        setTablesError('No se pudieron cargar las mesas');
      } finally {
        setIsLoadingTables(false);
      }
    };

    loadTables();
  }, [currentOrderId]); // Recargar cuando cambie el orderId (modo creación vs edición)

  // Cargar orden existente si hay orderId y los productos ya se cargaron
  useEffect(() => {
    const loadExistingOrder = async () => {
      // No cargar si no hay orderId o si los productos aún no se han cargado
      if (!orderId || isLoadingProducts || products.length === 0) {
        return;
      }

      // No volver a cargar si ya está cargada
      if (loadedOrder && loadedOrder.id === orderId) {
        return;
      }

      setIsLoadingOrder(true);
      setLoadOrderError(null);

      try {
        const order = await orderService.getOrderById(orderId);
        setLoadedOrder(order);
        setCurrentOrderId(order.id);

        // Poblar el tipo de orden basado en si tiene mesa o no
        if (order.tableId) {
          setOrderType('DINE_IN');
          setSelectedTableId(order.tableId);
        } else {
          setOrderType('TAKEOUT');
          setSelectedTableId(null);
        }

        // Poblar nombre del cliente
        if (order.client) {
          setCustomerName(order.client);
        }

        // Convertir los orderItems al formato del carrito
        if (order.orderItems && order.orderItems.length > 0) {
          const cartItems: OrderItem[] = [];
          
          for (const orderItemResponse of order.orderItems) {
            const cartItem = mapOrderItemResponseToOrderItem(orderItemResponse, products);
            if (cartItem) {
              cartItems.push(cartItem);
            }
          }
          setCartItems(cartItems);
        }

        // Poblar método de pago si la orden ya tiene uno
        if (order.paymentMethod !== null) {
          switch (order.paymentMethod) {
            case 1:
              setSelectedMethod1('CASH');
              break;
            case 2:
              setSelectedMethod1('TRANSFER');
              break;
            case 3:
              setSelectedMethod1('CARD');
              break;
          }
        }

      } catch (error) {
        console.error('Error al cargar la orden:', error);
        const errorMessage = error instanceof Error ? error.message : 'No se pudo cargar la orden';
        setLoadOrderError(errorMessage);
      } finally {
        setIsLoadingOrder(false);
      }
    };

    loadExistingOrder();
  }, [orderId, isLoadingProducts, products, loadedOrder]);

  // Calcular estado del carrito
  const cartState: CartState = useMemo(() => {
    return orderService.calculateCartState(cartItems);
  }, [cartItems]);

  // Calcular estado de pago: en pago diferido (orden cargada) usar total de la orden para que la validación coincida con lo que ve el usuario
  const paymentTotal = (posMode === 'PAYMENT_PROCESSING' && loadedOrder)
    ? loadedOrder.total
    : cartState.total;
  const paymentState: PaymentState = useMemo(() => {
    return orderService.calculatePaymentState(
      paymentTotal,
      cashAmount,
      cardAmount,
      transferAmount,
      selectedMethod1,
      selectedMethod2
    );
  }, [paymentTotal, cashAmount, cardAmount, transferAmount, selectedMethod1, selectedMethod2]);

  // Obtener mesa seleccionada
  const selectedTable: Table | undefined = useMemo(() => {
    if (!selectedTableId) return undefined;
    return tables.find((table) => table.id === selectedTableId);
  }, [selectedTableId, tables]);

  // Filtrar productos por categoría (excluyendo extras y solo mostrando activos)
  const filteredProducts = useMemo(() => {
    const regularProducts = products.filter(
      (product) => product.status === true && product.isExtra !== true
    );
    if (!selectedCategoryId) return regularProducts;
    return regularProducts.filter((product) => product.categoryId === selectedCategoryId);
  }, [selectedCategoryId, products]);

  // Obtener productos extras disponibles
  const availableExtras = useMemo(() => {
    return products.filter((product) => product.status && product.isExtra);
  }, [products]);

  // Handlers para tipo de orden
  const handleOrderTypeChange = useCallback(
    (type: OrderType | null) => {
      // Solo permitir cambiar tipo de orden en modo ORDER_BUILDING
      if (posMode !== 'ORDER_BUILDING') return;
      setOrderType(type);
      // Limpiar campos relacionados cuando cambia el tipo
      if (type === 'DINE_IN') {
        setCustomerName('');
      } else if (type === 'TAKEOUT') {
        setSelectedTableId(null);
      }
    },
    [posMode]
  );

  const handleTableSelect = useCallback(
    (tableId: string | null) => {
      // Solo permitir cambiar mesa en modo ORDER_BUILDING
      if (posMode !== 'ORDER_BUILDING') return;
      setSelectedTableId(tableId);
    },
    [posMode]
  );

  const handleCustomerNameChange = useCallback(
    (name: string) => {
      // Solo permitir cambiar nombre de cliente en modo ORDER_BUILDING
      if (posMode !== 'ORDER_BUILDING') return;
      setCustomerName(name);
    },
    [posMode]
  );

  // Handlers para categorías
  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  }, []);

  // Handlers para productos
  const handleProductSelect = useCallback(
    (product: PosProduct) => {
      // Solo permitir agregar productos en modo ORDER_BUILDING
      if (posMode !== 'ORDER_BUILDING') return;
      setSelectedProductForExtras(product);
      setIsExtrasDialogOpen(true);
    },
    [posMode]
  );

  const handleAddProductToCart = useCallback(
    (product: PosProduct, quantity: number, selectedExtras: PosProduct[]) => {
      const newItems = orderService.addItemToCart(cartItems, product, quantity, selectedExtras);
      setCartItems(newItems);
      setIsExtrasDialogOpen(false);
      setSelectedProductForExtras(null);
    },
    [cartItems]
  );

  const handleUpdateItemQuantity = useCallback(
    (itemId: string, newQuantity: number) => {
      const updatedItems = orderService.updateItemQuantity(cartItems, itemId, newQuantity);
      setCartItems(updatedItems);
    },
    [cartItems]
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      const updatedItems = orderService.removeItemFromCart(cartItems, itemId);
      setCartItems(updatedItems);
    },
    [cartItems]
  );

  // Handlers para pagos
  const handlePaymentAmountChange = useCallback(
    (method: PosPaymentMethod, amount: number) => {
      let finalAmount = amount;
      // Con dos métodos, la suma no puede superar el total: cap del monto editado
      if (selectedMethod1 && selectedMethod2) {
        finalAmount = Math.min(amount, cartState.total);
      } else if ((method === 'CARD' || method === 'TRANSFER') && amount > cartState.total) {
        finalAmount = cartState.total;
      }

      // Actualizar el monto del método seleccionado
      switch (method) {
        case 'CASH':
          setCashAmount(finalAmount);
          break;
        case 'CARD':
          setCardAmount(finalAmount);
          break;
        case 'TRANSFER':
          setTransferAmount(finalAmount);
          break;
      }

      // Si hay dos métodos seleccionados, el otro recibe la diferencia (suma = total)
      if (selectedMethod1 && selectedMethod2) {
        const otherMethod = selectedMethod1 === method ? selectedMethod2 : selectedMethod1;
        const remaining = Math.max(0, cartState.total - finalAmount);

        if (otherMethod === 'CASH') {
          setCashAmount(Math.min(remaining, cartState.total));
        } else if (otherMethod === 'CARD') {
          setCardAmount(Math.min(remaining, cartState.total));
        } else if (otherMethod === 'TRANSFER') {
          setTransferAmount(Math.min(remaining, cartState.total));
        }
      }
    },
    [cartState.total, selectedMethod1, selectedMethod2]
  );

  const handleMethod1Change = useCallback((method: PosPaymentMethod | null) => {
    setSelectedMethod1(method);
    // Si el método 1 cambia y es igual al método 2, limpiar método 2
    if (method && method === selectedMethod2) {
      setSelectedMethod2(null);
    }
    // Limpiar todos los montos al cambiar o deseleccionar método 1,
    // para que no quede el monto del método anterior (evitar que la suma sea el doble del total)
    setCashAmount(0);
    setCardAmount(0);
    setTransferAmount(0);
    if (!method) {
      // Al deseleccionar, método 2 también se limpia implícitamente por selectedMethod2
      return;
    }
    // Si hay un método nuevo, el useEffect pondrá su monto al total (solo cuando hay un método)
  }, [selectedMethod2]);

  const handleMethod2Change = useCallback(
    (method: PosPaymentMethod | null) => {
      setSelectedMethod2(method);
      if (method && method === selectedMethod1) {
        return;
      }
      // Al seleccionar el segundo método, asignar la diferencia (total - monto del primer método)
      // para que la suma de ambos no supere el total
      if (method && selectedMethod1) {
        const amount1 = orderService.getPaymentAmount(
          selectedMethod1,
          cashAmount,
          cardAmount,
          transferAmount
        );
        const remaining = Math.max(0, paymentTotal - amount1);
        const diff = Math.min(remaining, paymentTotal);
        if (method === 'CASH') setCashAmount(diff);
        else if (method === 'CARD') setCardAmount(diff);
        else if (method === 'TRANSFER') setTransferAmount(diff);
      }
    },
    [selectedMethod1, paymentTotal, cashAmount, cardAmount, transferAmount]
  );

  const setShowSecondPaymentMethod = useCallback((show: boolean) => {
    if (!show) {
      if (selectedMethod2 === 'CASH') setCashAmount(0);
      else if (selectedMethod2 === 'CARD') setCardAmount(0);
      else if (selectedMethod2 === 'TRANSFER') setTransferAmount(0);
      setSelectedMethod2(null);
    }
    setShowSecondPaymentMethodState(show);
  }, [selectedMethod2]);

  // Actualizar montos cuando cambia el total y hay un método seleccionado
  useEffect(() => {
    if (selectedMethod1 && !selectedMethod2 && paymentTotal > 0) {
      // Si solo hay un método, establecer el monto al total
      if (selectedMethod1 === 'CASH') {
        setCashAmount(paymentTotal);
      } else if (selectedMethod1 === 'CARD') {
        setCardAmount(paymentTotal);
      } else if (selectedMethod1 === 'TRANSFER') {
        setTransferAmount(paymentTotal);
      }
    }
  }, [paymentTotal, selectedMethod1, selectedMethod2]);


  // Validar orden
  const validateOrder = useCallback(() => {
    return orderService.validateOrder(
      orderType,
      selectedTableId,
      customerName,
      cartItems,
      paymentState,
      posMode
    );
  }, [orderType, selectedTableId, customerName, cartItems, paymentState, posMode]);

  // Cargar orden existente
  const loadOrder = useCallback((order: Order) => {
    setCurrentOrderId(order.id);
    setOrderType(order.type);
    setSelectedTableId(order.tableId || null);
    setCustomerName(order.customerName || '');
    setCartItems(order.items || []);
    // Cargar métodos de pago si existen
    if (order.paymentMethods && order.paymentMethods.length > 0) {
      const method1 = order.paymentMethods[0];
      setSelectedMethod1(method1.method);
      switch (method1.method) {
        case 'CASH':
          setCashAmount(method1.amount);
          break;
        case 'CARD':
          setCardAmount(method1.amount);
          break;
        case 'TRANSFER':
          setTransferAmount(method1.amount);
          break;
      }
      if (order.paymentMethods.length > 1) {
        const method2 = order.paymentMethods[1];
        setSelectedMethod2(method2.method);
        switch (method2.method) {
          case 'CASH':
            setCashAmount(method2.amount);
            break;
          case 'CARD':
            setCardAmount(method2.amount);
            break;
          case 'TRANSFER':
            setTransferAmount(method2.amount);
            break;
        }
      }
    }
  }, []);

  // Cambiar modo del POS
  const changePosMode = useCallback((mode: PosMode) => {
    setPosMode(mode);
  }, []);

  // Cargar orden inicial si se proporciona
  useEffect(() => {
    if (initialOrder) {
      loadOrder(initialOrder);
    }
  }, [initialOrder, loadOrder]);

  // ============ OPERACIONES CON BACKEND ============

  /**
   * Crea una nueva orden en el backend
   * @param userId ID del usuario/mesero que crea la orden
   * @param tip Propina opcional
   * @param note Nota opcional de la orden
   */
  const createOrderInBackend = useCallback(
    async (userId: string, tip?: number, note?: string): Promise<OrderResponse | null> => {
      // Validar orden antes de crear
      const validation = validateOrder();
      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).filter(Boolean).join('. ');
        setOrderError(errorMessages);
        return null;
      }

      if (!orderType) {
        setOrderError('Debe seleccionar un tipo de orden');
        return null;
      }

      setIsCreatingOrder(true);
      setOrderError(null);

      try {
        const order = await orderService.createOrderFromPos(
          userId,
          orderType,
          selectedTableId,
          customerName,
          cartItems,
          selectedMethod1, // Método de pago principal
          tip,
          note
        );

        setCreatedOrder(order);
        setCurrentOrderId(order.id);

        if (selectedTableId) {
          try {
            await tableService.updateTable(selectedTableId, { availabilityStatus: false });
          } catch {
            // Mesa: no se pudo actualizar estado
          }
        }

        return order;
      } catch (error) {
        console.error('Error al crear la orden:', error);
        const errorMessage = error instanceof Error ? error.message : 'No se pudo crear la orden';
        setOrderError(errorMessage);
        return null;
      } finally {
        setIsCreatingOrder(false);
      }
    },
    [orderType, selectedTableId, customerName, cartItems, selectedMethod1, validateOrder]
  );

  /**
   * Procesa el pago de una orden
   * @param orderId ID de la orden a pagar
   * @param options Opciones adicionales (transferNumber, useStripe, connectionId)
   */
  const processPaymentInBackend = useCallback(
    async (
      orderId: string,
      options?: {
        transferNumber?: string;
        useStripe?: boolean;
        connectionId?: string;
      }
    ): Promise<PaymentResponse | SplitPaymentResponse | null> => {
      if (!selectedMethod1) {
        setPaymentError('Debe seleccionar un método de pago');
        return null;
      }

      // Validar pago
      const paymentValidation = orderService.validatePayment(paymentState);
      if (!paymentValidation.isValid) {
        const errorMessages = Object.values(paymentValidation.errors).filter(Boolean).join('. ');
        setPaymentError(errorMessages);
        return null;
      }

      setIsProcessingPayment(true);
      setPaymentError(null);

      try {
        // Obtener los montos de cada método seleccionado
        const amount1 = orderService.getPaymentAmount(selectedMethod1, cashAmount, cardAmount, transferAmount);
        const amount2 = selectedMethod2
          ? orderService.getPaymentAmount(selectedMethod2, cashAmount, cardAmount, transferAmount)
          : 0;

        const result = await paymentService.processPayment(
          orderId,
          selectedMethod1,
          amount1,
          selectedMethod2,
          amount2,
          cartState.total,
          options
        );

        if (result.success && result.data) {
          setPaymentResult(result.data);

          if (selectedTableId) {
            try {
              await tableService.updateTable(selectedTableId, { availabilityStatus: true });
            } catch {
              // Mesa: no se pudo actualizar estado
            }
          }

          return result.data;
        } else {
          throw new Error('No se recibió respuesta del pago');
        }
      } catch (error) {
        console.error('Error al procesar el pago:', error);
        const errorMessage = error instanceof Error ? error.message : 'No se pudo procesar el pago';
        setPaymentError(errorMessage);
        return null;
      } finally {
        setIsProcessingPayment(false);
      }
    },
    [selectedMethod1, selectedMethod2, cashAmount, cardAmount, transferAmount, cartState.total, paymentState, selectedTableId]
  );

  /**
   * Flujo completo: Crear orden y procesar pago
   * @param userId ID del usuario/mesero
   * @param tip Propina opcional
   * @param note Nota opcional
   * @param paymentOptions Opciones de pago
   */
  const submitOrderWithPayment = useCallback(
    async (
      userId: string,
      tip?: number,
      note?: string,
      paymentOptions?: {
        transferNumber?: string;
        useStripe?: boolean;
        connectionId?: string;
      }
    ): Promise<{ order: OrderResponse | null; payment: PaymentResponse | SplitPaymentResponse | null }> => {
      // Paso 1: Crear la orden
      const order = await createOrderInBackend(userId, tip, note);
      if (!order) {
        return { order: null, payment: null };
      }

      // Paso 2: Procesar el pago
      const payment = await processPaymentInBackend(order.id, paymentOptions);

      return { order, payment };
    },
    [createOrderInBackend, processPaymentInBackend]
  );

  /**
   * Solo crear orden sin procesar pago (para pago diferido)
   */
  const submitOrderDeferred = useCallback(
    async (userId: string, tip?: number, note?: string): Promise<OrderResponse | null> => {
      return await createOrderInBackend(userId, tip, note);
    },
    [createOrderInBackend]
  );

  /**
   * Pagar una orden existente
   */
  const payExistingOrder = useCallback(
    async (
      orderId: string,
      paymentOptions?: {
        transferNumber?: string;
        useStripe?: boolean;
        connectionId?: string;
      }
    ): Promise<PaymentResponse | SplitPaymentResponse | null> => {
      return await processPaymentInBackend(orderId, paymentOptions);
    },
    [processPaymentInBackend]
  );

  // Limpiar errores
  const clearOrderError = useCallback(() => {
    setOrderError(null);
  }, []);

  const clearPaymentError = useCallback(() => {
    setPaymentError(null);
  }, []);

  // Resetear todo
  const resetPos = useCallback(() => {
    setPosMode('ORDER_BUILDING');
    setCurrentOrderId(undefined);
    setOrderType(null);
    setSelectedTableId(null);
    setCustomerName('');
    setCartItems([]);
    setCashAmount(0);
    setCardAmount(0);
    setTransferAmount(0);
    setSelectedMethod1(null);
    setSelectedMethod2(null);
    setSelectedCategoryId(null);
    setIsExtrasDialogOpen(false);
    setSelectedProductForExtras(null);
    // Resetear estado de operaciones
    setIsCreatingOrder(false);
    setIsProcessingPayment(false);
    setOrderError(null);
    setPaymentError(null);
    setCreatedOrder(null);
    setPaymentResult(null);
  }, []);

  return {
    // Estado del POS
    posMode,
    currentOrderId,
    orderType,
    selectedTableId,
    selectedTable,
    customerName,
    cartItems,
    cartState,
    cashAmount,
    cardAmount,
    transferAmount,
    selectedMethod1,
    selectedMethod2,
    showSecondPaymentMethod,
    paymentState,
    selectedCategoryId,
    filteredProducts,
    isExtrasDialogOpen,
    selectedProductForExtras,
    
    // Estado de productos del backend
    isLoadingProducts,
    productsError,
    availableExtras,

    // Estado de mesas del backend
    tables,
    isLoadingTables,
    tablesError,

    // Estado de categorías del backend
    categories,
    isLoadingCategories,
    categoriesError,

    // Estado de operaciones con backend
    isCreatingOrder,
    isProcessingPayment,
    orderError,
    paymentError,
    createdOrder,
    paymentResult,

    // Estado de orden cargada (modo edición/visualización)
    loadedOrder,
    isLoadingOrder,
    loadOrderError,

    // Handlers de UI
    handleOrderTypeChange,
    handleTableSelect,
    handleCustomerNameChange,
    handleCategorySelect,
    handleProductSelect,
    handleAddProductToCart,
    handleUpdateItemQuantity,
    handleRemoveItem,
    handlePaymentAmountChange,
    handleMethod1Change,
    handleMethod2Change,
    setShowSecondPaymentMethod,
    changePosMode,
    loadOrder,
    validateOrder,
    resetPos,

    // Dialog handlers
    setIsExtrasDialogOpen,

    // Handlers de operaciones con backend
    createOrderInBackend,
    processPaymentInBackend,
    submitOrderWithPayment,
    submitOrderDeferred,
    payExistingOrder,
    clearOrderError,
    clearPaymentError,
  };
};

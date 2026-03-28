import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Receipt, ArrowLeft, Loader2, Search } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { usePos } from '@/presentation/hooks/usePos';
import { usePaymentSound } from '@/presentation/hooks/usePaymentSound';
import { OrderOriginCard } from '@/presentation/components/pos/OrderOriginCard';
import { TableSelectionDialog } from '@/presentation/components/pos/TableSelectionDialog';
import { CategoryFilter } from '@/presentation/components/pos/CategoryFilter';
import { ProductGrid } from '@/presentation/components/pos/ProductGrid';
import { ProductExtrasDialog } from '@/presentation/components/pos/ProductExtrasDialog';
import { Cart } from '@/presentation/components/pos/Cart';
import { OrderPaymentLayout } from '@/presentation/components/pos/OrderPaymentLayout';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Badge } from '@/presentation/components/ui/badge';
import { LoadingOverlay } from '@/presentation/components/ui/loading-overlay';
// Ya no usamos PRODUCT_CATEGORIES, ahora cargamos categorías del backend
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { useAuthStore } from '@/presentation/store/auth.store';
import { orderService } from '@/application/services/order.service';
import { ticketService } from '@/application/services/ticket.service';
import type {
  OrderFormErrors,
  PosMode,
  CreateOrderRequest,
  PosPaymentMethod,
  CreateOrderResponse,
} from '@/domain/types';
import { OrderOrigins } from '@/domain/types';
import { formatOrderNumber } from '@/shared/utils/order.utils';
import { AppError } from '@/domain/errors';
import { paymentService } from '@/application/services/payment.service';

/**
 * Página del Punto de Venta (POS)
 * Responsabilidad única: Integrar todos los componentes del POS
 * Cumple SRP: Solo coordina los componentes del POS
 * 
 * Parámetros de URL:
 * - mode: 'edit' | 'pay' | 'ORDER_BUILDING' | 'PAYMENT_PROCESSING' | 'view'
 *   - edit / view: editar orden (lista mesas, grid platos, info editable)
 *   - pay: solo pagar orden (solo mesa asignada, sin grid, info readonly, sección pago visible)
 * - orderId: ID de la orden a editar/pagar (opcional)
 */
const PosPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { playSuccess } = usePaymentSound();
  const urlMode = searchParams.get('mode');
  const orderId = searchParams.get('orderId') || undefined;

  // Determinar modo inicial: pay + orderId → pago; edit/view + orderId → edición; resto → ORDER_BUILDING
  const mode: PosMode =
    urlMode === 'pay' && orderId
      ? 'PAYMENT_PROCESSING'
      : urlMode === 'PAYMENT_PROCESSING'
        ? 'PAYMENT_PROCESSING'
        : 'ORDER_BUILDING';
  const isPaymentOnlyMode = urlMode === 'pay' && !!orderId;

  const { user } = useAuthStore();

  const {
    posMode,
    currentOrderId,
    orderType,
    selectedTableId,
    customerName,
    cartItems,
    cartState,
    paymentState,
    cashAmount,
    cardAmount,
    transferAmount,
    selectedMethod1,
    selectedMethod2,
    showSecondPaymentMethod,
    selectedCategoryId,
    productSearch,
    setProductSearch,
    filteredProducts,
    isExtrasDialogOpen,
    selectedProductForExtras,
    isLoadingProducts,
    productsError,
    availableExtras,
    tables,
    isLoadingTables,
    tablesError,
    // Estado de categorías del backend
    categories,
    isLoadingCategories: _isLoadingCategories,
    categoriesError: _categoriesError,
    // Estado de orden cargada (del hook)
    loadedOrder,
    isLoadingOrder,
    loadOrderError,
    // Handlers
    handleOrderTypeChange,
    handleTableSelect,
    handleCustomerNameChange,
    handleCategorySelect,
    handleProductSelect,
    handleAddProductToCart,
    handleRemoveItem,
    handlePaymentAmountChange,
    handleMethod1Change,
    handleMethod2Change,
    setShowSecondPaymentMethod,
    changePosMode,
    validateOrder,
    resetPos,
    setIsExtrasDialogOpen,
  } = usePos({
    initialMode: mode,
    orderId,
  });

  const [validationErrors, setValidationErrors] = React.useState<OrderFormErrors>({});
  const [savedOrder, setSavedOrder] = React.useState<CreateOrderResponse | null>(null);
  const [isSavingOrder, setIsSavingOrder] = React.useState(false);
  const [isTableDialogOpen, setIsTableDialogOpen] = React.useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);
  const [isWaitingQrPayment, setIsWaitingQrPayment] = React.useState(false);
  const qrPollingRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Limpiar polling al desmontar
  React.useEffect(() => {
    return () => {
      if (qrPollingRef.current) clearInterval(qrPollingRef.current);
    };
  }, []);

  // Interceptar selección de método de pago: si es QR_MP, imprimir ticket con QR + polling
  const handleMethod1ChangeWithQr = (method: PosPaymentMethod | null) => {
    if (method === 'QR_MP') {
      const orderIdToProcess = savedOrder?.id || loadedOrder?.id;
      if (!orderIdToProcess) {
        showErrorToast('Error', 'Debes guardar la orden antes de pagar con QR');
        return;
      }
      if (!user?.id) {
        showErrorToast('Error', 'No se pudo obtener el usuario');
        return;
      }

      // Iniciar flujo QR: crear pago → imprimir ticket con QR → polling
      (async () => {
        setIsProcessingPayment(true);
        try {
          // 1. Crear pago QR en MP
          const qrResult = await paymentService.payWithQrMp(orderIdToProcess, user.id);

          // 2. Imprimir ticket con QR
          try {
            await ticketService.printSaleTicketWithQr(orderIdToProcess, qrResult.initPoint);
          } catch (ticketError) {
            console.error('Error al imprimir ticket con QR:', ticketError);
            showErrorToast('Ticket no impreso', 'El QR se generó pero no se pudo imprimir el ticket');
          }

          setIsProcessingPayment(false);
          setIsWaitingQrPayment(true);

          // 3. Polling cada 3 segundos
          qrPollingRef.current = setInterval(async () => {
            try {
              const status = await paymentService.getQrMpPaymentStatus(orderIdToProcess);
              if (status.status === 'SUCCEEDED') {
                if (qrPollingRef.current) clearInterval(qrPollingRef.current);
                setIsWaitingQrPayment(false);
                playSuccess();
                showSuccessToast('Pago QR exitoso', 'La orden se ha pagado correctamente');
                queryClient.invalidateQueries({ queryKey: ['orders'] });
                queryClient.invalidateQueries({ queryKey: ['tables'] });
                resetPos();
                setSavedOrder(null);
                setValidationErrors({});
                if (loadedOrder) navigate('/orders');
              } else if (status.status === 'FAILED' || status.status === 'CANCELED') {
                if (qrPollingRef.current) clearInterval(qrPollingRef.current);
                setIsWaitingQrPayment(false);
                showErrorToast('Pago fallido', 'El pago QR fue rechazado o cancelado');
              }
            } catch {
              // Ignorar errores de polling
            }
          }, 3000);
        } catch (error: any) {
          setIsProcessingPayment(false);
          showErrorToast('Error al generar QR', error.message || 'No se pudo crear el pago QR');
        }
      })();
      return;
    }
    handleMethod1Change(method);
  };

  const selectedTable = selectedTableId
    ? tables.find((t) => t.id === selectedTableId)
    : undefined;

  /**
   * Mapea el método de pago del POS al formato numérico del backend
   * 1: Efectivo, 2: Transferencia, 3: Tarjeta, null: split payment
   */
  const mapPaymentMethodToBackend = (
    method1: PosPaymentMethod | null,
    method2: PosPaymentMethod | null
  ): number | null => {
    // Si hay dos métodos, es split payment (null)
    if (method1 && method2) {
      return null;
    }
    // Si solo hay un método, mapearlo
    if (method1 === 'CASH') return 1;
    if (method1 === 'TRANSFER') return 2;
    if (method1 === 'CARD') return 3;
    return null;
  };

  /**
   * Mapea el tipo de orden del POS al origin del backend
   */
  const mapOrderTypeToOrigin = (orderType: 'DINE_IN' | 'TAKEOUT' | null): string => {
    if (orderType === 'DINE_IN') return 'Local';
    if (orderType === 'TAKEOUT') return 'Delivery';
    return 'Local'; // Default
  };

  /**
   * Construye el request para crear/actualizar una orden en el formato del backend
   */
  const buildCreateOrderRequest = (): CreateOrderRequest | null => {
    if (!user?.id) {
      showErrorToast('Error', 'No se pudo obtener el usuario. Por favor, inicia sesión nuevamente.');
      return null;
    }

    if (!orderType) {
      return null;
    }

    // Mapear métodos de pago
    const paymentMethod = mapPaymentMethodToBackend(selectedMethod1, selectedMethod2);

    // Validar formato UUID para productId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    // Construir orderItems
    const orderItems = cartItems.map((item) => {
      // Validar que productId sea un UUID válido
      if (!uuidRegex.test(item.productId)) {
        console.error(`productId inválido (no es UUID): ${item.productId} para producto: ${item.product.name}`);
        // TODO: Cuando se integre con la API real, los productos vendrán con UUIDs válidos
        // Por ahora, esto causará un error de validación en el backend
      }

      const extras = item.selectedExtras.map((extra) => {
        // Validar que extraId sea un UUID válido
        if (!uuidRegex.test(extra.id)) {
          console.error(`extraId inválido (no es UUID): ${extra.id} para extra: ${extra.name}`);
        }
        return {
          extraId: extra.id,
          quantity: 1, // Por defecto 1, pero podríamos permitir cantidad de extras en el futuro
          price: extra.price,
        };
      });

      return {
        menuItemId: item.productId, // El ID del POS corresponde a un MenuItem del backend
        quantity: item.quantity,
        price: item.basePrice, // Precio base del producto
        note: item.note?.trim() || null,
        extras: extras.length > 0 ? extras : undefined,
      };
    });

    // Validar que tableId sea un UUID válido si está presente
    // Si no es un UUID válido, enviarlo como null
    let validTableId: string | null = null;
    if (orderType === 'DINE_IN' && selectedTableId) {
      // Validar formato UUID (básico: debe tener el formato xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(selectedTableId)) {
        validTableId = selectedTableId;
      } else {
        validTableId = null;
      }
    }

    return {
      userId: user.id,
      paymentMethod: paymentMethod || undefined,
      tableId: validTableId,
      tip: 0, // Por ahora no hay propina en el POS
      origin: mapOrderTypeToOrigin(orderType),
      client: orderType === 'TAKEOUT' ? customerName || null : null,
      paymentDiffer: !!(selectedMethod1 && selectedMethod2),
      note: null, // Por ahora no hay notas generales
      orderItems,
    };
  };

  const handleSaveOrder = async () => {
    const validation = validateOrder();
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      showErrorToast('Error de validación', 'Por favor, complete todos los campos requeridos');
      return;
    }

    setIsSavingOrder(true);

    try {
      // Si hay una orden cargada, actualizarla en lugar de crear una nueva
      if (loadedOrder) {
        // Verificar si la orden ya fue pagada
        if (loadedOrder.status === true) {
          showErrorToast('Error', 'No se pueden modificar los items de una orden ya pagada');
          setIsSavingOrder(false);
          return;
        }

        // Construir los items actualizados para el backend
        const orderItems = cartItems.map((item) => {
          // Mapear los extras
          const extras = item.selectedExtras.map((extra) => ({
            extraId: extra.id,
            quantity: 1,
            price: extra.price,
          }));

          return {
            menuItemId: item.productId, // En el POS usamos productId pero el backend espera menuItemId
            quantity: item.quantity,
            price: item.basePrice,
            note: item.note || null,
            extras: extras.length > 0 ? extras : undefined,
          };
        });

        // Construir objeto de actualización completo
        const validTableId = orderType === 'DINE_IN' && selectedTableId ? selectedTableId : null;
        
        const updateRequest = {
          tableId: validTableId,
          origin: mapOrderTypeToOrigin(orderType),
          client: orderType === 'TAKEOUT' ? customerName || null : null,
          tip: 0,
          note: null,
          orderItems, // Incluir los items actualizados - REEMPLAZA todos los items existentes
        };

        const updatedOrder = await orderService.updateOrder(loadedOrder.id, updateRequest);

        setSavedOrder(updatedOrder);
        showSuccessToast('Orden actualizada', 'La orden se ha actualizado correctamente');
        setValidationErrors({});
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        navigate('/orders');
      } else {
        // Crear nueva orden
        const orderRequest = buildCreateOrderRequest();
        
        if (!orderRequest) {
          setIsSavingOrder(false);
          return;
        }

        const createdOrder = await orderService.createOrder(orderRequest);

        setSavedOrder(createdOrder);
        showSuccessToast('Orden guardada', 'La orden se ha guardado correctamente');
        setValidationErrors({});
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error al guardar orden:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo guardar la orden';
      showErrorToast('Error', errorMessage);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleContinueToPayment = () => {
    const validation = validateOrder();
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      showErrorToast('Error de validación', 'Por favor, complete todos los campos requeridos');
      return;
    }

    // Cambiar al modo de pago
    changePosMode('PAYMENT_PROCESSING');
    setValidationErrors({});
  };

  const handleBackToEdit = () => {
    changePosMode('ORDER_BUILDING');
    setValidationErrors({});
  };

  const handleProcessPayment = async () => {
    const validation = validateOrder();
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      showErrorToast('Error de validación', 'Por favor, complete todos los campos requeridos');
      return;
    }

    // Obtener el ID de la orden (puede ser de savedOrder o loadedOrder)
    const orderIdToProcess = savedOrder?.id || loadedOrder?.id;

    // Verificar que la orden esté guardada o cargada
    if (!orderIdToProcess) {
      showErrorToast('Error', 'Debes guardar la orden antes de procesar el pago');
      return;
    }

    const orderTotal = loadedOrder ? loadedOrder.total : cartState.total;
    const amountRounded = Math.round(orderTotal * 100) / 100;

    setIsProcessingPayment(true);
    try {
      // Pago único: intentar POST /api/orders/:order_id/pay; si 404, fallback a PUT updateOrder
      if (!selectedMethod2) {
        const payMethod: 'CASH' | 'TRANSFER' | 'CARD_PHYSICAL' =
          selectedMethod1 === 'CASH'
            ? 'CASH'
            : selectedMethod1 === 'TRANSFER'
              ? 'TRANSFER'
              : 'CARD_PHYSICAL';
        const payBody = {
          paymentMethod: payMethod,
          amount: amountRounded,
        };
        try {
          const result = await orderService.payOrder(orderIdToProcess, payBody);
          if (result.tableReleased) {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
          }
        } catch (payError) {
          // Si el backend no tiene POST /pay (404), usar PUT updateOrder
          const is404 =
            payError instanceof AppError && payError.statusCode === 404;
          if (is404) {
            const paymentMethodNum =
              selectedMethod1 === 'CASH'
                ? 1
                : selectedMethod1 === 'TRANSFER'
                  ? 2
                  : 3;
            await orderService.updateOrder(orderIdToProcess, {
              status: true,
              paymentMethod: paymentMethodNum,
              delivered: true,
            });
          } else {
            throw payError;
          }
        }
      } else {
        // Pago dividido: POST /api/orders/:id/pay crea Payment + PaymentDifferentiation con cada método
        if (!selectedMethod1 || !selectedMethod2) {
          showErrorToast('Error', 'Selecciona dos métodos de pago para el pago dividido');
          return;
        }
        const amount1 = orderService.getPaymentAmount(
          selectedMethod1,
          cashAmount,
          cardAmount,
          transferAmount
        );
        const amount2 = orderService.getPaymentAmount(
          selectedMethod2,
          cashAmount,
          cardAmount,
          transferAmount
        );
        const mapMethod = (m: PosPaymentMethod): 'CASH' | 'TRANSFER' | 'CARD_PHYSICAL' =>
          m === 'CARD' ? 'CARD_PHYSICAL' : m as 'CASH' | 'TRANSFER' | 'CARD_PHYSICAL';
        const a1 = Math.round(amount1 * 100) / 100;
        const a2 = Math.round(amount2 * 100) / 100;
        const paySplitResult = await orderService.payOrder(orderIdToProcess, {
          firstPayment: { amount: a1, paymentMethod: mapMethod(selectedMethod1) },
          secondPayment: { amount: a2, paymentMethod: mapMethod(selectedMethod2) },
        });
        if (paySplitResult.tableReleased) {
          queryClient.invalidateQueries({ queryKey: ['tables'] });
        }
      }

      playSuccess();
      showSuccessToast('Orden procesada', 'La orden se ha procesado correctamente');
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Lanzar diálogo de impresión del ticket de venta (cliente) tras pago exitoso
      try {
        await ticketService.printSaleTicket(orderIdToProcess);
      } catch (ticketError) {
        console.error('Error al imprimir ticket:', ticketError);
        showErrorToast('Ticket no impreso', 'El pago fue exitoso pero no se pudo abrir el ticket para imprimir.');
      }

      resetPos();
      setSavedOrder(null);
      setValidationErrors({});
      if (loadedOrder) {
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      if (error instanceof AppError) {
        const messages: Record<string, string> = {
          ORDER_NOT_FOUND: 'Orden no encontrada',
          ORDER_ALREADY_PAID: 'Esta orden ya fue pagada',
          PAYMENT_AMOUNT_MISMATCH: 'El monto debe coincidir con el total de la orden',
          SPLIT_PAYMENT_ALREADY_EXISTS: 'Esta orden ya tiene pago dividido registrado',
          SPLIT_PAYMENT_INVALID_METHOD: 'Método de pago no válido para pago dividido',
          SPLIT_PAYMENT_SAME_METHOD: 'Los dos métodos del pago dividido deben ser distintos',
          SPLIT_PAYMENT_AMOUNT_EXCEEDS_TOTAL: 'La suma de los pagos supera el total de la orden',
          SPLIT_PAYMENT_AMOUNT_MISMATCH: 'La suma de los pagos debe coincidir con el total de la orden',
        };
        showErrorToast('Error', messages[error.code] ?? error.message);
      } else if (error instanceof Error) {
        showErrorToast('Error', error.message || 'No se pudo procesar el pago');
      } else {
        showErrorToast('Error', 'No se pudo procesar el pago');
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const isPaymentButtonEnabled = () => {
    const validation = validateOrder();
    return validation.isValid;
  };

  const isOrderValid = () => {
    const validation = validateOrder();
    return validation.isValid;
  };

  // Si está cargando la orden, mostrar loading
  if (isLoadingOrder) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-slate-600 dark:text-slate-300 text-lg">Cargando orden...</p>
        </div>
      </MainLayout>
    );
  }

  // Si hay error al cargar la orden
  if (loadOrderError && orderId) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-full p-4 mb-4">
            <Receipt className="h-12 w-12 text-red-500" />
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium text-lg mb-2">
            Error al cargar la orden
          </p>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{loadOrderError}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/orders')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Órdenes
            </Button>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <LoadingOverlay
        open={isSavingOrder || isProcessingPayment || isWaitingQrPayment}
        message={
          isWaitingQrPayment
            ? 'Esperando pago QR... El ticket fue impreso con el código QR'
            : isProcessingPayment
              ? 'Generando QR de pago...'
              : 'Guardando orden...'
        }
      />
      <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
        {/* Banner de orden cargada */}
        {loadedOrder && (
          <div className={`rounded-lg p-4 mb-4 border ${
            loadedOrder.status 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Orden {formatOrderNumber(loadedOrder.id)}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {loadedOrder.table ? `Mesa ${loadedOrder.table.name}` : loadedOrder.origin} 
                    {loadedOrder.client && ` • ${loadedOrder.client}`}
                  </p>
                </div>
                <Badge className={loadedOrder.status 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }>
                  {loadedOrder.status ? 'Pagada' : 'Pendiente'}
                </Badge>
                {loadedOrder.delivered && (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    Entregada
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${loadedOrder.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {loadedOrder.orderItems?.length || 0} items
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Volver
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header mejorado */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              {posMode === 'ORDER_BUILDING' ? (
                <ShoppingCart className="h-6 w-6 text-white" />
              ) : (
                <Receipt className="h-6 w-6 text-white" />
              )}
            </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {loadedOrder 
                        ? `Orden ${formatOrderNumber(loadedOrder.id)}` 
                        : posMode === 'ORDER_BUILDING' 
                          ? 'Crear/Editar Orden' 
                          : 'Procesar Pago'
                      }
                    </h1>
                    {!(posMode === 'ORDER_BUILDING' && !loadedOrder && !isPaymentOnlyMode) && (
                      <Badge
                        variant={posMode === 'ORDER_BUILDING' ? 'default' : 'secondary'}
                        className="text-sm px-3 py-1"
                      >
                        {isPaymentOnlyMode 
                          ? 'Pago' 
                          : loadedOrder && posMode === 'ORDER_BUILDING' 
                            ? 'Edición' 
                            : loadedOrder 
                              ? 'Visualización' 
                              : 'Pago'}
                      </Badge>
                    )}
                  </div>
              {(currentOrderId || loadedOrder) && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                  <span className="font-medium">
                    ID: {loadedOrder?.id || currentOrderId}
                  </span>
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {posMode === 'PAYMENT_PROCESSING' && !loadedOrder && !isPaymentOnlyMode && (
              <Button variant="outline" onClick={handleBackToEdit} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver a Editar
              </Button>
            )}
          </div>
        </div>

        {/* Modo pago: layout 50% resumen orden / 50% pago (sin espacio en blanco) */}
        {posMode === 'PAYMENT_PROCESSING' && cartItems.length > 0 && (
          <OrderPaymentLayout
            orderInfo={
              isPaymentOnlyMode && loadedOrder
                ? {
                    origin: loadedOrder.origin || (loadedOrder.tableId ? 'Local' : 'Para llevar'),
                    tableName: loadedOrder.table?.name,
                    client: loadedOrder.client,
                    isReadOnly: true,
                    orderId: loadedOrder.id,
                  }
                : {
                    origin: orderType === 'DINE_IN' ? 'Local' : 'Para llevar',
                    tableName: orderType === 'DINE_IN' && selectedTableId
                      ? tables.find((t) => t.id === selectedTableId)?.name
                      : undefined,
                    client: orderType === 'TAKEOUT' ? customerName || null : null,
                    isReadOnly: false,
                    orderId: loadedOrder?.id || savedOrder?.id || orderId,
                  }
            }
            cartItems={cartItems}
            cartState={
              isPaymentOnlyMode && loadedOrder
                ? { ...cartState, total: loadedOrder.total }
                : cartState
            }
            paymentState={paymentState}
            paymentErrors={validationErrors}
            selectedMethod1={selectedMethod1}
            selectedMethod2={selectedMethod2}
            showSecondPaymentMethod={showSecondPaymentMethod}
            onShowSecondPaymentMethodChange={setShowSecondPaymentMethod}
            onPaymentAmountChange={handlePaymentAmountChange}
            onMethod1Change={handleMethod1ChangeWithQr}
            onMethod2Change={handleMethod2Change}
            onProcessPayment={handleProcessPayment}
            isProcessPaymentEnabled={isPaymentButtonEnabled() && !isProcessingPayment}
          />
        )}

        {/* Modo creación/edición: grid productos + carrito - ambas columnas mismo alto, todo el espacio en productos con overflow */}
        {posMode === 'ORDER_BUILDING' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch h-[calc(100vh)] min-h-[420px]">
          {/* Columna izquierda - Productos: un poco más ancha que la derecha, todo el alto, contenido con overflow */}
          <div className="lg:col-span-3 flex flex-col min-h-0 h-full">
            {!isPaymentOnlyMode && (
              <Card className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <CardHeader className="shrink-0">
                  <CardTitle>Productos</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 min-h-0 gap-4 p-4 pt-0 overflow-hidden">
                  <div className="relative shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <Input
                      type="search"
                      placeholder="Buscar platos, categorías o ingredientes..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-9"
                      aria-label="Buscar productos"
                    />
                  </div>
                  <CategoryFilter
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onCategorySelect={handleCategorySelect}
                  />
                  <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                    <ProductGrid
                      products={filteredProducts}
                      onProductSelect={handleProductSelect}
                      isLoading={isLoadingProducts}
                      error={productsError}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Columna derecha - Cards siempre visibles (carrito, origen, guardar) */}
          <div className="flex md:col-span-2 flex-col gap-6 min-h-0 h-full overflow-hidden">
            {/* 1. Carrito - siempre visible (vacío o con ítems), ocupa el espacio restante con overflow */}
            <div className="min-h-0 flex-1 flex flex-col overflow-hidden">
              <Cart
                items={cartItems}
                onRemoveItem={handleRemoveItem}
                readOnly={false}
                className="h-full"
              />
            </div>

            {/* 2. Origen de la orden (tipo + mesa o nombre cliente) - siempre visible */}
            {!isPaymentOnlyMode && (
              <OrderOriginCard
                orderType={orderType}
                onOrderTypeChange={(type) => {
                  handleOrderTypeChange(type);
                  if (type === 'DINE_IN') setIsTableDialogOpen(true);
                }}
                selectedTable={selectedTable}
                onSelectTableClick={() => setIsTableDialogOpen(true)}
                customerName={customerName}
                onCustomerNameChange={handleCustomerNameChange}
                validationErrors={{
                  tableId: validationErrors.tableId,
                  customerName: validationErrors.customerName,
                }}
              />
            )}

            {/* Total del carrito (visible antes de guardar para validar en E2E) */}
            {cartItems.length > 0 && (
              <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total</span>
                <span className="text-lg font-bold text-primary" data-testid="cart-total" aria-label={`Total de la orden ${cartState.total.toFixed(2)}`}>
                  ${cartState.total.toFixed(2)}
                </span>
              </div>
            )}

            {/* 3. Guardar orden - siempre visible, deshabilitado si no hay ítems */}
            <div className="space-y-3 shrink-0">
              {loadedOrder ? (
                <Button
                  onClick={handleSaveOrder}
                  disabled={cartItems.length === 0 || !isOrderValid() || isSavingOrder}
                  className="w-full shadow-md hover:shadow-lg transition-all"
                  variant="outline"
                  size="lg"
                >
                  {isSavingOrder ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              ) : (
                <Button
                  onClick={handleSaveOrder}
                  disabled={cartItems.length === 0 || !isOrderValid() || isSavingOrder}
                  className="w-full shadow-md hover:shadow-lg transition-all"
                  variant="outline"
                  size="lg"
                >
                  {isSavingOrder ? 'Guardando...' : 'Guardar Orden'}
                </Button>
              )}
              {savedOrder && !savedOrder.status && (
                <Button
                  onClick={handleContinueToPayment}
                  disabled={cartItems.length === 0 || !isOrderValid()}
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  Continuar al Pago
                </Button>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Diálogo de extras */}
        <ProductExtrasDialog
          open={isExtrasDialogOpen}
          onOpenChange={setIsExtrasDialogOpen}
          product={selectedProductForExtras}
          onAddToCart={handleAddProductToCart}
          availableExtras={availableExtras}
          categories={categories}
        />

        {/* Diálogo de selección de mesa (solo tipo local) */}
        <TableSelectionDialog
          open={isTableDialogOpen}
          onOpenChange={setIsTableDialogOpen}
          tables={tables}
          selectedTableId={selectedTableId}
          onTableSelect={handleTableSelect}
          isLoading={isLoadingTables}
          error={tablesError}
          disabled={!!(loadedOrder && loadedOrder.origin === OrderOrigins.LOCAL)}
        />

        {/* Botón cancelar espera QR */}
        {isWaitingQrPayment && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <Button
              variant="outline"
              className="bg-white dark:bg-slate-800 shadow-lg"
              onClick={() => {
                if (qrPollingRef.current) clearInterval(qrPollingRef.current);
                setIsWaitingQrPayment(false);
                showErrorToast('Cancelado', 'Se canceló la espera del pago QR');
              }}
            >
              Cancelar espera de pago
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PosPage;

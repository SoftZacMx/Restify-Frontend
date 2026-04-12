import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Receipt, ArrowLeft, ShoppingCart, X } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { usePos, useQrPaymentFlow } from '@/presentation/hooks/pos';
import { usePaymentSound } from '@/presentation/hooks/usePaymentSound';
import { PosOrderBanner } from '@/presentation/components/pos/PosOrderBanner';
import { PosHeader } from '@/presentation/components/pos/PosHeader';
import { PosProductSection } from '@/presentation/components/pos/PosProductSection';
import { PosOrderSidebar } from '@/presentation/components/pos/PosOrderSidebar';
import { TableSelectionDialog } from '@/presentation/components/pos/TableSelectionDialog';
import { ProductExtrasDialog } from '@/presentation/components/pos/ProductExtrasDialog';
import { OrderPaymentLayout } from '@/presentation/components/pos/OrderPaymentLayout';
import { PaymentSuccessView } from '@/presentation/components/pos/PaymentSuccessView';
import { Button } from '@/presentation/components/ui/button';
import { LoadingOverlay } from '@/presentation/components/ui/loading-overlay';
// Ya no usamos PRODUCT_CATEGORIES, ahora cargamos categorías del backend
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { useAuthStore } from '@/presentation/store/auth.store';
import { orderService } from '@/application/services/order.service';
import { companyService } from '@/application/services/company.service';
import type {
  OrderFormErrors,
  PosMode,
  CreateOrderRequest,
  PosPaymentMethod,
  CreateOrderResponse,
} from '@/domain/types';
import { OrderOrigins } from '@/domain/types';
import { AppError } from '@/domain/errors';

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

  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [validationErrors, setValidationErrors] = React.useState<OrderFormErrors>({});
  const [savedOrder, setSavedOrder] = React.useState<CreateOrderResponse | null>(null);
  const [isSavingOrder, setIsSavingOrder] = React.useState(false);
  const [isTableDialogOpen, setIsTableDialogOpen] = React.useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);

  // Flujo de pago QR
  const {
    isProcessingQr,
    isWaitingQrPayment,
    paymentSuccessData,
    setPaymentSuccessData,
    startQrPayment,
    cancelQrPayment,
  } = useQrPaymentFlow({
    orderId: savedOrder?.id || loadedOrder?.id,
    userId: user?.id,
    orderDate: savedOrder?.date || loadedOrder?.date,
    paymentTotal: paymentState.total,
  });

  // Interceptar selección de método de pago: si es QR_MP, delegar al hook
  const handleMethod1ChangeWithQr = React.useCallback((method: PosPaymentMethod | null) => {
    if (method === 'QR_MP') {
      startQrPayment();
      return;
    }
    handleMethod1Change(method);
  }, [startQrPayment, handleMethod1Change]);

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
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Determine payment method number
      const pmNumber = selectedMethod1 === 'CASH' ? 1
        : selectedMethod1 === 'TRANSFER' ? 2
        : selectedMethod1 === 'CARD' ? 3
        : selectedMethod1 === 'QR_MP' ? 4
        : (selectedMethod2 ? null : 1);

      if (selectedMethod1 === 'QR_MP') {
        // Show payment success view only for Mercado Pago QR
        const company = await companyService.getCompany().catch(() => null);
        setPaymentSuccessData({
          orderId: orderIdToProcess,
          date: savedOrder?.date || loadedOrder?.date || new Date().toISOString(),
          total: paymentState.total,
          paymentMethod: pmNumber,
          companyName: company?.name,
        });
      } else {
        // For other payment methods, show toast and redirect
        showSuccessToast('Pago exitoso', 'La orden ha sido pagada correctamente');
        resetPos();
        setSavedOrder(null);
        setValidationErrors({});
        navigate('/orders');
      }

      setIsProcessingPayment(false);
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

  // Payment success view
  if (paymentSuccessData) {
    return (
      <MainLayout>
        <PaymentSuccessView
          data={paymentSuccessData}
          onRedirect={() => {
            setPaymentSuccessData(null);
            resetPos();
            setSavedOrder(null);
            setValidationErrors({});
            navigate('/orders');
          }}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <LoadingOverlay
        open={isSavingOrder || isProcessingPayment || isProcessingQr || isWaitingQrPayment}
        message={
          isWaitingQrPayment
            ? 'Esperando pago QR... El ticket fue impreso con el código QR'
            : isProcessingQr
              ? 'Generando QR de pago...'
              : 'Guardando orden...'
        }
      />
      <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
        {/* Banner de orden cargada */}
        {loadedOrder && (
          <PosOrderBanner order={loadedOrder} onBack={() => navigate('/orders')} />
        )}

        {/* Header */}
        <PosHeader
          posMode={posMode}
          loadedOrder={loadedOrder}
          currentOrderId={currentOrderId}
          isPaymentOnlyMode={isPaymentOnlyMode}
          onBackToEdit={handleBackToEdit}
        />

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

        {/* Modo creación/edición: grid productos + carrito */}
        {posMode === 'ORDER_BUILDING' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch h-[calc(100vh)] min-h-[420px]">
            {!isPaymentOnlyMode && (
              <PosProductSection
                productSearch={productSearch}
                onProductSearchChange={setProductSearch}
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={handleCategorySelect}
                filteredProducts={filteredProducts}
                onProductSelect={handleProductSelect}
                isLoading={isLoadingProducts}
                error={productsError}
              />
            )}

            {/* Sidebar visible solo en desktop */}
            <div className="hidden lg:flex lg:col-span-2 lg:flex-col lg:min-h-0 lg:h-full">
              <PosOrderSidebar
                cartItems={cartItems}
                cartState={cartState}
                onRemoveItem={handleRemoveItem}
                orderType={orderType}
                onOrderTypeChange={handleOrderTypeChange}
                selectedTable={selectedTable}
                onSelectTableClick={() => setIsTableDialogOpen(true)}
                customerName={customerName}
                onCustomerNameChange={handleCustomerNameChange}
                validationErrors={{
                  tableId: validationErrors.tableId,
                  customerName: validationErrors.customerName,
                }}
                isPaymentOnlyMode={isPaymentOnlyMode}
                isOrderValid={isOrderValid()}
                isSavingOrder={isSavingOrder}
                hasLoadedOrder={!!loadedOrder}
                savedOrder={savedOrder}
                onSaveOrder={handleSaveOrder}
                onContinueToPayment={handleContinueToPayment}
              />
            </div>
          </div>

          {/* Botón flotante del carrito — solo móvil */}
          <button
            type="button"
            onClick={() => setIsCartSheetOpen(true)}
            className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItems.length > 0 && (
              <>
                <span className="font-semibold">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</span>
                <span className="text-sm opacity-90">— ${cartState.total.toFixed(2)}</span>
              </>
            )}
            {cartItems.length === 0 && <span className="font-semibold">Carrito</span>}
          </button>

          {/* Bottom sheet del carrito — solo móvil */}
          {isCartSheetOpen && (
            <div className="lg:hidden fixed inset-0 z-50">
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setIsCartSheetOpen(false)}
              />
              {/* Panel */}
              <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
                {/* Handle + close */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-slate-200 dark:border-slate-700 shrink-0">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Carrito ({cartItems.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCartSheetOpen(false)}
                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
                {/* Contenido del sidebar dentro del sheet */}
                <div className="flex-1 overflow-y-auto p-4">
                  <PosOrderSidebar
                    cartItems={cartItems}
                    cartState={cartState}
                    onRemoveItem={handleRemoveItem}
                    orderType={orderType}
                    onOrderTypeChange={handleOrderTypeChange}
                    selectedTable={selectedTable}
                    onSelectTableClick={() => {
                      setIsCartSheetOpen(false);
                      setIsTableDialogOpen(true);
                    }}
                    customerName={customerName}
                    onCustomerNameChange={handleCustomerNameChange}
                    validationErrors={{
                      tableId: validationErrors.tableId,
                      customerName: validationErrors.customerName,
                    }}
                    isPaymentOnlyMode={isPaymentOnlyMode}
                    isOrderValid={isOrderValid()}
                    isSavingOrder={isSavingOrder}
                    hasLoadedOrder={!!loadedOrder}
                    savedOrder={savedOrder}
                    onSaveOrder={handleSaveOrder}
                    onContinueToPayment={handleContinueToPayment}
                  />
                </div>
              </div>
            </div>
          )}
        </>
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
                cancelQrPayment();
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

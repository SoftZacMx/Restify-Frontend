import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Receipt, Edit, ArrowLeft, Loader2 } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { usePos } from '@/presentation/hooks/usePos';
import { OrderTypeSelector } from '@/presentation/components/pos/OrderTypeSelector';
import { TableSelector } from '@/presentation/components/pos/TableSelector';
import { CustomerNameInput } from '@/presentation/components/pos/CustomerNameInput';
import { CategoryFilter } from '@/presentation/components/pos/CategoryFilter';
import { ProductGrid } from '@/presentation/components/pos/ProductGrid';
import { ProductExtrasDialog } from '@/presentation/components/pos/ProductExtrasDialog';
import { Cart } from '@/presentation/components/pos/Cart';
import { OrderSummary } from '@/presentation/components/pos/OrderSummary';
import { OrderPaymentLayout } from '@/presentation/components/pos/OrderPaymentLayout';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';
// Ya no usamos PRODUCT_CATEGORIES, ahora cargamos categorías del backend
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { useAuthStore } from '@/presentation/store/auth.store';
import { orderService } from '@/application/services/order.service';
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
    selectedMethod1,
    selectedMethod2,
    showSecondPaymentMethod,
    selectedCategoryId,
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
        note: null, // Por ahora no hay notas por item
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
      paymentDiffer: false, // Por ahora no hay pago diferido
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
        // Pago dividido (dos métodos): PUT updateOrder (sin endpoint /pay para split)
        const orderRequest = buildCreateOrderRequest();
        const updateRequest = {
          status: true,
          paymentMethod: orderRequest?.paymentMethod ?? null,
          delivered: true,
        };
        await orderService.updateOrder(orderIdToProcess, updateRequest);
      }

      showSuccessToast('Orden procesada', 'La orden se ha procesado correctamente');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
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
        };
        showErrorToast('Error', messages[error.code] ?? error.message);
      } else if (error instanceof Error) {
        showErrorToast('Error', error.message || 'No se pudo procesar el pago');
      } else {
        showErrorToast('Error', 'No se pudo procesar el pago');
      }
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
                    {loadedOrder.table ? `Mesa ${loadedOrder.table.numberTable}` : loadedOrder.origin} 
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
            {loadedOrder && (
              <Button variant="outline" onClick={() => navigate('/orders')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver a Órdenes
              </Button>
            )}
            {posMode === 'PAYMENT_PROCESSING' && !loadedOrder && !isPaymentOnlyMode && (
              <Button variant="outline" onClick={handleBackToEdit} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver a Editar
              </Button>
            )}
            {cartItems.length > 0 && posMode === 'ORDER_BUILDING' && !loadedOrder && (
              <Button variant="outline" onClick={resetPos} className="gap-2">
                <Edit className="h-4 w-4" />
                Nueva Orden
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
                    tableNumber: loadedOrder.table?.numberTable,
                    client: loadedOrder.client,
                    isReadOnly: true,
                  }
                : {
                    origin: orderType === 'DINE_IN' ? 'Local' : 'Para llevar',
                    tableNumber: orderType === 'DINE_IN' && selectedTableId
                      ? tables.find((t) => t.id === selectedTableId)?.number
                      : undefined,
                    client: orderType === 'TAKEOUT' ? customerName || null : null,
                    isReadOnly: false,
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
            onMethod1Change={handleMethod1Change}
            onMethod2Change={handleMethod2Change}
            onProcessPayment={handleProcessPayment}
            isProcessPaymentEnabled={isPaymentButtonEnabled()}
          />
        )}

        {/* Modo creación/edición: grid productos + carrito */}
        {posMode === 'ORDER_BUILDING' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Productos o información de orden */}
          <div className="lg:col-span-2 space-y-6">
            {/* Modo edición/creación: tipo, mesas, cliente, grid de productos */}
            {!isPaymentOnlyMode && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Tipo de Orden</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrderTypeSelector
                      orderType={orderType}
                      onOrderTypeChange={handleOrderTypeChange}
                    />
                  </CardContent>
                </Card>

                {orderType === 'DINE_IN' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Información de Mesa</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingTables ? (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                          Cargando mesas...
                        </div>
                      ) : tablesError ? (
                        <div className="text-center py-8 text-red-500">
                          {tablesError}
                        </div>
                      ) : tables.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                          No hay mesas disponibles
                        </div>
                      ) : (
                        <TableSelector
                          tables={tables}
                          selectedTableId={selectedTableId}
                          onTableSelect={handleTableSelect}
                          disabled={!!(loadedOrder && loadedOrder.origin === OrderOrigins.LOCAL)}
                        />
                      )}
                      {validationErrors.tableId && (
                        <p className="text-sm text-destructive mt-2">{validationErrors.tableId}</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {orderType === 'TAKEOUT' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Información del Cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CustomerNameInput
                        customerName={customerName}
                        onCustomerNameChange={handleCustomerNameChange}
                      />
                      {validationErrors.customerName && (
                        <p className="text-sm text-destructive mt-2">
                          {validationErrors.customerName}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {orderType && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Productos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CategoryFilter
                        categories={categories}
                        selectedCategoryId={selectedCategoryId}
                        onCategorySelect={handleCategorySelect}
                      />
                      <ProductGrid
                        products={filteredProducts}
                        onProductSelect={handleProductSelect}
                        isLoading={isLoadingProducts}
                        error={productsError}
                      />
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Columna derecha - Carrito (solo modo ORDER_BUILDING) */}
          <div className="space-y-6">
            <Cart items={cartItems} onRemoveItem={handleRemoveItem} readOnly={false} />

            {cartItems.length > 0 && (
              <>
                <OrderSummary cartState={cartState} />
                <div className="space-y-3">
                  {/* Nueva orden: "Guardar Orden". Editar: "Guardar Cambios" (al guardar redirige a /orders) */}
                  {loadedOrder ? (
                    <Button
                      onClick={handleSaveOrder}
                      disabled={!isOrderValid() || isSavingOrder}
                      className="w-full shadow-md hover:shadow-lg transition-all"
                      variant="outline"
                      size="lg"
                    >
                      {isSavingOrder ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSaveOrder}
                      disabled={!isOrderValid() || isSavingOrder}
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
                      disabled={!isOrderValid()}
                      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                    >
                      Continuar al Pago
                    </Button>
                  )}
                </div>
              </>
            )}
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
        />
      </div>
    </MainLayout>
  );
};

export default PosPage;

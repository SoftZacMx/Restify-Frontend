import React, { useState, useMemo, useCallback } from 'react';
import { Plus, RefreshCw, FileText, WifiOff, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/presentation/components/ui/alert-dialog';
import { OrderSearchBar } from '@/presentation/components/orders/OrderSearchBar';
import { OrdersGrid } from '@/presentation/components/orders/OrdersGrid';
import { OrderDetailDialog } from '@/presentation/components/orders/OrderDetailDialog';
import { SplitPaymentDialog } from '@/presentation/components/orders/SplitPaymentDialog';
import { ConnectionIndicator } from '@/presentation/components/websocket/ConnectionIndicator';
import { useWebSocketContext } from '@/presentation/contexts/websocket.context';
import { orderService, tableService, ticketService } from '@/application/services';
import type { OrderResponse } from '@/domain/types';
import {
  type OrderViewFilters,
  getDefaultOrderFiltersForToday,
  convertViewFiltersToApiFilters,
  filterOrdersClient,
} from '@/shared/utils/order.utils';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

/**
 * Página de Órdenes
 * Muestra lista de órdenes con filtros, detalles y acciones
 */
const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Estado de conexión WebSocket
  const { isConnected, connectionId } = useWebSocketContext();

  // Estado de filtros (por defecto: órdenes del día de hoy)
  const [filters, setFilters] = useState<OrderViewFilters>(() => getDefaultOrderFiltersForToday());
  const [showFilters, setShowFilters] = useState(false); // Por defecto oculto

  // Estado de modales
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<OrderResponse | null>(null);
  const [orderForSplitPayment, setOrderForSplitPayment] = useState<OrderResponse | null>(null);

  // Estado de operaciones
  const [_isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPrintingTicket, setIsPrintingTicket] = useState(false);

  // Convertir filtros de vista a filtros de API
  const apiFilters = useMemo(() => convertViewFiltersToApiFilters(filters), [filters]);

  // Query para obtener órdenes
  const {
    data: orders = [],
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['orders', apiFilters],
    queryFn: async () => {
      const orders = await orderService.listOrders(apiFilters);
      console.log('[OrdersPage] Órdenes del backend:', orders);
      return orders;
    },
    staleTime: 10000, // 10 segundos
    retry: 1,
  });

  // Query para obtener mesas (para filtros)
  const { data: tables = [], isLoading: isLoadingTables } = useQuery({
    queryKey: ['tables-for-filter'],
    queryFn: async () => {
      return await tableService.listTables({ status: true });
    },
    staleTime: 60000, // 1 minuto
  });

  // Orden completa para el diálogo de detalle (mesa, items, extras)
  const { data: detailOrder = null, isLoading: isLoadingDetailOrder } = useQuery({
    queryKey: ['order', selectedOrderId],
    queryFn: async () => {
      if (!selectedOrderId) return null;
      return await orderService.getOrderById(selectedOrderId);
    },
    enabled: !!selectedOrderId && isDetailDialogOpen,
    staleTime: 0,
  });

  // Si la orden tiene tableId pero el backend no devolvió table, obtener la mesa
  const { data: detailOrderTable = null } = useQuery({
    queryKey: ['table', detailOrder?.tableId],
    queryFn: async () => {
      if (!detailOrder?.tableId) return null;
      return await tableService.getTableById(detailOrder.tableId);
    },
    enabled: !!detailOrder?.tableId && !detailOrder?.table && isDetailDialogOpen,
    staleTime: 60000,
  });

  // Orden para el diálogo: con mesa enriquecida si se obtuvo por separado
  const orderForDetailDialog = useMemo(() => {
    if (!detailOrder) return null;
    if (detailOrder.table) return detailOrder;
    if (detailOrder.tableId && detailOrderTable) {
      return { ...detailOrder, table: detailOrderTable };
    }
    return detailOrder;
  }, [detailOrder, detailOrderTable]);

  // Filtrar órdenes en cliente (para búsqueda y estados especiales)
  const filteredOrders = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return filterOrdersClient(list, filters);
  }, [orders, filters]);

  // Ordenar por fecha más reciente
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredOrders]);

  // Mostrar error si la carga falla
  React.useEffect(() => {
    if (ordersError) {
      if (ordersError instanceof AppError) {
        showErrorToast('Error al cargar órdenes', ordersError.message);
      } else {
        showErrorToast('Error al cargar órdenes', 'No se pudieron obtener las órdenes');
      }
    }
  }, [ordersError]);

  // Handler para ver detalles: abrir diálogo y cargar orden completa (mesa, items, extras)
  const handleViewDetails = useCallback((orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDetailDialogOpen(true);
  }, []);

  // Handler para marcar como entregada
  const handleMarkDelivered = useCallback(async (orderId: string) => {
    setIsUpdating(true);
    try {
      await orderService.markOrderAsDelivered(orderId);
      showSuccessToast('Orden entregada', 'La orden ha sido marcada como entregada');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error', error.message);
      } else {
        showErrorToast('Error', 'No se pudo actualizar la orden');
      }
    } finally {
      setIsUpdating(false);
    }
  }, [queryClient]);

  // Handler para procesar pago: navega al POS en modo pago (solo sección de pago, info readonly)
  const handleProcessPayment = useCallback((orderId: string) => {
    navigate(`/pos?orderId=${orderId}&mode=pay`);
  }, [navigate]);

  // Handler para eliminar orden
  const handleDeleteOrder = useCallback((orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setOrderToDelete(order);
    }
  }, [orders]);

  // Imprimir ticket cliente (sale-ticket)
  const handlePrintClientTicket = useCallback(async (orderId: string) => {
    setIsPrintingTicket(true);
    try {
      await ticketService.printSaleTicket(orderId);
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al imprimir ticket', error.message);
      } else {
        showErrorToast('Error al imprimir ticket', 'No se pudo obtener el ticket de venta');
      }
    } finally {
      setIsPrintingTicket(false);
    }
  }, []);

  // Imprimir ticket cocina (kitchen-ticket)
  const handlePrintKitchenTicket = useCallback(async (orderId: string) => {
    setIsPrintingTicket(true);
    try {
      await ticketService.printKitchenTicket(orderId);
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al imprimir ticket', error.message);
      } else {
        showErrorToast('Error al imprimir ticket', 'No se pudo obtener el ticket de cocina');
      }
    } finally {
      setIsPrintingTicket(false);
    }
  }, []);

  // Confirmar eliminación
  const confirmDelete = useCallback(async () => {
    if (!orderToDelete) return;

    setIsDeleting(true);
    try {
      await orderService.deleteOrder(orderToDelete.id);
      showSuccessToast('Orden eliminada', 'La orden ha sido eliminada correctamente');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setOrderToDelete(null);
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error', error.message);
      } else {
        showErrorToast('Error', 'No se pudo eliminar la orden');
      }
    } finally {
      setIsDeleting(false);
    }
  }, [orderToDelete, queryClient]);

  // Handler para abrir pago dividido (desde card o detalle)
  const handleSplitPayment = useCallback((order: OrderResponse) => {
    setOrderForSplitPayment(order);
  }, []);

  // Éxito de pago dividido: invalidar órdenes y mesas, cerrar diálogo, toast
  const handleSplitPaymentSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['tables-for-filter'] });
    setOrderForSplitPayment(null);
    showSuccessToast('Pago dividido procesado', 'La orden ha sido pagada con dos métodos');
  }, [queryClient]);

  // Handler para ir al POS a crear nueva orden
  const handleNewOrder = useCallback(() => {
    navigate('/pos');
  }, [navigate]);

  // Contar órdenes por estado (solo pendientes y pagadas)
  const orderCounts = useMemo(() => {
    const pending = orders.filter((o) => !o.status).length;
    const paid = orders.filter((o) => o.status).length;
    return { pending, paid, total: orders.length };
  }, [orders]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-7 w-7" />
              Órdenes
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {orderCounts.total} órdenes en total • {orderCounts.pending} pendientes
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Indicador de conexión WebSocket */}
            <ConnectionIndicator
              isConnected={isConnected}
              connectionId={connectionId}
              showLabel
            />
            <Button
              variant="outline"
              onClick={() => refetchOrders()}
              disabled={isLoadingOrders}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoadingOrders ? 'animate-spin' : ''}`}
              />
              Actualizar
            </Button>
            <Button onClick={handleNewOrder}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Orden
            </Button>
          </div>
        </div>

        {/* Banner de advertencia cuando no hay conexión WebSocket */}
        {!isConnected && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <WifiOff className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Sin conexión en tiempo real
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Las notificaciones de nuevas órdenes no están disponibles. Usa el botón "Actualizar" para ver cambios.
              </p>
            </div>
          </div>
        )}

        {/* Contadores rápidos */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {orderCounts.pending}
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Pendientes</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {orderCounts.paid}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">Pagadas</p>
          </div>
        </div>

        {/* Toggle y sección de filtros (oculta por defecto) */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((prev) => !prev)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? (
              <>
                Ocultar filtros
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Mostrar filtros
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
          {showFilters && (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <OrderSearchBar
                filters={filters}
                onFiltersChange={setFilters}
                tables={tables}
                isLoadingTables={isLoadingTables}
              />
            </div>
          )}
        </div>

        {/* Grid de órdenes */}
        <OrdersGrid
          orders={sortedOrders}
          isLoading={isLoadingOrders}
          error={ordersError instanceof Error ? ordersError.message : null}
          onViewDetails={handleViewDetails}
          onMarkDelivered={handleMarkDelivered}
          onProcessPayment={handleProcessPayment}
          onSplitPayment={handleSplitPayment}
          onDelete={handleDeleteOrder}
          onPrintClientTicket={handlePrintClientTicket}
          onPrintKitchenTicket={handlePrintKitchenTicket}
        />

        {/* Diálogo de detalle (solo ver info; acciones en la card) */}
        <OrderDetailDialog
          order={orderForDetailDialog}
          open={isDetailDialogOpen}
          onClose={() => {
            setIsDetailDialogOpen(false);
            setSelectedOrderId(null);
          }}
          isLoading={isLoadingDetailOrder}
          onSplitPayment={handleSplitPayment}
          onPrintClientTicket={handlePrintClientTicket}
          onPrintKitchenTicket={handlePrintKitchenTicket}
          isPrintingTicket={isPrintingTicket}
        />

        {/* Diálogo de pago dividido (dos métodos) */}
        <SplitPaymentDialog
          order={orderForSplitPayment}
          open={!!orderForSplitPayment}
          onClose={() => setOrderForSplitPayment(null)}
          onSuccess={handleSplitPaymentSuccess}
        />

        {/* Diálogo de confirmación de eliminación */}
        <AlertDialog
          open={!!orderToDelete}
          onOpenChange={(open) => !open && setOrderToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar orden?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás a punto de eliminar la orden{' '}
                <strong className="text-slate-900 dark:text-white">
                  #{orderToDelete?.id.slice(-8).toUpperCase()}
                </strong>
                .
                <br />
                <br />
                Esta acción no se puede deshacer. Solo se pueden eliminar órdenes que no
                han sido pagadas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default OrdersPage;

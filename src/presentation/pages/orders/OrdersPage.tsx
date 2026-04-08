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
import { OrderPagination } from '@/presentation/components/orders/OrderPagination';
import { OrderDetailDialog } from '@/presentation/components/orders/OrderDetailDialog';
import { SplitPaymentDialog } from '@/presentation/components/orders/SplitPaymentDialog';
import { ConnectionIndicator } from '@/presentation/components/websocket/ConnectionIndicator';
import { useWebSocketContext } from '@/presentation/contexts/websocket.context';
import { useOrderFilters } from '@/presentation/hooks/useOrderFilters';
import { useDialogState } from '@/presentation/hooks/useDialogState';
import { orderService, tableService, ticketService } from '@/application/services';
import type { OrderResponse, PaginationData } from '@/domain/types';
import { filterOrdersClient } from '@/shared/utils/order.utils';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { usePaymentSound } from '@/presentation/hooks/usePaymentSound';
import { AppError } from '@/domain/errors';

/**
 * Página de Órdenes
 * Muestra lista de órdenes con filtros, detalles, paginación y acciones
 */
const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { playSuccess } = usePaymentSound();

  // Estado de conexión WebSocket
  const { isConnected, connectionId } = useWebSocketContext();

  // Filtros y paginación
  const {
    filters,
    showFilters,
    currentPage,
    itemsPerPage,
    apiFilters,
    needsClientSideFiltering,
    handleFiltersChange,
    handlePageChange,
    handlePageSizeChange,
    toggleFilters,
  } = useOrderFilters();

  // Estado de modales
  const detailDialog = useDialogState<string>();        // data = orderId
  const deleteDialog = useDialogState<OrderResponse>();
  const splitPaymentDialog = useDialogState<OrderResponse>();

  // Estado de operaciones
  const [_isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPrintingTicket, setIsPrintingTicket] = useState(false);

  // Query para obtener órdenes (paginación en servidor salvo búsqueda / estados solo-cliente)
  const {
    data: listPayload,
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['orders', apiFilters, currentPage, itemsPerPage, needsClientSideFiltering],
    queryFn: async () => {
      if (needsClientSideFiltering) {
        return orderService.listOrders({
          ...apiFilters,
          page: 1,
          limit: 100,
        });
      }
      return orderService.listOrders({
        ...apiFilters,
        page: currentPage,
        limit: itemsPerPage,
      });
    },
    staleTime: 10000, // 10 segundos
    retry: 1,
  });

  const ordersFromApi = listPayload?.orders ?? [];
  const serverPagination = listPayload?.pagination;
  /** Totales pendientes/pagadas en el rango y filtros de API (no dependen de la página). */
  const ordersSummary = listPayload?.summary;

  // Query para obtener mesas (para filtros)
  const { data: tables = [], isLoading: isLoadingTables } = useQuery({
    queryKey: ['tables-for-filter'],
    queryFn: async () => {
      // Todas las mesas: el listado de órdenes no trae `table` anidada; hace falta el nombre aunque la mesa esté inactiva en catálogo.
      return await tableService.listTables();
    },
    staleTime: 60000, // 1 minuto
  });

  // Orden completa para el diálogo de detalle (mesa, items, extras)
  const { data: detailOrder = null, isLoading: isLoadingDetailOrder } = useQuery({
    queryKey: ['order', detailDialog.data],
    queryFn: async () => {
      if (!detailDialog.data) return null;
      return await orderService.getOrderById(detailDialog.data);
    },
    enabled: !!detailDialog.data && detailDialog.isOpen,
    staleTime: 0,
  });

  // Si la orden tiene tableId pero el backend no devolvió table, obtener la mesa
  const { data: detailOrderTable = null } = useQuery({
    queryKey: ['table', detailOrder?.tableId],
    queryFn: async () => {
      if (!detailOrder?.tableId) return null;
      return await tableService.getTableById(detailOrder.tableId);
    },
    enabled: !!detailOrder?.tableId && !detailOrder?.table && detailDialog.isOpen,
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

  // Filtrar órdenes en cliente (búsqueda texto, entregada, completada fina)
  const filteredOrders = useMemo(() => {
    return filterOrdersClient(ordersFromApi, filters);
  }, [ordersFromApi, filters]);

  // Ordenar por fecha más reciente
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredOrders]);

  /** Lista mostrada y metadatos de paginación (servidor o cliente según filtros). */
  const { displayOrders, paginationData } = useMemo((): {
    displayOrders: typeof sortedOrders;
    paginationData: PaginationData;
  } => {
    if (needsClientSideFiltering) {
      const totalItems = sortedOrders.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
      const start = (currentPage - 1) * itemsPerPage;
      const pageSlice = sortedOrders.slice(start, start + itemsPerPage);
      return {
        displayOrders: pageSlice,
        paginationData: {
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
        },
      };
    }
    const p = serverPagination;
    if (!p) {
      return {
        displayOrders: sortedOrders,
        paginationData: {
          currentPage: 1,
          totalPages: 1,
          totalItems: sortedOrders.length,
          itemsPerPage,
        },
      };
    }
    return {
      displayOrders: sortedOrders,
      paginationData: {
        currentPage: p.page,
        totalPages: p.totalPages,
        totalItems: p.total,
        itemsPerPage: p.limit,
      },
    };
  }, [
    needsClientSideFiltering,
    sortedOrders,
    currentPage,
    itemsPerPage,
    serverPagination,
  ]);

  const tableNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of tables) {
      m.set(t.id, t.name);
    }
    return m;
  }, [tables]);

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
    detailDialog.open(orderId);
  }, [detailDialog]);

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
    const order = ordersFromApi.find((o) => o.id === orderId);
    if (order) {
      deleteDialog.open(order);
    }
  }, [ordersFromApi, deleteDialog]);

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
    if (!deleteDialog.data) return;

    setIsDeleting(true);
    try {
      await orderService.deleteOrder(deleteDialog.data.id);
      showSuccessToast('Orden eliminada', 'La orden ha sido eliminada correctamente');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      deleteDialog.close();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error', error.message);
      } else {
        showErrorToast('Error', 'No se pudo eliminar la orden');
      }
    } finally {
      setIsDeleting(false);
    }
  }, [deleteDialog.data, queryClient]);

  // Handler para abrir pago dividido (desde card o detalle)
  const handleSplitPayment = useCallback((order: OrderResponse) => {
    splitPaymentDialog.open(order);
  }, [splitPaymentDialog]);

  // Éxito de pago dividido: invalidar órdenes y mesas, cerrar diálogo, toast
  const handleSplitPaymentSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['tables-for-filter'] });
    splitPaymentDialog.close();
    playSuccess();
    showSuccessToast('Pago dividido procesado', 'La orden ha sido pagada con dos métodos');
  }, [queryClient]);

  // Handler para ir al POS a crear nueva orden
  const handleNewOrder = useCallback(() => {
    navigate('/pos');
  }, [navigate]);

  /** Cards: totales globales del backend (fecha + filtros API). El subtítulo usa el total del listado paginado. */
  const orderCounts = useMemo(() => {
    return {
      pending: ordersSummary?.totalOrdersPending ?? 0,
      paid: ordersSummary?.totalOrdersPaid ?? 0,
      totalInList: paginationData.totalItems,
    };
  }, [ordersSummary, paginationData.totalItems]);

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
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Pendientes (total)</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {orderCounts.paid}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">Pagadas (total)</p>
          </div>
        </div>

        {/* Toggle y sección de filtros (oculta por defecto) */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFilters}
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
                onFiltersChange={handleFiltersChange}
                tables={tables}
                isLoadingTables={isLoadingTables}
              />
            </div>
          )}
        </div>

        {/* Grid de órdenes con paginación */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <OrdersGrid
            orders={displayOrders}
            tableNameById={tableNameById}
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
          {!isLoadingOrders && !ordersError && paginationData.totalItems > 0 && (
            <OrderPagination
              pagination={paginationData}
              onPageChange={handlePageChange}
              pageSizeOptions={[15, 20, 25, 50, 100]}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>

        {/* Diálogo de detalle (solo ver info; acciones en la card) */}
        <OrderDetailDialog
          order={orderForDetailDialog}
          open={detailDialog.isOpen}
          onClose={detailDialog.close}
          isLoading={isLoadingDetailOrder}
          onSplitPayment={handleSplitPayment}
          onPrintClientTicket={handlePrintClientTicket}
          onPrintKitchenTicket={handlePrintKitchenTicket}
          isPrintingTicket={isPrintingTicket}
        />

        {/* Diálogo de pago dividido (dos métodos) */}
        <SplitPaymentDialog
          order={splitPaymentDialog.data}
          open={!!splitPaymentDialog.data}
          onClose={() => splitPaymentDialog.close()}
          onSuccess={handleSplitPaymentSuccess}
        />

        {/* Diálogo de confirmación de eliminación */}
        <AlertDialog
          open={!!deleteDialog.data}
          onOpenChange={(open) => !open && deleteDialog.close()}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar orden?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás a punto de eliminar la orden{' '}
                <strong className="text-slate-900 dark:text-white">
                  #{deleteDialog.data?.id.slice(-8).toUpperCase()}
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

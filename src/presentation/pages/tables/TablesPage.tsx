import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/presentation/components/ui/dialog';
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
import { TableSearchBar, type TableFilters } from '@/presentation/components/tables/TableSearchBar';
import { TablesGrid } from '@/presentation/components/tables/TablesGrid';
import { CreateTableForm } from '@/presentation/components/tables/CreateTableForm';
import { tableService } from '@/application/services';
import type { CreateTableRequest, ListTablesRequest } from '@/domain/types';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';
import { useAuthStore } from '@/presentation/store/auth.store';

/**
 * Página de Mesas
 * Responsabilidad: Orquestar los componentes de la página de mesas
 * Cumple SRP: Solo maneja el estado y la lógica de la página
 */

const TablesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [filters, setFilters] = useState<TableFilters>({
    search: '',
    status: undefined,
    availability: undefined,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingTable, setIsCreatingTable] = useState(false);

  const queryClient = useQueryClient();

  // Preparar filtros para la API
  const apiFilters = useMemo(() => {
    const apiFilters: ListTablesRequest = {};

    if (filters.status && filters.status !== 'all') {
      apiFilters.status = filters.status === 'active';
    }

    if (filters.availability && filters.availability !== 'all') {
      apiFilters.availabilityStatus = filters.availability === 'available';
    }

    return apiFilters;
  }, [filters]);

  // Query para obtener mesas de la API
  const {
    data: tables = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tables', apiFilters],
    queryFn: async () => {
      return await tableService.listTables(apiFilters);
    },
    staleTime: 30000,
    retry: 1,
  });

  // Mostrar error si la carga falla
  React.useEffect(() => {
    if (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al cargar mesas', error.message);
      } else {
        showErrorToast('Error al cargar mesas', 'No se pudieron obtener las mesas del servidor');
      }
    }
  }, [error]);

  /**
   * Filtra mesas según los filtros aplicados (filtrado en cliente como fallback)
   */
  const filteredTables = useMemo(() => {
    let result = [...tables];

    // Filtro de búsqueda (nombre de mesa)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter((table) =>
        table.name.toLowerCase().includes(searchTerm) ||
        `mesa ${table.name}`.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro de estado
    if (filters.status && filters.status !== 'all') {
      const isActive = filters.status === 'active';
      result = result.filter((table) => table.status === isActive);
    }

    // Filtro de disponibilidad
    if (filters.availability && filters.availability !== 'all') {
      const isAvailable = filters.availability === 'available';
      result = result.filter((table) => table.availabilityStatus === isAvailable);
    }

    return result;
  }, [tables, filters]);

  /**
   * Handler para cambios en filtros
   */
  const handleFiltersChange = (newFilters: TableFilters) => {
    setFilters(newFilters);
  };

  const [tableToDelete, setTableToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handler para acciones de mesa (editar, eliminar, toggle estado, toggle disponibilidad)
   */
  const handleTableAction = (
    tableId: string,
    action: 'edit' | 'delete' | 'toggle-status' | 'toggle-availability'
  ) => {
    switch (action) {
      case 'edit':
        window.location.href = `/tables/${tableId}`;
        break;
      case 'delete':
        const table = tables.find((t) => t.id === tableId);
        if (table) {
          setTableToDelete({ id: tableId, name: table.name });
          setIsDeleteDialogOpen(true);
        }
        break;
      case 'toggle-status':
        handleToggleStatus(tableId);
        break;
      case 'toggle-availability':
        handleToggleAvailability(tableId);
        break;
    }
  };

  /**
   * Handler para cambiar estado de la mesa
   */
  const handleToggleStatus = async (tableId: string) => {
    try {
      const table = tables.find((t) => t.id === tableId);
      if (!table) return;

      await tableService.updateTable(tableId, {
        status: !table.status,
      });

      showSuccessToast(
        'Estado actualizado',
        `La mesa ha sido ${!table.status ? 'activada' : 'desactivada'} exitosamente`
      );
      await queryClient.invalidateQueries({ queryKey: ['tables'] });
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al actualizar estado', error.message);
      } else {
        showErrorToast('Error al actualizar estado', 'Ocurrió un error inesperado');
      }
    }
  };

  /**
   * Handler para cambiar disponibilidad de la mesa
   */
  const handleToggleAvailability = async (tableId: string) => {
    try {
      const table = tables.find((t) => t.id === tableId);
      if (!table) return;

      if (table.availabilityStatus) {
        await tableService.markAsOccupied(tableId);
        showSuccessToast('Disponibilidad actualizada', 'La mesa ha sido marcada como ocupada');
      } else {
        await tableService.markAsFree(tableId);
        showSuccessToast('Disponibilidad actualizada', 'La mesa ha sido marcada como libre');
      }

      await queryClient.invalidateQueries({ queryKey: ['tables'] });
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al actualizar disponibilidad', error.message);
      } else {
        showErrorToast('Error al actualizar disponibilidad', 'Ocurrió un error inesperado');
      }
    }
  };

  /**
   * Handler para confirmar eliminación
   */
  const handleConfirmDelete = async () => {
    if (!tableToDelete) return;

    setIsDeleting(true);
    try {
      await tableService.deleteTable(tableToDelete.id);
      showSuccessToast(
        'Mesa eliminada',
        `La mesa "${tableToDelete.name}" ha sido eliminada exitosamente`
      );
      await queryClient.invalidateQueries({ queryKey: ['tables'] });
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al eliminar mesa', error.message);
      } else {
        showErrorToast('Error al eliminar mesa', 'Ocurrió un error inesperado');
      }
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setTableToDelete(null);
    }
  };

  /**
   * Handler para abrir modal de creación
   */
  const handleNewTable = () => {
    setIsCreateModalOpen(true);
  };

  /**
   * Handler para cerrar modal de creación
   */
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  /**
   * Handler para crear mesa
   */
  const handleCreateTable = async (tableData: CreateTableRequest) => {
    setIsCreatingTable(true);
    try {
      await tableService.createTable(tableData);
      setIsCreateModalOpen(false);
      showSuccessToast('Mesa creada exitosamente', 'La nueva mesa ha sido agregada al sistema');
      await queryClient.invalidateQueries({ queryKey: ['tables'] });
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al crear mesa', error.message);
      } else {
        showErrorToast('Error al crear mesa', 'Ocurrió un error inesperado');
      }
      throw error;
    } finally {
      setIsCreatingTable(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-wrap justify-between items-center gap-4 px-4 py-2">
        <h1 className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">
          Mapa de Mesas
        </h1>
        <Button
          onClick={handleNewTable}
          className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="truncate">Nueva Mesa</span>
        </Button>
      </div>

      <TableSearchBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <TablesGrid
        tables={filteredTables}
        isLoading={isLoading}
        onTableAction={handleTableAction}
      />

      {/* Modal de Creación de Mesa */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="!max-w-[500px] w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogClose />
          <DialogHeader>
            <DialogTitle>Crear Nueva Mesa</DialogTitle>
          </DialogHeader>
          <CreateTableForm
            onSubmit={handleCreateTable}
            onCancel={handleCloseCreateModal}
            isLoading={isCreatingTable}
            userId={user?.id || ''}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmación de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar mesa?</AlertDialogTitle>
            <AlertDialogDescription>
              {tableToDelete && (
                <>
                  Estás a punto de eliminar la mesa <strong className="text-slate-900 dark:text-white">{tableToDelete.name}</strong>.
                  <br />
                  <br />
                  Esta acción no se puede deshacer. Si la mesa tiene órdenes activas asociadas, no podrá ser eliminada.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default TablesPage;

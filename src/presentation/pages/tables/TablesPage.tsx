import React, { useState, useCallback } from 'react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { PageHeader } from '@/presentation/components/ui/PageHeader';
import { Button } from '@/presentation/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/presentation/components/ui/dialog';
import { ConfirmDialog } from '@/presentation/components/ui/confirm-dialog';
import { TableSearchBar, type TableFilters } from '@/presentation/components/tables/TableSearchBar';
import { TablesGrid } from '@/presentation/components/tables/TablesGrid';
import { CreateTableForm } from '@/presentation/components/tables/CreateTableForm';
import { useCrudList } from '@/presentation/hooks/useCrudList';
import { tableService } from '@/application/services';
import type { CreateTableRequest, ListTablesRequest, TableResponse } from '@/domain/types';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';
import { useAuthStore } from '@/presentation/store/auth.store';

const filterAdapter = (filters: TableFilters): ListTablesRequest => {
  const api: ListTablesRequest = {};
  if (filters.status && filters.status !== 'all') api.status = filters.status === 'active';
  if (filters.availability && filters.availability !== 'all') api.availabilityStatus = filters.availability === 'available';
  return api;
};

const clientFilter = (data: TableResponse[], filters: TableFilters) => {
  let result = data;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((t) => t.name.toLowerCase().includes(q) || `ubicación ${t.name}`.toLowerCase().includes(q));
  }
  if (filters.status && filters.status !== 'all') {
    const isActive = filters.status === 'active';
    result = result.filter((t) => t.status === isActive);
  }
  if (filters.availability && filters.availability !== 'all') {
    const isAvailable = filters.availability === 'available';
    result = result.filter((t) => t.availabilityStatus === isAvailable);
  }
  return result;
};

const TablesPage: React.FC = () => {
  const { user } = useAuthStore();

  const {
    rawData: tables,
    filteredData: filteredTables,
    isLoading,
    error,
    refetch,
    filters,
    setFilters,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isCreating,
    setIsCreating,
    deleteDialog,
    invalidate,
  } = useCrudList<TableResponse, TableFilters, ListTablesRequest>({
    queryKey: 'tables',
    queryFn: (apiFilters) => tableService.listTables(apiFilters),
    initialFilters: { search: '', status: undefined, availability: undefined },
    filterAdapter,
    clientFilter,
    paginated: false,
  });

  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    if (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al cargar mesas', error.message);
      } else {
        showErrorToast('Error al cargar mesas', 'No se pudieron obtener las mesas del servidor');
      }
    }
  }, [error]);

  const handleToggleStatus = useCallback(async (tableId: string) => {
    try {
      const table = tables.find((t) => t.id === tableId);
      if (!table) return;
      await tableService.updateTable(tableId, { status: !table.status });
      showSuccessToast('Estado actualizado', `La ubicación ha sido ${!table.status ? 'activada' : 'desactivada'} exitosamente`);
      invalidate();
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al actualizar estado', error.message);
      } else {
        showErrorToast('Error al actualizar estado', 'Ocurrió un error inesperado');
      }
    }
  }, [tables, invalidate, refetch]);

  const handleToggleAvailability = useCallback(async (tableId: string) => {
    try {
      const table = tables.find((t) => t.id === tableId);
      if (!table) return;
      if (table.availabilityStatus) {
        await tableService.markAsOccupied(tableId);
        showSuccessToast('Disponibilidad actualizada', 'La ubicación ha sido marcada como ocupada');
      } else {
        await tableService.markAsFree(tableId);
        showSuccessToast('Disponibilidad actualizada', 'La ubicación ha sido marcada como libre');
      }
      invalidate();
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al actualizar disponibilidad', error.message);
      } else {
        showErrorToast('Error al actualizar disponibilidad', 'Ocurrió un error inesperado');
      }
    }
  }, [tables, invalidate, refetch]);

  const handleTableAction = useCallback((tableId: string, action: 'edit' | 'delete' | 'toggle-status' | 'toggle-availability') => {
    switch (action) {
      case 'edit':
        window.location.href = `/tables/${tableId}`;
        break;
      case 'delete': {
        const table = tables.find((t) => t.id === tableId);
        if (table) deleteDialog.open(table);
        break;
      }
      case 'toggle-status':
        handleToggleStatus(tableId);
        break;
      case 'toggle-availability':
        handleToggleAvailability(tableId);
        break;
    }
  }, [tables, deleteDialog, handleToggleStatus, handleToggleAvailability]);

  const handleConfirmDelete = async () => {
    if (!deleteDialog.data) return;
    setIsDeleting(true);
    try {
      await tableService.deleteTable(deleteDialog.data.id);
      showSuccessToast('Ubicación eliminada', `La ubicación "${deleteDialog.data.name}" ha sido eliminada exitosamente`);
      invalidate();
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al eliminar ubicación', error.message);
      } else {
        showErrorToast('Error al eliminar ubicación', 'Ocurrió un error inesperado');
      }
    } finally {
      setIsDeleting(false);
      deleteDialog.close();
    }
  };

  const handleCreateTable = async (tableData: CreateTableRequest) => {
    setIsCreating(true);
    try {
      await tableService.createTable(tableData);
      setIsCreateModalOpen(false);
      showSuccessToast('Ubicación creada exitosamente', 'La nueva ubicación ha sido agregada al sistema');
      invalidate();
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al crear ubicación', error.message);
      } else {
        showErrorToast('Error al crear ubicación', 'Ocurrió un error inesperado');
      }
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <MainLayout>
      <PageHeader title="Mapa de Mesas" />

      <TableSearchBar
        filters={filters}
        onFiltersChange={setFilters}
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)} className="rounded-lg h-11 px-6 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors">
            Nueva Mesa
          </Button>
        }
      />
      <TablesGrid tables={filteredTables} isLoading={isLoading} onTableAction={handleTableAction} />

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="!max-w-[500px] w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogClose />
          <DialogHeader><DialogTitle>Crear Nueva Ubicación</DialogTitle></DialogHeader>
          <CreateTableForm onSubmit={handleCreateTable} onCancel={() => setIsCreateModalOpen(false)} isLoading={isCreating} userId={user?.id || ''} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        title="¿Eliminar ubicación?"
        description={deleteDialog.data && (<>Estás a punto de eliminar la ubicación <strong className="text-foreground">{deleteDialog.data.name}</strong>.<br /><br />Esta acción no se puede deshacer. Si la ubicación tiene órdenes activas, no podrá ser eliminada.</>)}
        confirmLabel="Eliminar"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </MainLayout>
  );
};

export default TablesPage;

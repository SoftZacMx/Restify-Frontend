import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
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
    result = result.filter((t) => t.name.toLowerCase().includes(q) || `mesa ${t.name}`.toLowerCase().includes(q));
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
  }, [tables, deleteDialog]);

  const handleToggleStatus = async (tableId: string) => {
    try {
      const table = tables.find((t) => t.id === tableId);
      if (!table) return;
      await tableService.updateTable(tableId, { status: !table.status });
      showSuccessToast('Estado actualizado', `La mesa ha sido ${!table.status ? 'activada' : 'desactivada'} exitosamente`);
      invalidate();
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al actualizar estado', error.message);
      } else {
        showErrorToast('Error al actualizar estado', 'Ocurrió un error inesperado');
      }
    }
  };

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
      invalidate();
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al actualizar disponibilidad', error.message);
      } else {
        showErrorToast('Error al actualizar disponibilidad', 'Ocurrió un error inesperado');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.data) return;
    setIsDeleting(true);
    try {
      await tableService.deleteTable(deleteDialog.data.id);
      showSuccessToast('Mesa eliminada', `La mesa "${deleteDialog.data.name}" ha sido eliminada exitosamente`);
      invalidate();
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al eliminar mesa', error.message);
      } else {
        showErrorToast('Error al eliminar mesa', 'Ocurrió un error inesperado');
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
      showSuccessToast('Mesa creada exitosamente', 'La nueva mesa ha sido agregada al sistema');
      invalidate();
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al crear mesa', error.message);
      } else {
        showErrorToast('Error al crear mesa', 'Ocurrió un error inesperado');
      }
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-wrap justify-between items-center gap-4 px-4 py-2">
        <h1 className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">Mapa de Mesas</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          <span className="truncate">Nueva Mesa</span>
        </Button>
      </div>

      <TableSearchBar filters={filters} onFiltersChange={setFilters} />
      <TablesGrid tables={filteredTables} isLoading={isLoading} onTableAction={handleTableAction} />

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="!max-w-[500px] w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogClose />
          <DialogHeader><DialogTitle>Crear Nueva Mesa</DialogTitle></DialogHeader>
          <CreateTableForm onSubmit={handleCreateTable} onCancel={() => setIsCreateModalOpen(false)} isLoading={isCreating} userId={user?.id || ''} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        title="¿Eliminar mesa?"
        description={deleteDialog.data && (<>Estás a punto de eliminar la mesa <strong className="text-slate-900 dark:text-white">{deleteDialog.data.name}</strong>.<br /><br />Esta acción no se puede deshacer. Si la mesa tiene órdenes activas, no podrá ser eliminada.</>)}
        confirmLabel="Eliminar"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </MainLayout>
  );
};

export default TablesPage;

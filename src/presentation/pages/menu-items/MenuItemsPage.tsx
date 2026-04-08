import React, { useState, useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/presentation/components/ui/dialog';
import { ConfirmDialog } from '@/presentation/components/ui/confirm-dialog';
import { MenuItemSearchBar } from '@/presentation/components/menu-items/MenuItemSearchBar';
import { MenuItemTable } from '@/presentation/components/menu-items/MenuItemTable';
import { Pagination } from '@/presentation/components/ui/pagination';
import { CreateMenuItemForm } from '@/presentation/components/menu-items/CreateMenuItemForm';
import { useCrudList } from '@/presentation/hooks/useCrudList';
import { menuItemService } from '@/application/services';
import { useAuthStore } from '@/presentation/store/auth.store';
import type { MenuItemTableFilters, CreateMenuItemRequest, MenuItemResponse } from '@/domain/types';
import { formatMenuItemsForTable } from '@/shared/utils/menu-item.utils';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

const filterAdapter = (filters: MenuItemTableFilters) => {
  const api: { status?: boolean; search?: string; categoryId?: string } = {};
  if (filters.status && filters.status !== 'all') api.status = filters.status === 'active';
  if (filters.search) api.search = filters.search;
  if (filters.categoryId) api.categoryId = filters.categoryId;
  return api;
};

const clientFilter = (data: MenuItemResponse[], filters: MenuItemTableFilters) => {
  let result = data;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((m) => m.name.toLowerCase().includes(q));
  }
  if (filters.status && filters.status !== 'all') {
    const isActive = filters.status === 'active';
    result = result.filter((m) => m.status === isActive);
  }
  return result;
};

const MenuItemsPage: React.FC = () => {
  const { user } = useAuthStore();

  const {
    rawData: menuItems,
    paginatedData,
    isLoading,
    error,
    refetch,
    filters,
    setFilters,
    paginationData,
    pageSizeOptions,
    handlePageChange,
    handlePageSizeChange,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isCreating,
    setIsCreating,
    deleteDialog,
    invalidate,
  } = useCrudList<MenuItemResponse, MenuItemTableFilters>({
    queryKey: 'menuItems',
    queryFn: (apiFilters) => menuItemService.listMenuItems(apiFilters),
    initialFilters: { search: '', status: undefined },
    filterAdapter,
    clientFilter,
  });

  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    if (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al cargar platillos', error.message);
      } else {
        showErrorToast('Error al cargar platillos', 'No se pudieron obtener los platillos del servidor');
      }
    }
  }, [error]);

  const tableMenuItems = useMemo(() => formatMenuItemsForTable(paginatedData), [paginatedData]);

  const handleMenuItemAction = useCallback((menuItemId: string, action: 'edit' | 'delete' | 'toggle-status') => {
    switch (action) {
      case 'edit':
        window.location.href = `/menu/items/${menuItemId}`;
        break;
      case 'delete': {
        const item = menuItems.find((m) => m.id === menuItemId);
        if (item) deleteDialog.open(item);
        break;
      }
      case 'toggle-status':
        handleToggleStatus(menuItemId);
        break;
    }
  }, [menuItems, deleteDialog]);

  const handleToggleStatus = async (menuItemId: string) => {
    try {
      const item = menuItems.find((m) => m.id === menuItemId);
      if (!item) return;
      await menuItemService.updateMenuItem(menuItemId, { status: !item.status });
      showSuccessToast('Estado actualizado', `El platillo ha sido ${!item.status ? 'activado' : 'desactivado'} exitosamente`);
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

  const handleConfirmDelete = async () => {
    if (!deleteDialog.data) return;
    setIsDeleting(true);
    try {
      await menuItemService.deleteMenuItem(deleteDialog.data.id);
      showSuccessToast('Platillo eliminado', `El platillo "${deleteDialog.data.name}" ha sido eliminado exitosamente`);
      invalidate();
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al eliminar platillo', error.message);
      } else {
        showErrorToast('Error al eliminar platillo', 'Ocurrió un error inesperado');
      }
    } finally {
      setIsDeleting(false);
      deleteDialog.close();
    }
  };

  const handleCreateMenuItem = async (data: CreateMenuItemRequest) => {
    if (!user?.id) { showErrorToast('Error', 'No se pudo obtener el usuario autenticado'); return; }
    setIsCreating(true);
    try {
      await menuItemService.createMenuItem({ ...data, userId: user.id });
      setIsCreateModalOpen(false);
      showSuccessToast('Platillo creado exitosamente', 'El nuevo platillo ha sido agregado al sistema');
      invalidate();
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al crear platillo', error.message);
      } else {
        showErrorToast('Error al crear platillo', 'Ocurrió un error inesperado');
      }
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-wrap justify-between items-center gap-4 px-4 py-2">
        <h1 className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">Platillos</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          <span className="truncate">Nuevo Platillo</span>
        </Button>
      </div>

      <MenuItemSearchBar filters={filters} onFiltersChange={setFilters} />
      <MenuItemTable menuItems={tableMenuItems} isLoading={isLoading} onMenuItemAction={handleMenuItemAction} />

      {paginationData.totalItems > 0 && (
        <Pagination
          currentPage={paginationData.currentPage} totalPages={paginationData.totalPages}
          totalItems={paginationData.totalItems} itemsPerPage={paginationData.itemsPerPage}
          itemsLabel="platillos" pageSizeOptions={pageSizeOptions}
          onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange}
        />
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="!max-w-[40vw] w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogClose />
          <DialogHeader><DialogTitle>Crear Nuevo Platillo</DialogTitle></DialogHeader>
          <CreateMenuItemForm onSubmit={handleCreateMenuItem} onCancel={() => setIsCreateModalOpen(false)} isLoading={isCreating} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        title="¿Eliminar platillo?"
        description={deleteDialog.data && (<>Estás a punto de eliminar el platillo <strong className="text-slate-900 dark:text-white">{deleteDialog.data.name}</strong>.<br /><br />Esta acción no se puede deshacer.</>)}
        confirmLabel="Eliminar"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </MainLayout>
  );
};

export default MenuItemsPage;

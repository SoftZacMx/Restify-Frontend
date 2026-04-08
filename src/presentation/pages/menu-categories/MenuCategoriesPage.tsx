import React, { useState, useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/presentation/components/ui/dialog';
import { ConfirmDialog } from '@/presentation/components/ui/confirm-dialog';
import { MenuCategorySearchBar } from '@/presentation/components/menu-categories/MenuCategorySearchBar';
import { MenuCategoryTable } from '@/presentation/components/menu-categories/MenuCategoryTable';
import { Pagination } from '@/presentation/components/ui/pagination';
import { CreateMenuCategoryForm } from '@/presentation/components/menu-categories/CreateMenuCategoryForm';
import { useCrudList } from '@/presentation/hooks/useCrudList';
import { menuCategoryService } from '@/application/services';
import type { MenuCategoryTableFilters, CreateMenuCategoryRequest, MenuCategoryResponse } from '@/domain/types';
import { formatCategoriesForTable } from '@/shared/utils/menu-category.utils';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

const filterAdapter = (filters: MenuCategoryTableFilters) => {
  const api: { status?: boolean; search?: string } = {};
  if (filters.status && filters.status !== 'all') api.status = filters.status === 'active';
  if (filters.search) api.search = filters.search;
  return api;
};

const clientFilter = (data: MenuCategoryResponse[], filters: MenuCategoryTableFilters) => {
  let result = data;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((c) => c.name.toLowerCase().includes(q));
  }
  if (filters.status && filters.status !== 'all') {
    const isActive = filters.status === 'active';
    result = result.filter((c) => c.status === isActive);
  }
  return result;
};

const MenuCategoriesPage: React.FC = () => {
  const {
    rawData: categories,
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
  } = useCrudList<MenuCategoryResponse, MenuCategoryTableFilters>({
    queryKey: 'menuCategories',
    queryFn: (apiFilters) => menuCategoryService.listMenuCategories(apiFilters),
    initialFilters: { search: '', status: undefined },
    filterAdapter,
    clientFilter,
  });

  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    if (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al cargar categorías', error.message);
      } else {
        showErrorToast('Error al cargar categorías', 'No se pudieron obtener las categorías del servidor');
      }
    }
  }, [error]);

  const tableCategories = useMemo(() => formatCategoriesForTable(paginatedData), [paginatedData]);

  const handleCategoryAction = useCallback((categoryId: string, action: 'edit' | 'delete' | 'toggle-status') => {
    switch (action) {
      case 'edit':
        window.location.href = `/menu/categories/${categoryId}`;
        break;
      case 'delete': {
        const cat = categories.find((c) => c.id === categoryId);
        if (cat) deleteDialog.open(cat);
        break;
      }
      case 'toggle-status':
        handleToggleStatus(categoryId);
        break;
    }
  }, [categories, deleteDialog]);

  const handleToggleStatus = async (categoryId: string) => {
    try {
      const cat = categories.find((c) => c.id === categoryId);
      if (!cat) return;
      await menuCategoryService.updateMenuCategory(categoryId, { status: !cat.status });
      showSuccessToast('Estado actualizado', `La categoría ha sido ${!cat.status ? 'activada' : 'desactivada'} exitosamente`);
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
      await menuCategoryService.deleteMenuCategory(deleteDialog.data.id);
      showSuccessToast('Categoría eliminada', `La categoría "${deleteDialog.data.name}" ha sido eliminada exitosamente`);
      invalidate();
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al eliminar categoría', error.message);
      } else {
        showErrorToast('Error al eliminar categoría', 'Ocurrió un error inesperado');
      }
    } finally {
      setIsDeleting(false);
      deleteDialog.close();
    }
  };

  const handleCreateCategory = async (data: CreateMenuCategoryRequest) => {
    setIsCreating(true);
    try {
      await menuCategoryService.createMenuCategory(data);
      setIsCreateModalOpen(false);
      showSuccessToast('Categoría creada exitosamente', 'La nueva categoría ha sido agregada al sistema');
      invalidate();
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al crear categoría', error.message);
      } else {
        showErrorToast('Error al crear categoría', 'Ocurrió un error inesperado');
      }
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-wrap justify-between items-center gap-4 px-4 py-2">
        <h1 className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">Categorías</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          <span className="truncate">Nueva Categoría</span>
        </Button>
      </div>

      <MenuCategorySearchBar filters={filters} onFiltersChange={setFilters} />
      <MenuCategoryTable categories={tableCategories} isLoading={isLoading} onCategoryAction={handleCategoryAction} />

      {paginationData.totalItems > 0 && (
        <Pagination
          currentPage={paginationData.currentPage} totalPages={paginationData.totalPages}
          totalItems={paginationData.totalItems} itemsPerPage={paginationData.itemsPerPage}
          itemsLabel="categorías" pageSizeOptions={pageSizeOptions}
          onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange}
        />
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="!max-w-[500px] w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogClose />
          <DialogHeader><DialogTitle>Crear Nueva Categoría</DialogTitle></DialogHeader>
          <CreateMenuCategoryForm onSubmit={handleCreateCategory} onCancel={() => setIsCreateModalOpen(false)} isLoading={isCreating} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        title="¿Eliminar categoría?"
        description={deleteDialog.data && (<>Estás a punto de eliminar la categoría <strong className="text-slate-900 dark:text-white">{deleteDialog.data.name}</strong>.<br /><br />Esta acción no se puede deshacer. Si hay platillos asociados, quedarán sin categoría.</>)}
        confirmLabel="Eliminar"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </MainLayout>
  );
};

export default MenuCategoriesPage;

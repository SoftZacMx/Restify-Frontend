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
import { MenuCategorySearchBar } from '@/presentation/components/menu-categories/MenuCategorySearchBar';
import { MenuCategoryTable } from '@/presentation/components/menu-categories/MenuCategoryTable';
import { MenuCategoryPagination } from '@/presentation/components/menu-categories/MenuCategoryPagination';
import { CreateMenuCategoryForm } from '@/presentation/components/menu-categories/CreateMenuCategoryForm';
import { menuCategoryService } from '@/application/services';
import type { MenuCategoryTableFilters, PaginationData, CreateMenuCategoryRequest } from '@/domain/types';
import { formatCategoriesForTable } from '@/shared/utils/menu-category.utils';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

/**
 * Página de Categorías de Menú
 * Responsabilidad: Orquestar los componentes de la página de categorías
 * Cumple SRP: Solo maneja el estado y la lógica de la página
 */

const ITEMS_PER_PAGE = 10;

const MenuCategoriesPage: React.FC = () => {
  const [filters, setFilters] = useState<MenuCategoryTableFilters>({
    search: '',
    status: undefined,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const queryClient = useQueryClient();

  // Preparar filtros para la API
  const apiFilters = useMemo(() => {
    const apiFilters: {
      status?: boolean;
      search?: string;
    } = {};

    if (filters.status && filters.status !== 'all') {
      apiFilters.status = filters.status === 'active';
    }

    if (filters.search) {
      apiFilters.search = filters.search;
    }

    return apiFilters;
  }, [filters]);

  // Query para obtener categorías de la API
  const {
    data: categories = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['menuCategories', apiFilters],
    queryFn: async () => {
      return await menuCategoryService.listMenuCategories(apiFilters);
    },
    staleTime: 30000,
    retry: 1,
  });

  // Mostrar error si la carga falla
  React.useEffect(() => {
    if (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al cargar categorías', error.message);
      } else {
        showErrorToast('Error al cargar categorías', 'No se pudieron obtener las categorías del servidor');
      }
    }
  }, [error]);

  /**
   * Filtra categorías según los filtros aplicados (filtrado en cliente como fallback)
   */
  const filteredCategories = useMemo(() => {
    let result = [...categories];

    // Filtro de búsqueda (nombre)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((category) =>
        category.name.toLowerCase().includes(searchLower)
      );
    }

    // Filtro de estado
    if (filters.status && filters.status !== 'all') {
      const isActive = filters.status === 'active';
      result = result.filter((category) => category.status === isActive);
    }

    return result;
  }, [categories, filters]);

  /**
   * Calcula datos de paginación
   */
  const paginationData: PaginationData = useMemo(() => {
    const totalItems = filteredCategories.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return {
      currentPage,
      totalPages: totalPages || 1,
      totalItems,
      itemsPerPage: ITEMS_PER_PAGE,
    };
  }, [filteredCategories.length, currentPage]);

  /**
   * Obtiene categorías para la página actual
   */
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCategories.slice(startIndex, endIndex);
  }, [filteredCategories, currentPage]);

  /**
   * Convierte categorías a formato de tabla
   */
  const tableCategories = useMemo(() => {
    return formatCategoriesForTable(paginatedCategories);
  }, [paginatedCategories]);

  /**
   * Handler para cambios en filtros
   */
  const handleFiltersChange = (newFilters: MenuCategoryTableFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  /**
   * Handler para cambio de página
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handler para acciones de categoría (editar, eliminar, toggle estado)
   */
  const handleCategoryAction = (
    categoryId: string,
    action: 'edit' | 'delete' | 'toggle-status'
  ) => {
    switch (action) {
      case 'edit':
        window.location.href = `/menu/categories/${categoryId}`;
        break;
      case 'delete':
        const category = categories.find((c) => c.id === categoryId);
        if (category) {
          setCategoryToDelete({ id: categoryId, name: category.name });
          setIsDeleteDialogOpen(true);
        }
        break;
      case 'toggle-status':
        handleToggleStatus(categoryId);
        break;
    }
  };

  /**
   * Handler para cambiar estado de la categoría
   */
  const handleToggleStatus = async (categoryId: string) => {
    try {
      const category = categories.find((c) => c.id === categoryId);
      if (!category) return;

      await menuCategoryService.updateMenuCategory(categoryId, {
        status: !category.status,
      });

      showSuccessToast(
        'Estado actualizado',
        `La categoría ha sido ${!category.status ? 'activada' : 'desactivada'} exitosamente`
      );
      await queryClient.invalidateQueries({ queryKey: ['menuCategories'] });
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
   * Handler para confirmar eliminación
   */
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      await menuCategoryService.deleteMenuCategory(categoryToDelete.id);
      showSuccessToast(
        'Categoría eliminada',
        `La categoría "${categoryToDelete.name}" ha sido eliminada exitosamente`
      );
      await queryClient.invalidateQueries({ queryKey: ['menuCategories'] });
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al eliminar categoría', error.message);
      } else {
        showErrorToast('Error al eliminar categoría', 'Ocurrió un error inesperado');
      }
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  /**
   * Handler para abrir modal de creación
   */
  const handleNewCategory = () => {
    setIsCreateModalOpen(true);
  };

  /**
   * Handler para cerrar modal de creación
   */
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  /**
   * Handler para crear categoría
   */
  const handleCreateCategory = async (categoryData: CreateMenuCategoryRequest) => {
    setIsCreatingCategory(true);
    try {
      await menuCategoryService.createMenuCategory(categoryData);
      setIsCreateModalOpen(false);
      showSuccessToast('Categoría creada exitosamente', 'La nueva categoría ha sido agregada al sistema');
      await queryClient.invalidateQueries({ queryKey: ['menuCategories'] });
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al crear categoría', error.message);
      } else {
        showErrorToast('Error al crear categoría', 'Ocurrió un error inesperado');
      }
      throw error;
    } finally {
      setIsCreatingCategory(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-wrap justify-between items-center gap-4 px-4 py-2">
        <h1 className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">
          Categorías
        </h1>
        <Button
          onClick={handleNewCategory}
          className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="truncate">Nueva Categoría</span>
        </Button>
      </div>

      <MenuCategorySearchBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <MenuCategoryTable
        categories={tableCategories}
        isLoading={isLoading}
        onCategoryAction={handleCategoryAction}
      />

      {paginationData.totalItems > 0 && (
        <MenuCategoryPagination
          pagination={paginationData}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modal de Creación de Categoría */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="!max-w-[500px] w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogClose />
          <DialogHeader>
            <DialogTitle>Crear Nueva Categoría</DialogTitle>
          </DialogHeader>
          <CreateMenuCategoryForm
            onSubmit={handleCreateCategory}
            onCancel={handleCloseCreateModal}
            isLoading={isCreatingCategory}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmación de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete && (
                <>
                  Estás a punto de eliminar la categoría <strong className="text-slate-900 dark:text-white">{categoryToDelete.name}</strong>.
                  <br />
                  <br />
                  Esta acción no se puede deshacer. Si hay platillos asociados a esta categoría, quedarán sin categoría.
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

export default MenuCategoriesPage;

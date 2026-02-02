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
import { MenuItemSearchBar } from '@/presentation/components/menu-items/MenuItemSearchBar';
import { MenuItemTable } from '@/presentation/components/menu-items/MenuItemTable';
import { MenuItemPagination } from '@/presentation/components/menu-items/MenuItemPagination';
import { CreateMenuItemForm } from '@/presentation/components/menu-items/CreateMenuItemForm';
import { menuItemService } from '@/application/services';
import { useAuthStore } from '@/presentation/store/auth.store';
import type { MenuItemTableFilters, PaginationData, CreateMenuItemRequest } from '@/domain/types';
import { formatMenuItemsForTable } from '@/shared/utils/menu-item.utils';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

/**
 * Página de Platillos (MenuItems)
 * Responsabilidad: Orquestar los componentes de la página de platillos
 * Cumple SRP: Solo maneja el estado y la lógica de la página
 */

const ITEMS_PER_PAGE = 10;

const MenuItemsPage: React.FC = () => {
  const [filters, setFilters] = useState<MenuItemTableFilters>({
    search: '',
    status: undefined,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingMenuItem, setIsCreatingMenuItem] = useState(false);
  const { user } = useAuthStore();

  const queryClient = useQueryClient();

  // Preparar filtros para la API
  const apiFilters = useMemo(() => {
    const apiFilters: {
      status?: boolean;
      search?: string;
      categoryId?: string;
    } = {};

    if (filters.status && filters.status !== 'all') {
      apiFilters.status = filters.status === 'active';
    }

    if (filters.search) {
      apiFilters.search = filters.search;
    }

    if (filters.categoryId) {
      apiFilters.categoryId = filters.categoryId;
    }

    return apiFilters;
  }, [filters]);

  // Query para obtener platillos de la API
  const {
    data: menuItems = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['menuItems', apiFilters],
    queryFn: async () => {
      return await menuItemService.listMenuItems(apiFilters);
    },
    staleTime: 30000, // Los datos se consideran frescos por 30 segundos
    retry: 1, // Reintentar una vez si falla
  });

  // Mostrar error si la carga falla
  React.useEffect(() => {
    if (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al cargar platillos', error.message);
      } else {
        showErrorToast('Error al cargar platillos', 'No se pudieron obtener los platillos del servidor');
      }
    }
  }, [error]);

  /**
   * Filtra platillos según los filtros aplicados (filtrado en cliente como fallback)
   */
  const filteredMenuItems = useMemo(() => {
    let result = [...menuItems];

    // Filtro de búsqueda (nombre)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((menuItem) =>
        menuItem.name.toLowerCase().includes(searchLower)
      );
    }

    // Filtro de estado
    if (filters.status && filters.status !== 'all') {
      const isActive = filters.status === 'active';
      result = result.filter((menuItem) => menuItem.status === isActive);
    }

    return result;
  }, [menuItems, filters]);

  /**
   * Calcula datos de paginación
   */
  const paginationData: PaginationData = useMemo(() => {
    const totalItems = filteredMenuItems.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return {
      currentPage,
      totalPages: totalPages || 1,
      totalItems,
      itemsPerPage: ITEMS_PER_PAGE,
    };
  }, [filteredMenuItems.length, currentPage]);

  /**
   * Obtiene platillos para la página actual
   */
  const paginatedMenuItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredMenuItems.slice(startIndex, endIndex);
  }, [filteredMenuItems, currentPage]);

  /**
   * Convierte platillos a formato de tabla
   */
  const tableMenuItems = useMemo(() => {
    return formatMenuItemsForTable(paginatedMenuItems);
  }, [paginatedMenuItems]);

  /**
   * Handler para cambios en filtros
   */
  const handleFiltersChange = (newFilters: MenuItemTableFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Resetear a primera página al cambiar filtros
  };

  /**
   * Handler para cambio de página
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll al inicio de la tabla
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [menuItemToDelete, setMenuItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handler para acciones de platillo (editar, eliminar, toggle estado)
   */
  const handleMenuItemAction = (
    menuItemId: string,
    action: 'edit' | 'delete' | 'toggle-status'
  ) => {
    switch (action) {
      case 'edit':
        // La edición se maneja en MenuItemDetailPage
        window.location.href = `/menu/items/${menuItemId}`;
        break;
      case 'delete':
        // Buscar el platillo en la lista para obtener su nombre
        const menuItem = menuItems.find((m) => m.id === menuItemId);
        if (menuItem) {
          setMenuItemToDelete({ id: menuItemId, name: menuItem.name });
          setIsDeleteDialogOpen(true);
        }
        break;
      case 'toggle-status':
        // Cambiar estado del platillo
        handleToggleStatus(menuItemId);
        break;
    }
  };

  /**
   * Handler para cambiar estado del platillo
   */
  const handleToggleStatus = async (menuItemId: string) => {
    try {
      const menuItem = menuItems.find((m) => m.id === menuItemId);
      if (!menuItem) return;

      await menuItemService.updateMenuItem(menuItemId, {
        status: !menuItem.status,
      });

      showSuccessToast(
        'Estado actualizado',
        `El platillo ha sido ${!menuItem.status ? 'activado' : 'desactivado'} exitosamente`
      );
      // Refrescar lista
      await queryClient.invalidateQueries({ queryKey: ['menuItems'] });
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
    if (!menuItemToDelete) return;

    setIsDeleting(true);
    try {
      await menuItemService.deleteMenuItem(menuItemToDelete.id);
      showSuccessToast(
        'Platillo eliminado',
        `El platillo "${menuItemToDelete.name}" ha sido eliminado exitosamente`
      );
      // Refrescar lista
      await queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al eliminar platillo', error.message);
      } else {
        showErrorToast('Error al eliminar platillo', 'Ocurrió un error inesperado');
      }
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setMenuItemToDelete(null);
    }
  };

  /**
   * Handler para abrir modal de creación
   */
  const handleNewMenuItem = () => {
    setIsCreateModalOpen(true);
  };

  /**
   * Handler para cerrar modal de creación
   */
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  /**
   * Handler para crear platillo
   */
  const handleCreateMenuItem = async (menuItemData: CreateMenuItemRequest) => {
    if (!user?.id) {
      showErrorToast('Error', 'No se pudo obtener el usuario autenticado');
      return;
    }

    setIsCreatingMenuItem(true);
    try {
      await menuItemService.createMenuItem({
        ...menuItemData,
        userId: user.id,
      });
      // Cerrar modal y refrescar lista
      setIsCreateModalOpen(false);
      showSuccessToast('Platillo creado exitosamente', 'El nuevo platillo ha sido agregado al sistema');
      // Invalidar y refrescar la query de platillos
      await queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al crear platillo', error.message);
      } else {
        showErrorToast('Error al crear platillo', 'Ocurrió un error inesperado');
      }
      throw error; // Re-lanzar para que el formulario maneje el error
    } finally {
      setIsCreatingMenuItem(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-wrap justify-between items-center gap-4 px-4 py-2">
        <h1 className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">
          Platillos
        </h1>
        <Button
          onClick={handleNewMenuItem}
          className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="truncate">Nuevo Platillo</span>
        </Button>
      </div>

      <MenuItemSearchBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <MenuItemTable
        menuItems={tableMenuItems}
        isLoading={isLoading}
        onMenuItemAction={handleMenuItemAction}
      />

      {paginationData.totalItems > 0 && (
        <MenuItemPagination
          pagination={paginationData}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modal de Creación de Platillo */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="!max-w-[40vw] w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogClose />
          <DialogHeader>
            <DialogTitle>Crear Nuevo Platillo</DialogTitle>
          </DialogHeader>
          <CreateMenuItemForm
            onSubmit={handleCreateMenuItem}
            onCancel={handleCloseCreateModal}
            isLoading={isCreatingMenuItem}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmación de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar platillo?</AlertDialogTitle>
            <AlertDialogDescription>
              {menuItemToDelete && (
                <>
                  Estás a punto de eliminar el platillo <strong className="text-slate-900 dark:text-white">{menuItemToDelete.name}</strong>.
                  <br />
                  <br />
                  Esta acción no se puede deshacer. El platillo será eliminado permanentemente del sistema.
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

export default MenuItemsPage;

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
import { UserSearchBar } from '@/presentation/components/users/UserSearchBar';
import { UserTable } from '@/presentation/components/users/UserTable';
import { Pagination } from '@/presentation/components/ui/pagination';
import { CreateUserForm } from '@/presentation/components/users/CreateUserForm';
import { UserService } from '@/application/services/user.service';
import type { UserTableFilters, PaginationData, CreateUserRequest } from '@/domain/types';
import { formatUsersForTable } from '@/shared/utils';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

/**
 * Página de Usuarios
 * Responsabilidad: Orquestar los componentes de la página de usuarios
 * Cumple SRP: Solo maneja el estado y la lógica de la página
 */

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const DEFAULT_ITEMS_PER_PAGE = 5;

const UsersPage: React.FC = () => {
  const [filters, setFilters] = useState<UserTableFilters>({
    search: '',
    role: undefined,
    status: undefined,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  
  const userService = new UserService();
  const queryClient = useQueryClient();

  // Query para obtener usuarios de la API
  const {
    data: users = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      const apiFilters: {
        search?: string;
        role?: string;
        status?: string;
      } = {};

      if (filters.search) {
        apiFilters.search = filters.search;
      }

      if (filters.role && filters.role !== 'all') {
        apiFilters.role = filters.role;
      }

      // Manejo del filtro de status:
      // - 'all' -> enviar 'all' al backend para ver todos los usuarios (activos e inactivos)
      // - 'active' -> enviar 'true' para ver solo activos
      // - 'inactive' -> enviar 'false' para ver solo inactivos
      // - undefined -> no enviar parámetro, el backend mostrará solo activos por defecto
      if (filters.status) {
        if (filters.status === 'all') {
          apiFilters.status = 'all';
        } else {
          apiFilters.status = filters.status === 'active' ? 'true' : 'false';
        }
      }

      return await userService.listUsers(apiFilters);
    },
    staleTime: 30000, // Los datos se consideran frescos por 30 segundos
    retry: 1, // Reintentar una vez si falla
  });

  // Mostrar error si la carga falla
  React.useEffect(() => {
    if (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al cargar usuarios', error.message);
      } else {
        showErrorToast('Error al cargar usuarios', 'No se pudieron obtener los usuarios del servidor');
      }
    }
  }, [error]);

  /**
   * Filtra usuarios según los filtros aplicados (filtrado en cliente como fallback)
   * Nota: El filtrado principal se hace en el servidor, esto es solo para casos especiales
   */
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Filtro de búsqueda (nombre o email)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.last_name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    // Filtro de rol
    if (filters.role && filters.role !== 'all') {
      result = result.filter((user) => user.rol === filters.role);
    }

    // Filtro de estado
    if (filters.status && filters.status !== 'all') {
      const isActive = filters.status === 'active';
      result = result.filter((user) => user.status === isActive);
    }

    return result;
  }, [users, filters]);

  /**
   * Calcula datos de paginación
   */
  const paginationData: PaginationData = useMemo(() => {
    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return {
      currentPage,
      totalPages: totalPages || 1,
      totalItems,
      itemsPerPage,
    };
  }, [filteredUsers.length, currentPage, itemsPerPage]);

  /**
   * Obtiene usuarios para la página actual
   */
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  /**
   * Convierte usuarios a formato de tabla
   */
  const tableUsers = useMemo(() => {
    return formatUsersForTable(paginatedUsers);
  }, [paginatedUsers]);

  /**
   * Handler para cambios en filtros
   */
  const handleFiltersChange = (newFilters: UserTableFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Resetear a primera página al cambiar filtros
  };

  /**
   * Handler para cambio de página
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setItemsPerPage(pageSize);
    setCurrentPage(1);
  };

  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handler para acciones de usuario (editar, eliminar, reactivar, toggle estado)
   */
  const handleUserAction = (
    userId: string,
    action: 'edit' | 'delete' | 'reactivate' | 'toggle-status'
  ) => {
    switch (action) {
      case 'edit':
        // TODO: Implementar edición de usuario
        showErrorToast('Funcionalidad en desarrollo', 'La edición de usuarios estará disponible pronto');
        break;
      case 'delete':
        // Buscar el usuario en la lista para obtener su nombre
        const user = users.find((u) => u.id === userId);
        if (user) {
          setUserToDelete({ id: userId, name: user.name });
          setIsDeleteDialogOpen(true);
        }
        break;
      case 'reactivate':
        // Reactivar usuario directamente sin confirmación (es una acción reversible)
        handleReactivateUser(userId);
        break;
      case 'toggle-status':
        // TODO: Implementar cambio de estado
        showErrorToast('Funcionalidad en desarrollo', 'El cambio de estado estará disponible pronto');
        break;
    }
  };

  /**
   * Handler para reactivar usuario
   */
  const handleReactivateUser = async (userId: string) => {
    try {
      await userService.reactivateUser(userId);
      const user = users.find((u) => u.id === userId);
      showSuccessToast(
        'Usuario reactivado',
        `El usuario "${user?.name || 'Usuario'}" ha sido reactivado exitosamente`
      );
      // Refrescar lista
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al reactivar usuario', error.message);
      } else {
        showErrorToast('Error al reactivar usuario', 'Ocurrió un error inesperado');
      }
    }
  };

  /**
   * Handler para confirmar eliminación
   */
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id);
      showSuccessToast(
        'Usuario desactivado',
        `El usuario "${userToDelete.name}" ha sido desactivado exitosamente`
      );
      // Refrescar lista
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await refetch();
      } catch (error) {
        if (error instanceof AppError) {
          showErrorToast('Error al desactivar usuario', error.message);
        } else {
          showErrorToast('Error al desactivar usuario', 'Ocurrió un error inesperado');
        }
      } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  /**
   * Handler para exportar usuarios
   */
  const handleExport = () => {
    // TODO: Implementar exportación (CSV, Excel, etc.)
  };

  /**
   * Handler para abrir modal de creación
   */
  const handleNewUser = () => {
    setIsCreateModalOpen(true);
  };

  /**
   * Handler para cerrar modal de creación
   */
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  /**
   * Handler para crear usuario
   */
  const handleCreateUser = async (userData: CreateUserRequest) => {
    setIsCreatingUser(true);
    try {
      await userService.createUser(userData);
      // Cerrar modal y refrescar lista
      setIsCreateModalOpen(false);
      showSuccessToast('Usuario creado exitosamente', 'El nuevo usuario ha sido agregado al sistema');
      // Invalidar y refrescar la query de usuarios
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al crear usuario', error.message);
      } else {
        showErrorToast('Error al crear usuario', 'Ocurrió un error inesperado');
      }
      throw error; // Re-lanzar para que el formulario maneje el error
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-wrap justify-between items-center gap-4 px-4 py-2">
        <h1 className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">
          Usuarios
        </h1>
        <Button
          onClick={handleNewUser}
          className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="truncate">Nuevo Usuario</span>
        </Button>
      </div>

      <UserSearchBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onExport={handleExport}
      />

      <UserTable
        users={tableUsers}
        isLoading={isLoading}
        onUserAction={handleUserAction}
      />

      {paginationData.totalItems > 0 && (
        <Pagination
          currentPage={paginationData.currentPage}
          totalPages={paginationData.totalPages}
          totalItems={paginationData.totalItems}
          itemsPerPage={paginationData.itemsPerPage}
          itemsLabel="usuarios"
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Modal de Creación de Usuario */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogClose />
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <CreateUserForm
            onSubmit={handleCreateUser}
            onCancel={handleCloseCreateModal}
            isLoading={isCreatingUser}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmación de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete && (
                <>
                  Estás a punto de desactivar al usuario <strong className="text-slate-900 dark:text-white">{userToDelete.name}</strong>.
                  <br />
                  <br />
                  El usuario será desactivado y no podrá iniciar sesión, pero sus datos se mantendrán en el sistema para preservar el historial (órdenes, pagos, etc.). Puedes reactivarlo más tarde si es necesario.
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
              {isDeleting ? 'Desactivando...' : 'Desactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default UsersPage;

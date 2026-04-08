import React, { useState, useMemo, useCallback } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/presentation/components/ui/dialog';
import { ConfirmDialog } from '@/presentation/components/ui/confirm-dialog';
import { UserSearchBar } from '@/presentation/components/users/UserSearchBar';
import { UserTable } from '@/presentation/components/users/UserTable';
import { Pagination } from '@/presentation/components/ui/pagination';
import { CreateUserForm } from '@/presentation/components/users/CreateUserForm';
import { useCrudList } from '@/presentation/hooks/useCrudList';
import { UserService } from '@/application/services/user.service';
import type { UserTableFilters, CreateUserRequest, User } from '@/domain/types';
import { formatUsersForTable } from '@/shared/utils';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

const userService = new UserService();

const filterAdapter = (filters: UserTableFilters) => {
  const api: { search?: string; role?: string; status?: string } = {};
  if (filters.search) api.search = filters.search;
  if (filters.role && filters.role !== 'all') api.role = filters.role;
  if (filters.status) {
    api.status = filters.status === 'all' ? 'all' : filters.status === 'active' ? 'true' : 'false';
  }
  return api;
};

const clientFilter = (data: User[], filters: UserTableFilters) => {
  let result = data;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((u) =>
      u.name.toLowerCase().includes(q) || u.last_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }
  if (filters.role && filters.role !== 'all') {
    result = result.filter((u) => u.rol === filters.role);
  }
  if (filters.status && filters.status !== 'all') {
    const isActive = filters.status === 'active';
    result = result.filter((u) => u.status === isActive);
  }
  return result;
};

const UsersPage: React.FC = () => {
  const {
    rawData: users,
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
  } = useCrudList<User, UserTableFilters>({
    queryKey: 'users',
    queryFn: (apiFilters) => userService.listUsers(apiFilters),
    initialFilters: { search: '', role: undefined, status: undefined },
    filterAdapter,
    clientFilter,
    defaultPageSize: 5,
    pageSizeOptions: [5, 10, 20, 50],
  });

  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    if (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al cargar usuarios', error.message);
      } else {
        showErrorToast('Error al cargar usuarios', 'No se pudieron obtener los usuarios del servidor');
      }
    }
  }, [error]);

  const tableUsers = useMemo(() => formatUsersForTable(paginatedData), [paginatedData]);

  const handleUserAction = useCallback((userId: string, action: 'delete' | 'reactivate' | 'toggle-status') => {
    switch (action) {
      case 'delete': {
        const user = users.find((u) => u.id === userId);
        if (user) deleteDialog.open(user);
        break;
      }
      case 'reactivate':
        handleReactivateUser(userId);
        break;
      case 'toggle-status':
        showErrorToast('Funcionalidad en desarrollo', 'El cambio de estado estará disponible pronto');
        break;
    }
  }, [users, deleteDialog]);

  const handleReactivateUser = async (userId: string) => {
    try {
      await userService.reactivateUser(userId);
      const user = users.find((u) => u.id === userId);
      showSuccessToast('Usuario reactivado', `El usuario "${user?.name || 'Usuario'}" ha sido reactivado exitosamente`);
      invalidate();
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al reactivar usuario', error.message);
      } else {
        showErrorToast('Error al reactivar usuario', 'Ocurrió un error inesperado');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.data) return;
    setIsDeleting(true);
    try {
      await userService.deleteUser(deleteDialog.data.id);
      showSuccessToast('Usuario desactivado', `El usuario "${deleteDialog.data.name}" ha sido desactivado exitosamente`);
      invalidate();
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al desactivar usuario', error.message);
      } else {
        showErrorToast('Error al desactivar usuario', 'Ocurrió un error inesperado');
      }
    } finally {
      setIsDeleting(false);
      deleteDialog.close();
    }
  };

  const handleCreateUser = async (userData: CreateUserRequest) => {
    setIsCreating(true);
    try {
      await userService.createUser(userData);
      setIsCreateModalOpen(false);
      showSuccessToast('Usuario creado exitosamente', 'El nuevo usuario ha sido agregado al sistema');
      invalidate();
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al crear usuario', error.message);
      } else {
        showErrorToast('Error al crear usuario', 'Ocurrió un error inesperado');
      }
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-wrap justify-between items-center gap-4 px-4 py-2">
        <h1 className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">Usuarios</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          <span className="truncate">Nuevo Usuario</span>
        </Button>
      </div>

      <UserSearchBar filters={filters} onFiltersChange={setFilters} onExport={() => {}} />
      <UserTable users={tableUsers} isLoading={isLoading} onUserAction={handleUserAction} />

      {paginationData.totalItems > 0 && (
        <Pagination
          currentPage={paginationData.currentPage} totalPages={paginationData.totalPages}
          totalItems={paginationData.totalItems} itemsPerPage={paginationData.itemsPerPage}
          itemsLabel="usuarios" pageSizeOptions={pageSizeOptions}
          onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange}
        />
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="w-full md:w-[45vw] max-h-[90vh] overflow-y-auto">
          <DialogClose />
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserPlus className="h-5 w-5" />
              </div>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            </div>
          </DialogHeader>
          <CreateUserForm onSubmit={handleCreateUser} onCancel={() => setIsCreateModalOpen(false)} isLoading={isCreating} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        title="¿Desactivar usuario?"
        description={deleteDialog.data && (<>Estás a punto de desactivar al usuario <strong className="text-slate-900 dark:text-white">{deleteDialog.data.name}</strong>.<br /><br />El usuario será desactivado y no podrá iniciar sesión, pero sus datos se mantendrán en el sistema. Puedes reactivarlo más tarde si es necesario.</>)}
        confirmLabel="Desactivar"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </MainLayout>
  );
};

export default UsersPage;

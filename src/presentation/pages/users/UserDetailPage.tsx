import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/presentation/components/ui/dialog';
import { UserService } from '@/application/services/user.service';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';
import { UserPersonalInfo } from '@/presentation/components/users/UserPersonalInfo';
import { UserAccountInfo } from '@/presentation/components/users/UserAccountInfo';
import { UserRecentActivity } from '@/presentation/components/users/UserRecentActivity';
import { UserStatistics } from '@/presentation/components/users/UserStatistics';
import { EditUserForm } from '@/presentation/components/users/EditUserForm';
import type { UpdateUserRequest } from '@/domain/types';

/**
 * Página de Detalle de Usuario
 * Muestra información completa de un usuario específico
 */
const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const userService = new UserService();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Query para obtener el usuario
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      return await userService.getUserById(userId);
    },
    enabled: !!userId,
  });

  // Mostrar error si la carga falla
  React.useEffect(() => {
    if (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al cargar usuario', error.message);
      } else {
        showErrorToast('Error al cargar usuario', 'No se pudo obtener la información del usuario');
      }
    }
  }, [error]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Cargando información del usuario...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-slate-500 dark:text-slate-400 text-lg">Usuario no encontrado</p>
          <Button onClick={() => navigate('/users')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Usuarios
          </Button>
        </div>
      </MainLayout>
    );
  }

  const fullName = `${user.name} ${user.last_name}${user.second_last_name ? ` ${user.second_last_name}` : ''}`;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            to="/dashboard"
            className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">/</span>
          <Link
            to="/users"
            className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"
          >
            Usuarios
          </Link>
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">/</span>
          <span className="text-slate-800 dark:text-slate-200 text-sm font-medium">{fullName}</span>
        </div>

        {/* Page Heading */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">
            {fullName}
          </h1>
          <Button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span className="truncate">Editar Usuario</span>
          </Button>
        </div>

        {/* Cards Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Card: Información Personal */}
            <UserPersonalInfo user={user} />

            {/* Card: Actividad Reciente */}
            <UserRecentActivity userId={user.id} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            {/* Card: Información de la Cuenta */}
            <UserAccountInfo user={user} />

            {/* Card: Estadísticas */}
            <UserStatistics userId={user.id} />
          </div>
        </div>
      </div>

      {/* Modal de Edición de Usuario */}
      {user && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogClose />
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
            </DialogHeader>
            <EditUserForm
              user={user}
              onSubmit={async (userData: UpdateUserRequest) => {
                if (!userId) return;
                setIsUpdating(true);
                try {
                  await userService.updateUser(userId, userData);
                  showSuccessToast(
                    'Usuario actualizado',
                    'El usuario ha sido actualizado exitosamente'
                  );
                  setIsEditModalOpen(false);
                  // Refrescar datos
                  await queryClient.invalidateQueries({ queryKey: ['user', userId] });
                  await refetch();
                } catch (error) {
                  if (error instanceof AppError) {
                    showErrorToast('Error al actualizar usuario', error.message);
                  } else {
                    showErrorToast('Error al actualizar usuario', 'Ocurrió un error inesperado');
                  }
                  throw error;
                } finally {
                  setIsUpdating(false);
                }
              }}
              onCancel={() => setIsEditModalOpen(false)}
              isLoading={isUpdating}
            />
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
};

export default UserDetailPage;


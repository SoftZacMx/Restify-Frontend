import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/presentation/components/ui/dialog';
import { Badge } from '@/presentation/components/ui/badge';
import { Card } from '@/presentation/components/ui/card';
import { menuItemService } from '@/application/services';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';
import { EditMenuItemForm } from '@/presentation/components/menu-items/EditMenuItemForm';
import type { UpdateMenuItemRequest } from '@/domain/types';
import { cn } from '@/shared/lib/utils';
import { APP_TIMEZONE } from '@/shared/constants';

/**
 * Página de Detalle de Platillo
 * Muestra información completa de un platillo específico
 */
const MenuItemDetailPage: React.FC = () => {
  const { menuItemId } = useParams<{ menuItemId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Query para obtener el platillo
  const {
    data: menuItem,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['menuItem', menuItemId],
    queryFn: async () => {
      if (!menuItemId) throw new Error('MenuItem ID is required');
      return await menuItemService.getMenuItemById(menuItemId);
    },
    enabled: !!menuItemId,
  });

  // Mostrar error si la carga falla
  React.useEffect(() => {
    if (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al cargar platillo', error.message);
      } else {
        showErrorToast('Error al cargar platillo', 'No se pudo obtener la información del platillo');
      }
    }
  }, [error]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Cargando información del platillo...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!menuItem) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-slate-500 dark:text-slate-400 text-lg">Platillo no encontrado</p>
          <Button onClick={() => navigate('/menu/items')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Platillos
          </Button>
        </div>
      </MainLayout>
    );
  }

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
            to="/menu/items"
            className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"
          >
            Platillos
          </Link>
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">/</span>
          <span className="text-slate-800 dark:text-slate-200 text-sm font-medium">{menuItem.name}</span>
        </div>

        {/* Page Heading */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">
              {menuItem.name}
            </h1>
            <Badge
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0',
                menuItem.status
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
              )}
            >
              {menuItem.status ? 'Activo' : 'Inactivo'}
            </Badge>
            {menuItem.isExtra && (
              <Badge className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                Es Extra
              </Badge>
            )}
          </div>
          <Button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span className="truncate">Editar Platillo</span>
          </Button>
        </div>

        {/* Cards Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información General */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Información General
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Nombre
                </label>
                <p className="text-base text-slate-900 dark:text-white mt-1">{menuItem.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Precio
                </label>
                <p className="text-base text-slate-900 dark:text-white mt-1">
                  ${menuItem.price.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Estado
                </label>
                <p className="text-base text-slate-900 dark:text-white mt-1">
                  {menuItem.status ? 'Activo' : 'Inactivo'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Es Extra
                </label>
                <p className="text-base text-slate-900 dark:text-white mt-1">
                  {menuItem.isExtra ? 'Sí' : 'No'}
                </p>
              </div>
            </div>
          </Card>

          {/* Información de Fechas */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Información de Fechas
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Fecha de Creación
                </label>
                <p className="text-base text-slate-900 dark:text-white mt-1">
                  {new Date(menuItem.createdAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    timeZone: APP_TIMEZONE,
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Última Actualización
                </label>
                <p className="text-base text-slate-900 dark:text-white mt-1">
                  {new Date(menuItem.updatedAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    timeZone: APP_TIMEZONE,
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  ID de Categoría
                </label>
                <p className="text-base text-slate-900 dark:text-white mt-1 font-mono text-sm">
                  {menuItem.categoryId}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Edición de Platillo */}
      {menuItem && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogClose />
            <DialogHeader>
              <DialogTitle>Editar Platillo</DialogTitle>
            </DialogHeader>
            <EditMenuItemForm
              menuItem={menuItem}
              onSubmit={async (menuItemData: UpdateMenuItemRequest) => {
                if (!menuItemId) return;
                setIsUpdating(true);
                try {
                  await menuItemService.updateMenuItem(menuItemId, menuItemData);
                  showSuccessToast(
                    'Platillo actualizado',
                    'El platillo ha sido actualizado exitosamente'
                  );
                  setIsEditModalOpen(false);
                  // Refrescar datos
                  await queryClient.invalidateQueries({ queryKey: ['menuItem', menuItemId] });
                  await queryClient.invalidateQueries({ queryKey: ['menuItems'] });
                  await refetch();
                } catch (error) {
                  if (error instanceof AppError) {
                    showErrorToast('Error al actualizar platillo', error.message);
                  } else {
                    showErrorToast('Error al actualizar platillo', 'Ocurrió un error inesperado');
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

export default MenuItemDetailPage;

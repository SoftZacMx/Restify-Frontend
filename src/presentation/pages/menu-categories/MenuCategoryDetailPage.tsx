import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { EditMenuCategoryForm } from '@/presentation/components/menu-categories/EditMenuCategoryForm';
import { menuCategoryService } from '@/application/services';
import type { UpdateMenuCategoryRequest } from '@/domain/types';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';
import { APP_TIMEZONE } from '@/shared/constants';

/**
 * Página de Detalle/Edición de Categoría
 * Responsabilidad: Mostrar y editar una categoría específica
 */
const MenuCategoryDetailPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Query para obtener la categoría
  const {
    data: category,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['menuCategory', categoryId],
    queryFn: async () => {
      if (!categoryId) throw new Error('ID de categoría no proporcionado');
      return await menuCategoryService.getMenuCategoryById(categoryId);
    },
    enabled: !!categoryId,
    retry: 1,
  });

  /**
   * Handler para actualizar la categoría
   */
  const handleUpdateCategory = async (categoryData: UpdateMenuCategoryRequest) => {
    if (!categoryId) return;

    setIsUpdating(true);
    try {
      await menuCategoryService.updateMenuCategory(categoryId, categoryData);
      showSuccessToast('Categoría actualizada', 'Los cambios se han guardado correctamente');
      // Invalidar queries relacionadas
      await queryClient.invalidateQueries({ queryKey: ['menuCategory', categoryId] });
      await queryClient.invalidateQueries({ queryKey: ['menuCategories'] });
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al actualizar', error.message);
      } else {
        showErrorToast('Error al actualizar', 'Ocurrió un error inesperado');
      }
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handler para volver a la lista
   */
  const handleBack = () => {
    navigate('/menu/categories');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="px-4 py-8">
          <div className="text-center text-slate-500 dark:text-slate-400">
            Cargando categoría...
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !category) {
    return (
      <MainLayout>
        <div className="px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 dark:text-red-400 mb-4">
              {error instanceof AppError ? error.message : 'No se pudo cargar la categoría'}
            </p>
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Categorías
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-4 py-2">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">
              {category.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Editar información de la categoría
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario de edición */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <EditMenuCategoryForm
                  category={category}
                  onSubmit={handleUpdateCategory}
                  onCancel={handleBack}
                  isLoading={isUpdating}
                />
              </CardContent>
            </Card>
          </div>

          {/* Panel de información */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    ID
                  </p>
                  <p className="text-sm text-slate-900 dark:text-white font-mono">
                    {category.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Estado
                  </p>
                  <p className={`text-sm font-medium ${category.status ? 'text-green-600' : 'text-slate-500'}`}>
                    {category.status ? 'Activa' : 'Inactiva'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Creada
                  </p>
                  <p className="text-sm text-slate-900 dark:text-white">
                    {new Date(category.createdAt).toLocaleDateString('es-ES', {
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
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Última actualización
                  </p>
                  <p className="text-sm text-slate-900 dark:text-white">
                    {new Date(category.updatedAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      timeZone: APP_TIMEZONE,
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MenuCategoryDetailPage;

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';
import { EditTableForm } from '@/presentation/components/tables/EditTableForm';
import { tableService } from '@/application/services';
import type { UpdateTableRequest } from '@/domain/types';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';
import { cn } from '@/shared/lib/utils';

/**
 * Página de Detalle/Edición de Mesa
 * Responsabilidad: Mostrar y editar una mesa específica
 */
const TableDetailPage: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Query para obtener la mesa
  const {
    data: table,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['table', tableId],
    queryFn: async () => {
      if (!tableId) throw new Error('ID de mesa no proporcionado');
      return await tableService.getTableById(tableId);
    },
    enabled: !!tableId,
    retry: 1,
  });

  /**
   * Handler para actualizar la mesa
   */
  const handleUpdateTable = async (tableData: UpdateTableRequest) => {
    if (!tableId) return;

    setIsUpdating(true);
    try {
      await tableService.updateTable(tableId, tableData);
      showSuccessToast('Mesa actualizada', 'Los cambios se han guardado correctamente');
      // Invalidar queries relacionadas
      await queryClient.invalidateQueries({ queryKey: ['table', tableId] });
      await queryClient.invalidateQueries({ queryKey: ['tables'] });
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
    navigate('/tables');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="px-4 py-8">
          <div className="text-center text-slate-500 dark:text-slate-400">
            Cargando mesa...
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !table) {
    return (
      <MainLayout>
        <div className="px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 dark:text-red-400 mb-4">
              {error instanceof AppError ? error.message : 'No se pudo cargar la mesa'}
            </p>
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Mesas
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
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xl">
              {table.numberTable}
            </span>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">
                Mesa {table.numberTable}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Editar información de la mesa
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario de edición */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Mesa</CardTitle>
              </CardHeader>
              <CardContent>
                <EditTableForm
                  tableData={table}
                  onSubmit={handleUpdateTable}
                  onCancel={handleBack}
                  isLoading={isUpdating}
                />
              </CardContent>
            </Card>
          </div>

          {/* Panel de información */}
          <div className="space-y-6">
            {/* Estado visual de la mesa */}
            <Card>
              <CardHeader>
                <CardTitle>Estado Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <div
                    className={cn(
                      'w-20 h-20 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg',
                      !table.status
                        ? 'bg-gray-400'
                        : table.availabilityStatus
                          ? 'bg-green-500'
                          : 'bg-red-500'
                    )}
                  >
                    {table.numberTable}
                  </div>
                  <Badge
                    className={cn(
                      'px-4 py-1 text-sm border-0',
                      !table.status
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        : table.availabilityStatus
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    )}
                  >
                    {!table.status
                      ? 'Deshabilitada'
                      : table.availabilityStatus
                        ? 'Libre'
                        : 'Ocupada'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Detalles */}
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
                    {table.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Estado del Sistema
                  </p>
                  <p className={`text-sm font-medium ${table.status ? 'text-green-600' : 'text-slate-500'}`}>
                    {table.status ? 'Activa' : 'Inactiva'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Disponibilidad
                  </p>
                  <p className={`text-sm font-medium ${table.availabilityStatus ? 'text-emerald-600' : 'text-orange-600'}`}>
                    {table.availabilityStatus ? 'Libre' : 'Ocupada'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Creada
                  </p>
                  <p className="text-sm text-slate-900 dark:text-white">
                    {new Date(table.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
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
                    {new Date(table.updatedAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
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

export default TableDetailPage;

import React, { useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/presentation/components/ui/dialog';
import { Badge } from '@/presentation/components/ui/badge';
import { Card } from '@/presentation/components/ui/card';
import { productService } from '@/application/services';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';
import { EditProductForm } from '@/presentation/components/products/EditProductForm';
import type { UpdateProductRequest, ProductResponse } from '@/domain/types';
import { cn } from '@/shared/lib/utils';
import { APP_TIMEZONE } from '@/shared/constants';

/**
 * Página de Detalle de Producto
 * Muestra toda la información del producto (mercancía).
 * Si se navega desde la lista, se usa el producto en state para mostrar al instante y se refresca desde API.
 */
const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Producto pasado por state al navegar desde la lista (evita loading inicial)
  const productFromState = (location.state as { product?: ProductResponse } | null)?.product;

  // Query para obtener el producto: si viene de la lista usamos placeholderData para mostrar al instante y refrescar desde API
  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) throw new Error('Product ID is required');
      return await productService.getProductById(productId);
    },
    enabled: !!productId,
    placeholderData: productFromState ?? undefined,
  });

  // Mostrar error si la carga falla
  React.useEffect(() => {
    if (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al cargar producto', error.message);
      } else {
        showErrorToast('Error al cargar producto', 'No se pudo obtener la información del producto');
      }
    }
  }, [error]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Cargando información del producto...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-slate-500 dark:text-slate-400 text-lg">Producto no encontrado</p>
          <Button onClick={() => navigate('/products')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Productos
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
            to="/products"
            className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"
          >
            Productos
          </Link>
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">/</span>
          <span className="text-slate-800 dark:text-slate-200 text-sm font-medium">{product.name}</span>
        </div>

        {/* Page Heading */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">
              {product.name}
            </h1>
            <Badge
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0',
                product.status
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
              )}
            >
              {product.status ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          <Button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span className="truncate">Editar Producto</span>
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
                <p className="text-base text-slate-900 dark:text-white mt-1">{product.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Descripción
                </label>
                <p className="text-base text-slate-900 dark:text-white mt-1">
                  {product.description || 'Sin descripción'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Estado
                </label>
                <p className="text-base text-slate-900 dark:text-white mt-1">
                  {product.status ? 'Activo' : 'Inactivo'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Usuario propietario
                </label>
                <p className="text-base text-slate-900 dark:text-white mt-1 font-mono text-sm">
                  {product.userId}
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
                  Fecha de Registro
                </label>
                <p className="text-base text-slate-900 dark:text-white mt-1">
                  {new Date(product.registrationDate).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    timeZone: APP_TIMEZONE,
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Fecha de Creación
                </label>
                <p className="text-base text-slate-900 dark:text-white mt-1">
                  {new Date(product.createdAt).toLocaleDateString('es-ES', {
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
                  {new Date(product.updatedAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    timeZone: APP_TIMEZONE,
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Edición de Producto */}
      {product && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogClose />
            <DialogHeader>
              <DialogTitle>Editar Producto</DialogTitle>
            </DialogHeader>
            <EditProductForm
              product={product}
              onSubmit={async (productData: UpdateProductRequest) => {
                if (!productId) return;
                setIsUpdating(true);
                try {
                  await productService.updateProduct(productId, productData);
                  showSuccessToast(
                    'Producto actualizado',
                    'El producto ha sido actualizado exitosamente'
                  );
                  setIsEditModalOpen(false);
                  // Refrescar datos
                  await queryClient.invalidateQueries({ queryKey: ['product', productId] });
                  await queryClient.invalidateQueries({ queryKey: ['products'] });
                  await refetch();
                } catch (error) {
                  if (error instanceof AppError) {
                    showErrorToast('Error al actualizar producto', error.message);
                  } else {
                    showErrorToast('Error al actualizar producto', 'Ocurrió un error inesperado');
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

export default ProductDetailPage;

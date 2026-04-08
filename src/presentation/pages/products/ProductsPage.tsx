import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/presentation/components/ui/dialog';
import { ConfirmDialog } from '@/presentation/components/ui/confirm-dialog';
import { ProductSearchBar } from '@/presentation/components/products/ProductSearchBar';
import { ProductTable } from '@/presentation/components/products/ProductTable';
import { Pagination } from '@/presentation/components/ui/pagination';
import { CreateProductForm } from '@/presentation/components/products/CreateProductForm';
import { useCrudList } from '@/presentation/hooks/useCrudList';
import { productService } from '@/application/services';
import { useAuthStore } from '@/presentation/store/auth.store';
import type { ProductTableFilters, CreateProductRequest, ProductResponse } from '@/domain/types';
import { formatProductsForTable } from '@/shared/utils/product.utils';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

const filterAdapter = (filters: ProductTableFilters) => {
  const api: { status?: boolean; search?: string } = {};
  if (filters.status && filters.status !== 'all') {
    api.status = filters.status === 'active';
  }
  if (filters.search) {
    api.search = filters.search;
  }
  return api;
};

const clientFilter = (data: ProductResponse[], filters: ProductTableFilters) => {
  let result = data;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q));
  }
  if (filters.status && filters.status !== 'all') {
    const isActive = filters.status === 'active';
    result = result.filter((p) => p.status === isActive);
  }
  return result;
};

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    rawData: products,
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
  } = useCrudList<ProductResponse, ProductTableFilters>({
    queryKey: 'products',
    queryFn: (apiFilters) => productService.listProducts(apiFilters),
    initialFilters: { search: '', status: undefined },
    filterAdapter,
    clientFilter,
  });

  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    if (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al cargar productos', error.message);
      } else {
        showErrorToast('Error al cargar productos', 'No se pudieron obtener los productos del servidor');
      }
    }
  }, [error]);

  const tableProducts = useMemo(() => formatProductsForTable(paginatedData), [paginatedData]);

  const handleProductAction = useCallback((
    productId: string,
    action: 'view' | 'edit' | 'delete' | 'toggle-status'
  ) => {
    switch (action) {
      case 'view':
      case 'edit': {
        const product = products.find((p) => p.id === productId);
        navigate(`/products/${productId}`, { state: product ? { product } : undefined });
        break;
      }
      case 'delete': {
        const product = products.find((p) => p.id === productId);
        if (product) deleteDialog.open(product);
        break;
      }
      case 'toggle-status':
        handleToggleStatus(productId);
        break;
    }
  }, [products, navigate, deleteDialog]);

  const handleToggleStatus = async (productId: string) => {
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      await productService.updateProduct(productId, { status: !product.status });
      showSuccessToast('Estado actualizado', `El producto ha sido ${!product.status ? 'activado' : 'desactivado'} exitosamente`);
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
      await productService.deleteProduct(deleteDialog.data.id);
      showSuccessToast('Producto eliminado', `El producto "${deleteDialog.data.name}" ha sido eliminado exitosamente`);
      invalidate();
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al eliminar producto', error.message);
      } else {
        showErrorToast('Error al eliminar producto', 'Ocurrió un error inesperado');
      }
    } finally {
      setIsDeleting(false);
      deleteDialog.close();
    }
  };

  const handleCreateProduct = async (productData: CreateProductRequest) => {
    if (!user?.id) {
      showErrorToast('Error', 'No se pudo obtener el usuario autenticado');
      return;
    }
    setIsCreating(true);
    try {
      await productService.createProduct({ ...productData, userId: user.id });
      setIsCreateModalOpen(false);
      showSuccessToast('Producto creado exitosamente', 'El nuevo producto ha sido agregado al sistema');
      invalidate();
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al crear producto', error.message);
      } else {
        showErrorToast('Error al crear producto', 'Ocurrió un error inesperado');
      }
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <MainLayout>
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Productos</h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>

        <ProductSearchBar filters={filters} onFiltersChange={setFilters} />

        <ProductTable
          products={tableProducts}
          isLoading={isLoading}
          onProductAction={handleProductAction}
        />

        {paginationData.totalItems > 0 && (
          <Pagination
            currentPage={paginationData.currentPage}
            totalPages={paginationData.totalPages}
            totalItems={paginationData.totalItems}
            itemsPerPage={paginationData.itemsPerPage}
            itemsLabel="productos"
            pageSizeOptions={pageSizeOptions}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="w-full md:w-[38vw] max-h-[90vh] overflow-y-auto">
            <DialogClose />
            <DialogHeader>
              <DialogTitle>Crear Nuevo Producto</DialogTitle>
            </DialogHeader>
            <CreateProductForm
              onSubmit={handleCreateProduct}
              onCancel={() => setIsCreateModalOpen(false)}
              isLoading={isCreating}
            />
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={deleteDialog.isOpen}
          onClose={deleteDialog.close}
          title="¿Eliminar producto?"
          description={deleteDialog.data && (<>Estás a punto de eliminar el producto <strong className="text-slate-900 dark:text-white">{deleteDialog.data.name}</strong>.<br /><br />Esta acción no se puede deshacer. El producto será eliminado permanentemente del sistema.</>)}
          confirmLabel="Eliminar"
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
        />
      </section>
    </MainLayout>
  );
};

export default ProductsPage;

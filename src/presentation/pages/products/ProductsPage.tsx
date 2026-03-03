import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ProductSearchBar } from '@/presentation/components/products/ProductSearchBar';
import { ProductTable } from '@/presentation/components/products/ProductTable';
import { Pagination } from '@/presentation/components/ui/pagination';
import { CreateProductForm } from '@/presentation/components/products/CreateProductForm';
import { productService } from '@/application/services';
import { useAuthStore } from '@/presentation/store/auth.store';
import type { ProductTableFilters, PaginationData, CreateProductRequest } from '@/domain/types';
import { formatProductsForTable } from '@/shared/utils/product.utils';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

/**
 * Página de Productos
 * Responsabilidad: Orquestar los componentes de la página de productos
 * Cumple SRP: Solo maneja el estado y la lógica de la página
 */

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const DEFAULT_ITEMS_PER_PAGE = 10;

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ProductTableFilters>({
    search: '',
    status: undefined,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const { user } = useAuthStore();

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

  // Query para obtener productos de la API
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', apiFilters],
    queryFn: async () => {
      return await productService.listProducts(apiFilters);
    },
    staleTime: 30000, // Los datos se consideran frescos por 30 segundos
    retry: 1, // Reintentar una vez si falla
  });

  // Mostrar error si la carga falla
  React.useEffect(() => {
    if (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al cargar productos', error.message);
      } else {
        showErrorToast('Error al cargar productos', 'No se pudieron obtener los productos del servidor');
      }
    }
  }, [error]);

  /**
   * Filtra productos según los filtros aplicados (filtrado en cliente como fallback)
   */
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filtro de búsqueda (nombre)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((product) =>
        product.name.toLowerCase().includes(searchLower)
      );
    }

    // Filtro de estado
    if (filters.status && filters.status !== 'all') {
      const isActive = filters.status === 'active';
      result = result.filter((product) => product.status === isActive);
    }

    return result;
  }, [products, filters]);

  /**
   * Calcula datos de paginación
   */
  const paginationData: PaginationData = useMemo(() => {
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return {
      currentPage,
      totalPages: totalPages || 1,
      totalItems,
      itemsPerPage,
    };
  }, [filteredProducts.length, currentPage, itemsPerPage]);

  /**
   * Obtiene productos para la página actual
   */
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  /**
   * Convierte productos a formato de tabla
   */
  const tableProducts = useMemo(() => {
    return formatProductsForTable(paginatedProducts);
  }, [paginatedProducts]);

  /**
   * Handler para cambios en filtros
   */
  const handleFiltersChange = (newFilters: ProductTableFilters) => {
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

  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handler para acciones de producto (ver detalle, editar, eliminar, toggle estado)
   * Ver detalle: navega con el producto en state para mostrar datos al instante; la página de detalle refresca desde API.
   */
  const handleProductAction = (
    productId: string,
    action: 'view' | 'edit' | 'delete' | 'toggle-status'
  ) => {
    switch (action) {
      case 'view': {
        const productFromList = products.find((p) => p.id === productId);
        navigate(`/products/${productId}`, { state: productFromList ? { product: productFromList } : undefined });
        break;
      }
      case 'edit': {
        const productFromList = products.find((p) => p.id === productId);
        navigate(`/products/${productId}`, { state: productFromList ? { product: productFromList } : undefined });
        break;
      }
      case 'delete': {
        const product = products.find((p) => p.id === productId);
        if (product) {
          setProductToDelete({ id: productId, name: product.name });
          setIsDeleteDialogOpen(true);
        }
        break;
      }
      case 'toggle-status':
        handleToggleStatus(productId);
        break;
    }
  };

  /**
   * Handler para cambiar estado del producto
   */
  const handleToggleStatus = async (productId: string) => {
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      await productService.updateProduct(productId, {
        status: !product.status,
      });

      showSuccessToast(
        'Estado actualizado',
        `El producto ha sido ${!product.status ? 'activado' : 'desactivado'} exitosamente`
      );
      // Refrescar lista
      await queryClient.invalidateQueries({ queryKey: ['products'] });
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
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await productService.deleteProduct(productToDelete.id);
      showSuccessToast(
        'Producto eliminado',
        `El producto "${productToDelete.name}" ha sido eliminado exitosamente`
      );
      // Refrescar lista
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al eliminar producto', error.message);
      } else {
        showErrorToast('Error al eliminar producto', 'Ocurrió un error inesperado');
      }
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  /**
   * Handler para abrir modal de creación
   */
  const handleNewProduct = () => {
    setIsCreateModalOpen(true);
  };

  /**
   * Handler para cerrar modal de creación
   */
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  /**
   * Handler para crear producto
   */
  const handleCreateProduct = async (productData: CreateProductRequest) => {
    if (!user?.id) {
      showErrorToast('Error', 'No se pudo obtener el usuario autenticado');
      return;
    }

    setIsCreatingProduct(true);
    try {
      await productService.createProduct({
        ...productData,
        userId: user.id,
      });
      // Cerrar modal y refrescar lista
      setIsCreateModalOpen(false);
      showSuccessToast('Producto creado exitosamente', 'El nuevo producto ha sido agregado al sistema');
      // Invalidar y refrescar la query de productos
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al crear producto', error.message);
      } else {
        showErrorToast('Error al crear producto', 'Ocurrió un error inesperado');
      }
      throw error; // Re-lanzar para que el formulario maneje el error
    } finally {
      setIsCreatingProduct(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Productos
          </h1>
          <Button onClick={handleNewProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>

        <ProductSearchBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

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
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        {/* Modal de Creación de Producto */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogClose />
            <DialogHeader>
              <DialogTitle>Crear Nuevo Producto</DialogTitle>
            </DialogHeader>
            <CreateProductForm
              onSubmit={handleCreateProduct}
              onCancel={handleCloseCreateModal}
              isLoading={isCreatingProduct}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmación de Eliminación */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
              <AlertDialogDescription>
                {productToDelete && (
                  <>
                    Estás a punto de eliminar el producto <strong className="text-slate-900 dark:text-white">{productToDelete.name}</strong>.
                    <br />
                    <br />
                    Esta acción no se puede deshacer. El producto será eliminado permanentemente del sistema.
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
      </div>
    </MainLayout>
  );
};

export default ProductsPage;

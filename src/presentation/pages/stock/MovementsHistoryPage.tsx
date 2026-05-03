import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import { MovementsFilters } from '@/presentation/components/stock/MovementsFilters';
import { MovementsTable } from '@/presentation/components/stock/MovementsTable';
import { stockService, productService } from '@/application/services';
import { showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';
import type {
  MovementsListFilters,
  MovementsListApiFilters,
  MovementTableItem,
  StockMovementListItem,
  StockMovementType,
} from '@/domain/types';

const filtersToApi = (f: MovementsListFilters): MovementsListApiFilters => {
  const api: MovementsListApiFilters = {};
  if (f.type !== 'ALL') api.type = f.type as StockMovementType;
  if (f.from) api.from = new Date(`${f.from}T00:00:00`).toISOString();
  if (f.to) api.to = new Date(`${f.to}T23:59:59.999`).toISOString();
  return api;
};

const toTableItem = (m: StockMovementListItem): MovementTableItem => ({
  id: m.id,
  productId: m.productId,
  quantity: Number(m.quantity),
  type: m.type,
  reason: m.reason,
  notes: m.notes,
  expenseItemId: m.expenseItemId,
  orderItemId: m.orderItemId,
  userId: m.userId,
  createdAt: m.createdAt,
});

const MovementsHistoryPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<MovementsListFilters>({
    type: 'ALL',
    from: '',
    to: '',
  });

  const apiFilters = useMemo(() => filtersToApi(filters), [filters]);

  // Producto (para mostrar nombre y unidad en el header).
  const { data: product, error: productError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => {
      if (!productId) throw new Error('productId requerido');
      return productService.getProductById(productId);
    },
    enabled: !!productId,
  });

  // Movimientos con filtros.
  const {
    data: movements = [],
    isLoading,
    error: movementsError,
  } = useQuery({
    queryKey: ['stock-movements', productId, apiFilters],
    queryFn: () => {
      if (!productId) throw new Error('productId requerido');
      return stockService.listProductMovements(productId, apiFilters);
    },
    enabled: !!productId,
  });

  React.useEffect(() => {
    const err = productError || movementsError;
    if (!err) return;
    if (err instanceof AppError) {
      showErrorToast('Error al cargar', err.message);
    } else {
      showErrorToast('Error al cargar', 'No se pudieron obtener los datos del servidor');
    }
  }, [productError, movementsError]);

  const tableItems = useMemo(() => movements.map(toTableItem), [movements]);

  if (!productId) {
    return (
      <MainLayout>
        <div className="text-center text-slate-500 dark:text-slate-400 py-8">
          Producto no especificado
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="space-y-6">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            to="/stock"
            className="text-slate-500 dark:text-slate-400 font-medium hover:text-primary transition-colors"
          >
            Stock
          </Link>
          <span className="text-slate-500 dark:text-slate-400">/</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium">
            Historial de movimientos
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-start gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate('/stock')} aria-label="Volver">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Historial de movimientos
              </h1>
              {product && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Producto: <strong className="text-slate-700 dark:text-slate-300">{product.name}</strong>
                </p>
              )}
            </div>
          </div>
        </div>

        <MovementsFilters filters={filters} onFiltersChange={setFilters} />

        <MovementsTable
          items={tableItems}
          unitOfMeasure={product?.unitOfMeasure ?? null}
          isLoading={isLoading}
        />
      </section>
    </MainLayout>
  );
};

export default MovementsHistoryPage;

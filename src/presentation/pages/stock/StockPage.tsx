import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2, Sliders } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import { Pagination } from '@/presentation/components/ui/pagination';
import { StockSearchBar } from '@/presentation/components/stock/StockSearchBar';
import { StockTable } from '@/presentation/components/stock/StockTable';
import { RegisterWasteDialog } from '@/presentation/components/stock/RegisterWasteDialog';
import { AdjustStockDialog } from '@/presentation/components/stock/AdjustStockDialog';
import { useCrudList } from '@/presentation/hooks/useCrudList';
import { stockService } from '@/application/services';
import { formatStockForTable } from '@/shared/utils/stock.utils';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';
import type {
  StockListFilters,
  StockListApiFilters,
  StockSummaryResponse,
  RecordWasteRequest,
  RecordAdjustmentRequest,
} from '@/domain/types';

const filterAdapter = (filters: StockListFilters): StockListApiFilters => {
  const api: StockListApiFilters = {};
  if (filters.search.trim()) api.search = filters.search.trim();
  if (filters.lowStockOnly) api.lowStock = true;
  return api;
};

const clientFilter = (data: StockSummaryResponse[], filters: StockListFilters) => {
  if (!filters.search.trim()) return data;
  const q = filters.search.toLowerCase();
  return data.filter((item) => item.name.toLowerCase().includes(q));
};

const StockPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isWasteOpen, setIsWasteOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isSubmittingWaste, setIsSubmittingWaste] = useState(false);
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  const {
    paginatedData,
    isLoading,
    error,
    filters,
    setFilters,
    paginationData,
    pageSizeOptions,
    handlePageChange,
    handlePageSizeChange,
  } = useCrudList<StockSummaryResponse, StockListFilters, StockListApiFilters>({
    queryKey: 'stock',
    queryFn: (apiFilters) => stockService.listStock(apiFilters),
    initialFilters: { search: '', lowStockOnly: false },
    filterAdapter,
    clientFilter,
  });

  React.useEffect(() => {
    if (!error) return;
    if (error instanceof AppError) {
      showErrorToast('Error al cargar el stock', error.message);
    } else {
      showErrorToast('Error al cargar el stock', 'No se pudo obtener el inventario del servidor');
    }
  }, [error]);

  const tableItems = useMemo(() => formatStockForTable(paginatedData), [paginatedData]);

  const handleViewHistory = (productId: string) => {
    navigate(`/stock/products/${productId}/movements`);
  };

  const handleSubmitWaste = async (body: RecordWasteRequest) => {
    setIsSubmittingWaste(true);
    try {
      const result = await stockService.recordWaste(body);
      if (result.recorded) {
        showSuccessToast('Merma registrada', 'El movimiento se guardó correctamente');
      } else {
        // El producto pasó a trackStock=false entre el momento de cargar la lista y el submit.
        showSuccessToast(
          'Sin movimiento',
          'El producto ya no trackea stock; no se generó un movimiento.'
        );
      }
      setIsWasteOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['stock'] });
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'Ocurrió un error inesperado';
      showErrorToast('Error al registrar merma', message);
    } finally {
      setIsSubmittingWaste(false);
    }
  };

  const handleSubmitAdjustment = async (body: RecordAdjustmentRequest) => {
    setIsSubmittingAdjust(true);
    try {
      const result = await stockService.recordAdjustment(body);
      if (result.recorded) {
        showSuccessToast('Ajuste guardado', 'El stock se actualizó correctamente');
      } else {
        showSuccessToast(
          'Sin cambios',
          'El nuevo stock coincide con el actual o el producto no trackea.'
        );
      }
      setIsAdjustOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['stock'] });
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'Ocurrió un error inesperado';
      showErrorToast('Error al ajustar stock', message);
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  return (
    <MainLayout>
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Stock</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Inventario actual de productos trackeados, costo promedio y alertas de mínimos.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setIsWasteOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Registrar merma
            </Button>
            <Button variant="outline" onClick={() => setIsAdjustOpen(true)}>
              <Sliders className="h-4 w-4 mr-2" />
              Ajustar stock
            </Button>
          </div>
        </div>

        <StockSearchBar filters={filters} onFiltersChange={setFilters} />

        <StockTable
          items={tableItems}
          isLoading={isLoading}
          onViewHistory={handleViewHistory}
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

        <RegisterWasteDialog
          open={isWasteOpen}
          onOpenChange={setIsWasteOpen}
          trackedProducts={tableItems}
          onSubmit={handleSubmitWaste}
          isSubmitting={isSubmittingWaste}
        />

        <AdjustStockDialog
          open={isAdjustOpen}
          onOpenChange={setIsAdjustOpen}
          trackedProducts={tableItems}
          onSubmit={handleSubmitAdjustment}
          isSubmitting={isSubmittingAdjust}
        />
      </section>
    </MainLayout>
  );
};

export default StockPage;

import { useState, useMemo, useCallback } from 'react';
import type { OrderViewFilters } from '@/shared/utils/order.utils';
import {
  getDefaultOrderFiltersForToday,
  convertViewFiltersToApiFilters,
  orderListNeedsClientSideFiltering,
} from '@/shared/utils/order.utils';

interface UseOrderFiltersOptions {
  defaultItemsPerPage?: number;
}

/**
 * Hook para gestionar filtros, paginación y visibilidad del panel de filtros
 * en la página de órdenes.
 */
export function useOrderFilters(options?: UseOrderFiltersOptions) {
  const { defaultItemsPerPage = 20 } = options || {};

  const [filters, setFiltersState] = useState<OrderViewFilters>(() => getDefaultOrderFiltersForToday());
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  // Filtros convertidos para la API
  const apiFilters = useMemo(() => convertViewFiltersToApiFilters(filters), [filters]);

  // Si se necesita filtrado en cliente (búsqueda texto, estados especiales)
  const needsClientSideFiltering = useMemo(() => orderListNeedsClientSideFiltering(filters), [filters]);

  const handleFiltersChange = useCallback((newFilters: OrderViewFilters) => {
    setFiltersState(newFilters);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setItemsPerPage(pageSize);
    setCurrentPage(1);
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  return {
    filters,
    showFilters,
    currentPage,
    itemsPerPage,
    apiFilters,
    needsClientSideFiltering,
    handleFiltersChange,
    handlePageChange,
    handlePageSizeChange,
    toggleFilters,
  };
}

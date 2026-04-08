import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDialogState } from './useDialogState';
import type { PaginationData } from '@/domain/types';

interface UseCrudListOptions<TData, TFilters, TApiFilters> {
  /** Clave para React Query (ej: 'products') */
  queryKey: string;
  /** Función que llama al backend */
  queryFn: (apiFilters: TApiFilters) => Promise<TData[]>;
  /** Filtros iniciales del UI */
  initialFilters: TFilters;
  /** Convierte filtros de UI a filtros de API */
  filterAdapter: (filters: TFilters) => TApiFilters;
  /** Filtrado en cliente (búsqueda, etc). Si no se pasa, se usa la data tal cual */
  clientFilter?: (data: TData[], filters: TFilters) => TData[];
  /** Items por página por defecto */
  defaultPageSize?: number;
  /** Opciones de tamaño de página */
  pageSizeOptions?: number[];
  /** staleTime para React Query (ms) */
  staleTime?: number;
  /** Nombre de la entidad para mensajes de error (ej: 'productos') */
  entityName?: string;
  /** Si false, desactiva paginación (muestra todos). Default: true */
  paginated?: boolean;
}

/**
 * Hook genérico para páginas de listado CRUD.
 * Encapsula: query, filtros, paginación cliente, y estado de modales.
 */
export function useCrudList<TData, TFilters, TApiFilters = Record<string, unknown>>({
  queryKey,
  queryFn,
  initialFilters,
  filterAdapter,
  clientFilter,
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50],
  staleTime = 30000,
  paginated = true,
}: UseCrudListOptions<TData, TFilters, TApiFilters>) {
  // Filtros
  const [filters, setFiltersState] = useState<TFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultPageSize);

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const deleteDialog = useDialogState<TData>();

  const queryClient = useQueryClient();

  // Filtros para la API
  const apiFilters = useMemo(() => filterAdapter(filters), [filters, filterAdapter]);

  // Query
  const {
    data: rawData = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [queryKey, apiFilters],
    queryFn: () => queryFn(apiFilters),
    staleTime,
    retry: 1,
  });

  // Filtrado en cliente
  const filteredData = useMemo(() => {
    if (clientFilter) return clientFilter(rawData, filters);
    return rawData;
  }, [rawData, filters, clientFilter]);

  // Paginación
  const paginationData: PaginationData = useMemo(() => {
    if (!paginated) {
      return {
        currentPage: 1,
        totalPages: 1,
        totalItems: filteredData.length,
        itemsPerPage: filteredData.length,
      };
    }
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    return { currentPage, totalPages, totalItems, itemsPerPage };
  }, [filteredData.length, currentPage, itemsPerPage, paginated]);

  const paginatedData = useMemo(() => {
    if (!paginated) return filteredData;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage, paginated]);

  // Handlers
  const setFilters = useCallback((newFilters: TFilters) => {
    setFiltersState(newFilters);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  }, []);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  }, [queryClient, queryKey]);

  return {
    // Data
    rawData,
    filteredData,
    paginatedData,
    isLoading,
    error,
    refetch,

    // Filtros
    filters,
    setFilters,

    // Paginación
    paginationData,
    pageSizeOptions,
    handlePageChange,
    handlePageSizeChange,

    // Modales
    isCreateModalOpen,
    setIsCreateModalOpen,
    isCreating,
    setIsCreating,
    deleteDialog,

    // Utils
    invalidate,
    queryClient,
  };
}

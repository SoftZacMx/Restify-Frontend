import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/presentation/components/ui/select';
import type { PaginationData } from '@/domain/types';
import { cn } from '@/shared/lib/utils';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50];

interface OrderPaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  /** Opciones para el selector "por página" (ej: [10, 25, 50]) */
  pageSizeOptions?: number[];
  /** Callback al cambiar cantidad por página */
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * Componente OrderPagination
 * Responsabilidad única: Renderizar controles de paginación para la lista de órdenes
 */
export const OrderPagination: React.FC<OrderPaginationProps> = ({
  pagination,
  onPageChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
}) => {
  const { currentPage, totalPages, totalItems, itemsPerPage } = pagination;
  const showPageSizeSelector = Boolean(onPageSizeChange && pageSizeOptions?.length);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="px-4 pt-4 pb-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-lg shrink-0">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Mostrando{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">{startItem}</span>
            {' '}a{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">{endItem}</span>
            {' '}de{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">{totalItems}</span>
            {' '}órdenes
          </div>

          {showPageSizeSelector && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">Por página:</span>
              <Select
                value={String(itemsPerPage)}
                onValueChange={(v) => onPageSizeChange?.(Number(v))}
              >
                <SelectTrigger className="h-9 w-[5rem]">
                  <span>{itemsPerPage}</span>
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageClick(page)}
                className={cn(
                  'h-9 w-9 p-0',
                  currentPage === page && 'bg-primary text-white'
                )}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        )}
      </div>
    </div>
  );
};

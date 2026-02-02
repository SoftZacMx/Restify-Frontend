import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import type { ProductPaginationProps } from '@/domain/types';
import { cn } from '@/shared/lib/utils';

/**
 * Componente ProductPagination
 * Responsabilidad única: Renderizar controles de paginación
 * Cumple SRP: Solo maneja la UI de paginación
 */
export const ProductPagination: React.FC<ProductPaginationProps> = ({
  pagination,
  onPageChange,
}) => {
  const { currentPage, totalPages, totalItems, itemsPerPage } = pagination;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
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

  // Generar números de página a mostrar
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

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Información de resultados */}
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Mostrando <span className="font-medium text-slate-700 dark:text-slate-300">{startItem}</span> a{' '}
          <span className="font-medium text-slate-700 dark:text-slate-300">{endItem}</span> de{' '}
          <span className="font-medium text-slate-700 dark:text-slate-300">{totalItems}</span> productos
        </div>

        {/* Controles de paginación */}
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

          {/* Números de página */}
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
      </div>
    </div>
  );
};

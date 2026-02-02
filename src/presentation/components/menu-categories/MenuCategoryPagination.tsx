import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import type { PaginationData } from '@/domain/types';

interface MenuCategoryPaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

/**
 * Componente MenuCategoryPagination
 * Responsabilidad única: Manejar paginación de categorías
 * Cumple SRP: Solo maneja la navegación entre páginas
 */
export const MenuCategoryPagination: React.FC<MenuCategoryPaginationProps> = ({
  pagination,
  onPageChange,
}) => {
  const { currentPage, totalPages, totalItems, itemsPerPage } = pagination;

  // Calcular rango de items mostrados
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generar array de páginas para mostrar
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar primera, última y páginas cercanas a la actual
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="px-4 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Información de items */}
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Mostrando {startItem} - {endItem} de {totalItems} categorías
        </div>

        {/* Controles de paginación */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1">Anterior</span>
          </Button>

          <div className="hidden sm:flex items-center gap-1">
            {getPageNumbers().map((page, index) =>
              page === 'ellipsis' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-slate-400"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="min-w-[36px]"
                >
                  {page}
                </Button>
              )
            )}
          </div>

          {/* Indicador móvil */}
          <span className="sm:hidden text-sm text-slate-500 dark:text-slate-400">
            Página {currentPage} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only sm:not-sr-only sm:mr-1">Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

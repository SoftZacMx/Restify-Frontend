import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/presentation/components/ui/select';
import { cn } from '@/shared/lib/utils';

/**
 * Parámetros necesarios para el componente de paginación.
 * Permite al usuario: seleccionar página, ir a anterior/siguiente y elegir items por página.
 */
export interface PaginationProps {
  /** Página actual (1-based) */
  currentPage: number;
  /** Total de páginas */
  totalPages: number;
  /** Total de registros */
  totalItems: number;
  /** Cantidad de items por página */
  itemsPerPage: number;
  /** Etiqueta para el texto (ej: "gastos", "productos") */
  itemsLabel?: string;
  /** Opciones de items por página (ej: [10, 20, 50]). Si se pasa y onPageSizeChange existe, se muestra el selector */
  pageSizeOptions?: number[];
  /** Callback al cambiar de página */
  onPageChange: (page: number) => void;
  /** Callback al cambiar cantidad por página (opcional) */
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * Componente de paginación reutilizable.
 * - Texto: "Mostrando X a Y de Z {itemsLabel}"
 * - Selector de items por página (si pageSizeOptions y onPageSizeChange)
 * - Botón anterior / siguiente
 * - Números de página clicables
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  itemsLabel = 'elementos',
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const hasMultiplePages = totalPages > 1;
  const showPageSizeSelector = Boolean(onPageSizeChange && pageSizeOptions?.length);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Texto + selector de items por página */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Mostrando{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">{startItem}</span> a{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">{endItem}</span> de{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">{totalItems}</span>{' '}
            {itemsLabel}
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

        {/* Navegación: anterior, números, siguiente */}
        {hasMultiplePages && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="h-9 w-9 p-0"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={cn(
                    'h-9 w-9 p-0 min-w-9',
                    currentPage === page && 'bg-primary text-white'
                  )}
                  aria-label={`Ir a página ${page}`}
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
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import type { Category } from '@/domain/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

const pillBase =
  'rounded-full text-sm font-medium transition-colors py-2 px-4 whitespace-nowrap flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2';

/**
 * Filtro de categorías: 4 ítems por fila. Los dos primeros son "Todas" + 2 categorías;
 * el cuarto es "Mostrar más" y despliega el resto en un dropdown.
 */
export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
}) => {
  const visibleCategories = categories.slice(0, 2);
  const moreCategories = categories.slice(2);

  return (
    <div className="grid grid-cols-4 gap-2 shrink-0 pb-3">
      <button
        type="button"
        onClick={() => onCategorySelect(null)}
        className={cn(
          pillBase,
          selectedCategoryId === null
            ? 'bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-300'
        )}
      >
        Todas
      </button>

      {visibleCategories.map((category) => {
        const isSelected = selectedCategoryId === category.id;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategorySelect(category.id)}
            className={cn(
              pillBase,
              isSelected
                ? 'bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            {category.icon && <span className="text-base opacity-90">{category.icon}</span>}
            <span className="truncate">{category.name}</span>
          </button>
        );
      })}

      {/* Espacios vacíos para mantener siempre 4 columnas */}
      {Array.from({ length: 2 - visibleCategories.length }).map((_, i) => (
        <div key={`placeholder-${i}`} aria-hidden />
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            pillBase,
            'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          Mostrar más
          <ChevronDown className="h-4 w-4 opacity-70" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-[min(16rem,50vh)] overflow-y-auto">
          {moreCategories.length === 0 ? (
            <DropdownMenuItem onSelect={() => {}} className="text-slate-500 dark:text-slate-400">
              No hay más categorías
            </DropdownMenuItem>
          ) : (
            moreCategories.map((category) => {
              const isSelected = selectedCategoryId === category.id;
              return (
                <DropdownMenuItem
                  key={category.id}
                  onSelect={() => onCategorySelect(category.id)}
                  className={cn(isSelected && 'bg-primary/10 text-primary')}
                >
                  {category.icon && <span className="mr-2">{category.icon}</span>}
                  {category.name}
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

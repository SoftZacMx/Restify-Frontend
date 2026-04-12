import React from 'react';
import { cn } from '@/shared/lib/utils';
import type { Category } from '@/domain/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

const pillBase =
  'rounded-full text-sm font-medium transition-colors py-2 px-4 whitespace-nowrap flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2';

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
}) => {
  return (
    <div className="shrink-0 pb-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
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

        {categories.map((category) => {
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
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

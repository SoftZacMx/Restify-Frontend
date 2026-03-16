import React from 'react';
import { CategorySelectionItem, type CategorySelectionItemData } from './CategorySelectionItem';

interface CategorySelectionListProps {
  categories: CategorySelectionItemData[];
  selectedId: string | null;
  onSelect: (category: CategorySelectionItemData) => void;
}

/**
 * Lista de categorías para selección única.
 */
export const CategorySelectionList: React.FC<CategorySelectionListProps> = ({
  categories,
  selectedId,
  onSelect,
}) => {
  if (categories.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
        No hay categorías que coincidan con la búsqueda.
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
      {categories.map((category) => (
        <CategorySelectionItem
          key={category.id}
          category={category}
          selected={selectedId === category.id}
          onSelect={() => onSelect(category)}
        />
      ))}
    </div>
  );
};

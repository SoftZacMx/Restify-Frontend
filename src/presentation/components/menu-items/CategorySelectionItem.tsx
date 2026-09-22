import React from 'react';
import { FolderOpen } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface CategorySelectionItemData {
  id: string;
  name: string;
}

interface CategorySelectionItemProps {
  category: CategorySelectionItemData;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Un ítem de la lista de selección de categorías (nombre, selección única).
 */
export const CategorySelectionItem: React.FC<CategorySelectionItemProps> = ({
  category,
  selected,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-colors',
        'hover:bg-muted dark:hover:bg-card/50',
        selected
          ? 'border-primary bg-primary/10 dark:bg-primary/20 dark:border-primary'
          : 'border-border'
      )}
    >
      <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
        <FolderOpen className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-foreground truncate">
          {category.name}
        </p>
      </div>
      <div
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center',
          selected
            ? 'border-primary bg-primary dark:border-primary dark:bg-primary'
            : 'border-border'
        )}
      >
        {selected && (
          <span className="w-2 h-2 rounded-full bg-card" aria-hidden />
        )}
      </div>
    </button>
  );
};

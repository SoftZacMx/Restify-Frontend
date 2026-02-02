import React from 'react';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { Category } from '@/domain/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

/**
 * Componente CategoryFilter
 * Responsabilidad única: Permitir filtrar productos por categoría
 * Cumple SRP: Solo maneja el filtrado por categoría
 */
export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button
        variant={selectedCategoryId === null ? 'default' : 'outline'}
        onClick={() => onCategorySelect(null)}
        className={cn(
          'whitespace-nowrap',
          selectedCategoryId === null && 'bg-primary text-white'
        )}
      >
        Todas
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategoryId === category.id ? 'default' : 'outline'}
          onClick={() => onCategorySelect(category.id)}
          className={cn(
            'whitespace-nowrap flex items-center gap-2',
            selectedCategoryId === category.id && 'bg-primary text-white'
          )}
        >
          {category.icon && <span>{category.icon}</span>}
          <span>{category.name}</span>
        </Button>
      ))}
    </div>
  );
};

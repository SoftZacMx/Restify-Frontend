import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from '@/presentation/components/ui/dialog';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { CategorySelectionList } from './CategorySelectionList';
import type { CategorySelectionItemData } from './CategorySelectionItem';

interface SelectCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategorySelectionItemData[];
  onSelect: (category: CategorySelectionItemData | null) => void;
}

/**
 * Diálogo para seleccionar una categoría de menú: búsqueda por nombre y lista con selección única.
 * Permite elegir "Sin categoría" para dejar el platillo sin categoría.
 */
export const SelectCategoryDialog: React.FC<SelectCategoryDialogProps> = ({
  open,
  onOpenChange,
  categories,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategorySelectionItemData | null>(null);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.trim().toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, searchQuery]);

  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedCategory(null);
    }
  }, [open]);

  const handleConfirm = () => {
    onSelect(selectedCategory);
    onOpenChange(false);
  };

  const handleSelectNone = () => {
    onSelect(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="pr-8">Seleccionar categoría</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0 flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          <CategorySelectionList
            categories={filteredCategories}
            selectedId={selectedCategory?.id ?? null}
            onSelect={setSelectedCategory}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handleSelectNone}>
            Sin categoría
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!selectedCategory}>
            Seleccionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

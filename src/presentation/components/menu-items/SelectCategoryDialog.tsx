import React, { useState, useMemo, useEffect } from 'react';
import { Search, LayoutGrid } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/presentation/components/ui/dialog';
import { Input } from '@/presentation/components/ui/input';
import { CategorySelectionList } from './CategorySelectionList';
import type { CategorySelectionItemData } from './CategorySelectionItem';

interface SelectCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategorySelectionItemData[];
  onSelect: (category: CategorySelectionItemData | null) => void;
}

export const SelectCategoryDialog: React.FC<SelectCategoryDialogProps> = ({
  open,
  onOpenChange,
  categories,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.trim().toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, searchQuery]);

  useEffect(() => {
    if (open) {
      setSearchQuery('');
    }
  }, [open]);

  const handleSelect = (category: CategorySelectionItemData | null) => {
    onSelect(category);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="pr-8">Seleccionar categoría</DialogTitle>
          <DialogClose />
          <p className="text-sm text-muted-foreground">
            Elige la categoría del platillo · {categories.length} categorías
          </p>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0 flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-12"
              autoFocus
            />
          </div>

          <div className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className="w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-colors border-border hover:bg-muted dark:hover:bg-card/50"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                <LayoutGrid className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-foreground truncate">
                  Sin categoría
                </p>
              </div>
            </button>

            <CategorySelectionList
              categories={filteredCategories}
              selectedId={null}
              onSelect={(cat) => handleSelect(cat)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

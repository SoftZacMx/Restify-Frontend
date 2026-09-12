import React, { useState, useMemo } from 'react';
import { Search, LayoutGrid } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { cn } from '@/shared/lib/utils';
import type { Category } from '@/domain/types';

interface CategorySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

/**
 * Diálogo para elegir categoría (reemplaza el dropdown "Mostrar más").
 * Incluye búsqueda y lista de categorías en formato de tarjetas.
 */
export const CategorySelectionDialog: React.FC<CategorySelectionDialogProps> = ({
  open,
  onOpenChange,
  categories,
  selectedCategoryId,
  onCategorySelect,
}) => {
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.trim().toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.description?.toLowerCase().includes(q))
    );
  }, [categories, search]);

  const handleSelect = (categoryId: string | null) => {
    onCategorySelect(categoryId);
    onOpenChange(false);
  };

  React.useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(28rem,95vw)] max-h-[90vh] flex flex-col bg-white dark:bg-background border border-slate-200 dark:border-border p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-border shrink-0">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white pr-10">
            Categorías
          </DialogTitle>
          <DialogClose className="text-slate-500 dark:text-white hover:bg-slate-100 dark:hover:bg-card rounded-lg p-1.5 right-4 top-4" />
        </DialogHeader>

        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Buscar categorías..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-card border-slate-200 dark:border-border"
              aria-label="Buscar categorías"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-2">
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={cn(
              'w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors',
              selectedCategoryId === null
                ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary'
                : 'border-slate-200 dark:border-border bg-slate-50 dark:bg-card/50 hover:border-slate-300 dark:hover:border-border text-slate-900 dark:text-white'
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-card">
              <LayoutGrid className="h-5 w-5 text-slate-600 dark:text-muted-foreground" />
            </div>
            <span className="font-medium">Todas</span>
          </button>

          {filteredCategories.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-muted-foreground py-4 text-center">
              No hay categorías que coincidan
            </p>
          ) : (
            filteredCategories.map((category) => {
              const isSelected = selectedCategoryId === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelect(category.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary'
                      : 'border-slate-200 dark:border-border bg-slate-50 dark:bg-card/50 hover:border-slate-300 dark:hover:border-border text-slate-900 dark:text-white'
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 dark:bg-primary/30 text-primary">
                    {category.icon ? (
                      <span className="text-lg">{category.icon}</span>
                    ) : (
                      <LayoutGrid className="h-5 w-5" />
                    )}
                  </div>
                  <span className="font-medium truncate">{category.name}</span>
                </button>
              );
            })
          )}
        </div>

        <footer className="shrink-0 px-6 py-4 border-t border-slate-200 dark:border-border flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
};

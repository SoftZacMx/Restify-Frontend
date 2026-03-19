import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X, UtensilsCrossed } from 'lucide-react';
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
import type { PosProduct } from '@/domain/types';
import type { Category } from '@/domain/types';

interface ExtrasSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableExtras: PosProduct[];
  categories: Category[];
  /** Extras ya seleccionados (al abrir el diálogo) */
  initialSelectedExtras: PosProduct[];
  /** Se llama al hacer "Aplicar Cambios" con la lista de extras elegidos */
  onApply: (selectedExtras: PosProduct[]) => void;
}

function groupExtrasByCategory(
  extras: PosProduct[],
  categories: Category[]
): { categoryName: string; categoryId: string; extras: PosProduct[] }[] {
  const byId = new Map<string, PosProduct[]>();
  const categoryNames = new Map(categories.map((c) => [c.id, c.name]));

  for (const extra of extras) {
    const id = extra.categoryId || 'other';
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id)!.push(extra);
  }

  return Array.from(byId.entries()).map(([categoryId, items]) => ({
    categoryId,
    categoryName: categoryNames.get(categoryId) || 'Extras',
    extras: items,
  }));
}

function filterExtrasBySearch(extras: PosProduct[], query: string): PosProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return extras;
  return extras.filter((extra) => {
    if (extra.name.toLowerCase().includes(q)) return true;
    if (extra.description?.trim()) {
      return extra.description.toLowerCase().includes(q);
    }
    return false;
  });
}

/**
 * Diálogo independiente para elegir extras (Personaliza tu plato).
 * Se abre desde el diálogo de agregar producto al hacer clic en "Ver Extras Disponibles".
 */
export const ExtrasSelectionDialog: React.FC<ExtrasSelectionDialogProps> = ({
  open,
  onOpenChange,
  availableExtras,
  categories,
  initialSelectedExtras,
  onApply,
}) => {
  const [selectedExtras, setSelectedExtras] = useState<PosProduct[]>(initialSelectedExtras);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    if (open) {
      setSelectedExtras(initialSelectedExtras);
      setSearchQuery('');
    }
  }, [open, initialSelectedExtras]);

  const handleExtraToggle = (extra: PosProduct) => {
    setSelectedExtras((prev) => {
      const isSelected = prev.some((e) => e.id === extra.id);
      if (isSelected) return prev.filter((e) => e.id !== extra.id);
      return [...prev, extra];
    });
  };

  const removeExtra = (extra: PosProduct) => {
    setSelectedExtras((prev) => prev.filter((e) => e.id !== extra.id));
  };

  const handleApply = () => {
    onApply(selectedExtras);
    onOpenChange(false);
  };

  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);

  const filteredExtras = useMemo(
    () => filterExtrasBySearch(availableExtras, searchQuery),
    [availableExtras, searchQuery]
  );
  const grouped = useMemo(
    () => groupExtrasByCategory(filteredExtras, categories),
    [filteredExtras, categories]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(28rem,95vw)] max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0 overflow-hidden">
        <DialogHeader className="flex-row items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
            <SlidersHorizontal className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white flex-1">
            Personaliza tu plato
          </DialogTitle>
          <DialogClose />
        </DialogHeader>

        {/* Search: filter extras by name (and description) as user types */}
        <div className="shrink-0 px-6 pb-3 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
              aria-hidden
            />
            <Input
              id="extras-search-input"
              name="extrasSearch"
              type="search"
              inputMode="search"
              autoComplete="off"
              spellCheck={false}
              placeholder="Buscar extra por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
              aria-label="Buscar extras por nombre"
            />
          </div>
        </div>

        {/* Lista de extras disponibles: ocupa el espacio central con scroll */}
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto px-6 py-4">
          <div className="space-y-5">
            {grouped.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {availableExtras.length === 0
                  ? 'No hay extras disponibles'
                  : 'No hay extras que coincidan con la búsqueda'}
              </p>
            ) : (
              grouped.map(({ categoryName, extras: items }) => (
                <div key={categoryName}>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                    {categoryName}
                  </h3>
                  <ul className="space-y-3">
                    {items.map((extra) => {
                      const isSelected = selectedExtras.some((e) => e.id === extra.id);
                      return (
                        <li
                          key={extra.id}
                          className={cn(
                            'flex items-center justify-between gap-3 py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0 cursor-pointer rounded-lg px-2 -mx-2 hover:bg-slate-50 dark:hover:bg-slate-800/50',
                            isSelected && 'bg-primary/5 dark:bg-primary/10'
                          )}
                          onClick={() => handleExtraToggle(extra)}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {extra.name}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              +${extra.price.toFixed(2)}
                            </p>
                          </div>
                          <div
                            className={cn(
                              'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-slate-300 dark:border-slate-600 bg-transparent'
                            )}
                            aria-hidden
                          >
                            {isSelected && (
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sección fija de ítems seleccionados: altura fija con overflow */}
        <div className="shrink-0 px-6 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Extras seleccionados
          </p>
          <div className="h-24 min-h-24 max-h-28 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
            {selectedExtras.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <UtensilsCrossed className="h-10 w-10 mb-1 opacity-60" />
                <span className="text-xs font-medium">Ninguno</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedExtras.map((extra) => (
                  <span
                    key={extra.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                  >
                    {extra.name}
                    <button
                      type="button"
                      onClick={() => removeExtra(extra)}
                      className="rounded-full p-0.5 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/50"
                      aria-label={`Quitar ${extra.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <footer className="shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Total de Extras
            </span>
            <span className="text-lg font-bold text-primary">${extrasTotal.toFixed(2)}</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleApply}>
              Aplicar Cambios
            </Button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
};

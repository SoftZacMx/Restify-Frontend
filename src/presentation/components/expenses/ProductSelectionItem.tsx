import React from 'react';
import { Package } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/presentation/components/ui/badge';

export interface ProductSelectionItemData {
  id: string;
  name: string;
  status: boolean;
  /** Si está presente, el dialog puede filtrar por `onlyTracked`. */
  trackStock?: boolean;
}

interface ProductSelectionItemProps {
  product: ProductSelectionItemData;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Un ítem de la lista de selección de productos (nombre, estado, selección única).
 */
export const ProductSelectionItem: React.FC<ProductSelectionItemProps> = ({
  product,
  selected,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-4 p-3 rounded-lg border text-left transition-colors',
        'hover:bg-slate-50 dark:hover:bg-card/50',
        selected
          ? 'border-primary bg-primary/10 dark:bg-primary/20/30 dark:border-primary'
          : 'border-slate-200 dark:border-border'
      )}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-100 dark:bg-card flex items-center justify-center">
        <Package className="h-6 w-6 text-slate-500 dark:text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 dark:text-white truncate">
          {product.name}
        </p>
        <div className="mt-1">
          <Badge
            variant={product.status ? 'default' : 'secondary'}
            className={cn(
              'text-xs',
              product.status
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-0'
                : 'bg-slate-100 text-slate-600 dark:bg-card dark:text-foreground'
            )}
          >
            {product.status ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>
      <div
        className={cn(
          'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center',
          selected
            ? 'border-primary bg-primary dark:border-primary dark:bg-primary'
            : 'border-slate-300 dark:border-border'
        )}
      >
        {selected && (
          <span className="w-1.5 h-1.5 rounded-full bg-white" aria-hidden />
        )}
      </div>
    </button>
  );
};

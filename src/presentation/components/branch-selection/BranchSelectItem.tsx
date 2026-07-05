import React from 'react';
import { Store, Check } from 'lucide-react';
import type { AccessibleBranch } from '@/domain/types';
import { cn } from '@/shared/lib/utils';

interface BranchSelectItemProps {
  branch: AccessibleBranch;
  selected: boolean;
  onSelect: (branchId: string) => void;
  disabled?: boolean;
}

/**
 * Una fila/card de sucursal en la pantalla de selección.
 * Hoy muestra solo ícono + nombre (lo único que provee el login); está aislada para
 * poder extenderla (dirección, badge, etc.) sin tocar la página ni la lista.
 */
export const BranchSelectItem: React.FC<BranchSelectItemProps> = ({
  branch,
  selected,
  onSelect,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(branch.id)}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        selected
          ? 'border-primary bg-primary/10'
          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          selected
            ? 'bg-primary text-primary-foreground'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
        )}
      >
        <Store className="h-5 w-5" />
      </span>
      <span className="flex-1 truncate font-medium text-slate-900 dark:text-white">
        {branch.name}
      </span>
      {selected && <Check className="h-5 w-5 shrink-0 text-primary" />}
    </button>
  );
};

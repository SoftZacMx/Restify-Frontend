import React from 'react';
import { User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface EmployeeSelectionItemData {
  id: string;
  name: string;
  last_name: string;
  email: string;
  rol: string;
}

interface EmployeeSelectionItemProps {
  employee: EmployeeSelectionItemData;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Un ítem de la lista de selección de empleados (nombre, email, rol).
 */
export const EmployeeSelectionItem: React.FC<EmployeeSelectionItemProps> = ({
  employee,
  selected,
  onSelect,
}) => {
  const fullName = `${employee.name} ${employee.last_name}`.trim() || employee.email;
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
        <User className="h-6 w-6 text-slate-500 dark:text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 dark:text-white truncate">
          {fullName}
        </p>
        <p className="text-sm text-slate-500 dark:text-muted-foreground truncate mt-0.5">
          {employee.email}
        </p>
        {employee.rol && (
          <p className="text-xs text-slate-400 dark:text-muted-foreground mt-0.5">
            {employee.rol}
          </p>
        )}
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

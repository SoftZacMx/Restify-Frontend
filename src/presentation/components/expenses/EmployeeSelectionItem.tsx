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
        'hover:bg-slate-50 dark:hover:bg-slate-800/50',
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-500'
          : 'border-slate-200 dark:border-slate-700'
      )}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <User className="h-6 w-6 text-slate-500 dark:text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 dark:text-white truncate">
          {fullName}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {employee.email}
        </p>
        {employee.rol && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {employee.rol}
          </p>
        )}
      </div>
      <div
        className={cn(
          'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center',
          selected
            ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500'
            : 'border-slate-300 dark:border-slate-600'
        )}
      >
        {selected && (
          <span className="w-1.5 h-1.5 rounded-full bg-white" aria-hidden />
        )}
      </div>
    </button>
  );
};

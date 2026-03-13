import React from 'react';
import { EmployeeSelectionItem, type EmployeeSelectionItemData } from './EmployeeSelectionItem';

interface EmployeeSelectionListProps {
  employees: EmployeeSelectionItemData[];
  selectedId: string | null;
  onSelect: (employee: EmployeeSelectionItemData) => void;
}

/**
 * Lista de empleados para selección única.
 */
export const EmployeeSelectionList: React.FC<EmployeeSelectionListProps> = ({
  employees,
  selectedId,
  onSelect,
}) => {
  if (employees.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
        No hay empleados que coincidan con la búsqueda.
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
      {employees.map((employee) => (
        <EmployeeSelectionItem
          key={employee.id}
          employee={employee}
          selected={selectedId === employee.id}
          onSelect={() => onSelect(employee)}
        />
      ))}
    </div>
  );
};

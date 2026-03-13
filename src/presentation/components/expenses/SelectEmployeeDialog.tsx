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
import { EmployeeSelectionList } from './EmployeeSelectionList';
import type { EmployeeSelectionItemData } from './EmployeeSelectionItem';

interface SelectEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: EmployeeSelectionItemData[];
  onSelect: (employee: EmployeeSelectionItemData) => void;
}

/**
 * Diálogo para seleccionar un empleado: búsqueda por nombre o email y lista con selección única.
 */
export const SelectEmployeeDialog: React.FC<SelectEmployeeDialogProps> = ({
  open,
  onOpenChange,
  employees,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSelectionItemData | null>(null);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.trim().toLowerCase();
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.last_name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.rol?.toLowerCase().includes(q)
    );
  }, [employees, searchQuery]);

  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedEmployee(null);
    }
  }, [open]);

  const handleConfirm = () => {
    if (selectedEmployee) {
      onSelect(selectedEmployee);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="pr-8">Seleccionar Empleado</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0 flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          <EmployeeSelectionList
            employees={filteredEmployees}
            selectedId={selectedEmployee?.id ?? null}
            onSelect={setSelectedEmployee}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!selectedEmployee}>
            Seleccionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

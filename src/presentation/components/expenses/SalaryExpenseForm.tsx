import React, { useState } from 'react';
import { User } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Button } from '@/presentation/components/ui/button';
import { SelectEmployeeDialog } from './SelectEmployeeDialog';
import type { EmployeeUser } from '@/domain/types';

interface SalaryExpenseFormProps {
  employees: EmployeeUser[];
  selectedEmployee: { id: string; name: string; last_name: string; email: string; rol: string } | null;
  onEmployeeSelect: (employee: { id: string; name: string; last_name: string; email: string; rol: string } | null) => void;
  onAmountChange: (amount: number) => void;
}

/**
 * Componente SalaryExpenseForm
 * Responsabilidad única: Manejar pago de salarios (selección de empleado por diálogo + monto).
 */
export const SalaryExpenseForm: React.FC<SalaryExpenseFormProps> = ({
  employees,
  selectedEmployee,
  onEmployeeSelect,
  onAmountChange,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState<string>('');

  const employeeListForDialog = employees.map((e) => ({
    id: e.id,
    name: e.name,
    last_name: e.last_name,
    email: e.email,
    rol: e.rol,
  }));

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numAmount = parseFloat(value) || 0;
    onAmountChange(numAmount);
  };

  const handleSelectEmployee = (employee: { id: string; name: string; last_name: string; email: string; rol: string }) => {
    onEmployeeSelect(employee);
    setDialogOpen(false);
  };

  const fullName = selectedEmployee
    ? `${selectedEmployee.name} ${selectedEmployee.last_name}`.trim() || selectedEmployee.email
    : '';

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="space-y-2">
        <Label>Empleado</Label>
        {selectedEmployee ? (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{fullName}</p>
              <p className="text-sm text-muted-foreground truncate">{selectedEmployee.email}</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
              Cambiar
            </Button>
          </div>
        ) : (
          <Button type="button" variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => setDialogOpen(true)}>
            <User className="h-4 w-4 mr-2" />
            Seleccionar empleado
          </Button>
        )}
      </div>

      <SelectEmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employees={employeeListForDialog}
        onSelect={handleSelectEmployee}
      />

      <div className="space-y-2">
        <Label htmlFor="salaryAmount">Monto del Pago</Label>
        <Input
          id="salaryAmount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder="0.00"
        />
      </div>
    </div>
  );
};

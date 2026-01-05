import React, { useState } from 'react';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/presentation/components/ui/select';
import type { EmployeeUser } from '@/domain/types';

interface SalaryExpenseFormProps {
  employees: EmployeeUser[];
  onAmountChange: (amount: number) => void;
}

/**
 * Componente SalaryExpenseForm
 * Responsabilidad única: Manejar pago de salarios
 * Cumple SRP: Solo maneja la lógica de pagos de salarios
 */
export const SalaryExpenseForm: React.FC<SalaryExpenseFormProps> = ({
  employees,
  onAmountChange,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numAmount = parseFloat(value) || 0;
    onAmountChange(numAmount);
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="space-y-2">
        <Label htmlFor="employee">Empleado</Label>
        <Select
          value={selectedEmployee}
          onValueChange={setSelectedEmployee}
        >
          <SelectTrigger id="employee">
            {selectedEmployee
              ? employees.find((e) => e.id === selectedEmployee)?.name
              : 'Seleccionar empleado'}
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {`${employee.name} ${employee.last_name} - ${employee.email}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="salaryAmount">Monto del Pago</Label>
        <Input
          id="salaryAmount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder="$ 0.00"
        />
      </div>
    </div>
  );
};



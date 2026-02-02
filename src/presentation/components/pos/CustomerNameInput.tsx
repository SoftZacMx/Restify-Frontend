import React from 'react';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';

interface CustomerNameInputProps {
  customerName: string;
  onCustomerNameChange: (name: string) => void;
}

/**
 * Componente CustomerNameInput
 * Responsabilidad única: Permitir ingresar el nombre del cliente
 * Cumple SRP: Solo maneja el input del nombre del cliente
 */
export const CustomerNameInput: React.FC<CustomerNameInputProps> = ({
  customerName,
  onCustomerNameChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="customer-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Nombre del Cliente
      </Label>
      <Input
        id="customer-name"
        type="text"
        placeholder="Ingrese el nombre del cliente"
        value={customerName}
        onChange={(e) => onCustomerNameChange(e.target.value)}
        className="w-full"
      />
    </div>
  );
};

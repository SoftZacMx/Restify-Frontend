import React, { useState } from 'react';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';

interface ServiceExpenseFormProps {
  onAmountChange: (amount: number) => void;
}

/**
 * Componente ServiceExpenseForm
 * Responsabilidad única: Manejar monto de servicios
 * Cumple SRP: Solo maneja la lógica de servicios
 */
export const ServiceExpenseForm: React.FC<ServiceExpenseFormProps> = ({
  onAmountChange,
}) => {
  const [amount, setAmount] = useState<string>('');

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numAmount = parseFloat(value) || 0;
    onAmountChange(numAmount);
  };

  return (
    <div className="space-y-2 border-t pt-4">
      <Label htmlFor="serviceAmount">Cantidad pagada</Label>
      <Input
        id="serviceAmount"
        type="number"
        step="0.01"
        min="0"
        value={amount}
        onChange={(e) => handleAmountChange(e.target.value)}
        placeholder="0.00"
      />
    </div>
  );
};



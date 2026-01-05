import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/presentation/store/auth.store';
import { ProductRepository } from '@/infrastructure/api/repositories/product.repository';
import { UserRepository } from '@/infrastructure/api/repositories/user.repository';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Button } from '@/presentation/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/presentation/components/ui/select';
import type {
  CreateExpenseRequest,
  ExpenseType,
  PaymentMethod,
  Product,
  CreateExpenseItemRequest,
  UnitOfMeasure,
} from '@/domain/types';
import { getExpenseTypeLabel, getPaymentMethodLabel } from '@/shared/utils';
import { MerchandiseExpenseForm } from './MerchandiseExpenseForm';
import { ServiceExpenseForm } from './ServiceExpenseForm';
import { SalaryExpenseForm } from './SalaryExpenseForm';
import { cn } from '@/shared/lib/utils';

interface CreateExpenseFormProps {
  onSubmit: (expenseData: CreateExpenseRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const productRepository = new ProductRepository();
const userRepository = new UserRepository();

/**
 * Componente CreateExpenseForm
 * Responsabilidad única: Manejar el formulario de creación de gastos
 * Cumple SRP: Solo maneja la lógica del formulario
 */
export const CreateExpenseForm: React.FC<CreateExpenseFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { user } = useAuthStore();
  const [expenseType, setExpenseType] = useState<ExpenseType | ''>('');
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [subtotal, setSubtotal] = useState<string>('0.00');
  const [iva, setIva] = useState<string>('0.00');
  const [total, setTotal] = useState<string>('0.00');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [merchandiseItems, setMerchandiseItems] = useState<CreateExpenseItemRequest[]>([]);

  // Cargar productos para compra de mercancía
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await productRepository.listProducts({ status: 'true' });
      return response.data || [];
    },
    enabled: expenseType === 'MERCHANDISE',
  });

  // Cargar usuarios para pagos de salarios (solo no clientes)
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await userRepository.listUsers({ status: 'true' });
      // Filtrar solo usuarios que no sean clientes (todos los roles excepto CLIENT si existe)
      return (response.data || []).filter((u) => u.rol !== 'CLIENT');
    },
    enabled: expenseType === 'OTHER', // Usaremos OTHER para pagos de salarios temporalmente
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!expenseType) {
      newErrors.type = 'El tipo de gasto es requerido';
    }

    if (!date) {
      newErrors.date = 'La fecha es requerida';
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = 'El método de pago es requerido';
    }

    const subtotalNum = parseFloat(subtotal);
    const ivaNum = parseFloat(iva);
    const totalNum = parseFloat(total);

    if (isNaN(subtotalNum) || subtotalNum <= 0) {
      newErrors.subtotal = 'El subtotal debe ser mayor a 0';
    }

    if (isNaN(ivaNum) || ivaNum < 0) {
      newErrors.iva = 'El IVA no puede ser negativo';
    }

    if (isNaN(totalNum) || totalNum <= 0) {
      newErrors.total = 'El total debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      setErrors({ userId: 'Usuario no encontrado' });
      return;
    }

    const expenseData: CreateExpenseRequest = {
      type: expenseType as ExpenseType,
      date: new Date(date).toISOString(),
      total: parseFloat(total),
      subtotal: parseFloat(subtotal),
      iva: parseFloat(iva),
      description: description || null,
      paymentMethod: paymentMethod as PaymentMethod,
      userId: user.id,
      ...(expenseType === 'MERCHANDISE' && merchandiseItems.length > 0
        ? { items: merchandiseItems }
        : {}),
    };

    await onSubmit(expenseData);
  };

  const handleSubtotalChange = (value: string) => {
    setSubtotal(value);
    const subtotalNum = parseFloat(value) || 0;
    const ivaNum = parseFloat(iva) || 0;
    const newTotal = subtotalNum + ivaNum;
    setTotal(newTotal.toFixed(2));
  };

  const handleIvaChange = (value: string) => {
    setIva(value);
    const subtotalNum = parseFloat(subtotal) || 0;
    const ivaNum = parseFloat(value) || 0;
    const newTotal = subtotalNum + ivaNum;
    setTotal(newTotal.toFixed(2));
  };

  const expenseTypes: ExpenseType[] = [
    'SERVICE_BUSINESS',
    'UTILITY',
    'RENT',
    'MERCHANDISE',
    'OTHER',
  ];

  const paymentMethods: PaymentMethod[] = [1, 2, 3];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de gasto y Fecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">
            Tipo de gasto <span className="text-red-500">*</span>
          </Label>
          <Select
            value={expenseType}
            onValueChange={(value) => {
              setExpenseType(value as ExpenseType);
              setErrors({});
            }}
          >
            <SelectTrigger
              id="type"
              className={cn(errors.type && 'border-red-500')}
            >
              {expenseType ? getExpenseTypeLabel(expenseType) : 'Seleccionar tipo'}
            </SelectTrigger>
            <SelectContent>
              {expenseTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {getExpenseTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-red-500">{errors.type}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">
            Fecha <span className="text-red-500">*</span>
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={cn(errors.date && 'border-red-500')}
          />
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date}</p>
          )}
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Añade una descripción detallada del gasto..."
          className="flex min-h-[100px] w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Método de pago */}
      <div className="space-y-2">
        <Label htmlFor="paymentMethod">
          Método de pago <span className="text-red-500">*</span>
        </Label>
        <Select
          value={paymentMethod.toString()}
          onValueChange={(value) => setPaymentMethod(Number(value) as PaymentMethod)}
        >
          <SelectTrigger
            id="paymentMethod"
            className={cn(errors.paymentMethod && 'border-red-500')}
          >
            {paymentMethod
              ? getPaymentMethodLabel(paymentMethod)
              : 'Seleccionar método'}
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.map((method) => (
              <SelectItem key={method} value={method.toString()}>
                {getPaymentMethodLabel(method)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.paymentMethod && (
          <p className="text-sm text-red-500">{errors.paymentMethod}</p>
        )}
      </div>

      {/* Formularios específicos por tipo */}
      {expenseType === 'MERCHANDISE' && (
        <MerchandiseExpenseForm
          products={products}
          onItemsChange={(items) => {
            setMerchandiseItems(items);
            const itemsSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
            const itemsTotal = items.reduce((sum, item) => sum + item.total, 0);
            const calculatedIva = itemsTotal - itemsSubtotal;
            setSubtotal(itemsSubtotal.toFixed(2));
            setIva(calculatedIva.toFixed(2));
            setTotal(itemsTotal.toFixed(2));
          }}
        />
      )}

      {expenseType === 'SERVICE_BUSINESS' && (
        <ServiceExpenseForm
          onAmountChange={(amount) => {
            setSubtotal(amount.toFixed(2));
            setIva('0.00');
            setTotal(amount.toFixed(2));
          }}
        />
      )}

      {expenseType === 'UTILITY' && (
        <ServiceExpenseForm
          onAmountChange={(amount) => {
            setSubtotal(amount.toFixed(2));
            setIva('0.00');
            setTotal(amount.toFixed(2));
          }}
        />
      )}

      {expenseType === 'RENT' && (
        <ServiceExpenseForm
          onAmountChange={(amount) => {
            setSubtotal(amount.toFixed(2));
            setIva('0.00');
            setTotal(amount.toFixed(2));
          }}
        />
      )}

      {expenseType === 'OTHER' && (
        <SalaryExpenseForm
          employees={employees}
          onAmountChange={(amount) => {
            setSubtotal(amount.toFixed(2));
            setIva('0.00');
            setTotal(amount.toFixed(2));
          }}
        />
      )}

      {/* Totales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
        <div className="space-y-2">
          <Label htmlFor="subtotal">
            Subtotal <span className="text-red-500">*</span>
          </Label>
          <Input
            id="subtotal"
            type="number"
            step="0.01"
            min="0"
            value={subtotal}
            onChange={(e) => handleSubtotalChange(e.target.value)}
            className={cn(errors.subtotal && 'border-red-500')}
          />
          {errors.subtotal && (
            <p className="text-sm text-red-500">{errors.subtotal}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="iva">
            IVA <span className="text-red-500">*</span>
          </Label>
          <Input
            id="iva"
            type="number"
            step="0.01"
            min="0"
            value={iva}
            onChange={(e) => handleIvaChange(e.target.value)}
            className={cn(errors.iva && 'border-red-500')}
          />
          {errors.iva && (
            <p className="text-sm text-red-500">{errors.iva}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="total">Total (Calculado)</Label>
          <Input
            id="total"
            type="number"
            step="0.01"
            value={total}
            readOnly
            className="bg-slate-100 dark:bg-slate-800"
          />
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar Gasto'}
        </Button>
      </div>
    </form>
  );
};


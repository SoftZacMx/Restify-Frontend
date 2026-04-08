import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Info,
  Calendar,
  CreditCard,
  Save,
  Wrench,
  Zap,
  Building2,
  Package,
  Banknote,
  FileText,
  type LucideIcon,
} from 'lucide-react';
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
  CreateExpenseItemRequest,
} from '@/domain/types';
import { getExpenseTypeLabel, getPaymentMethodLabel, formatCurrency } from '@/shared/utils';
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
  const [title, setTitle] = useState<string>('');
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
  const [salaryEmployee, setSalaryEmployee] = useState<{ id: string; name: string; last_name: string; email: string; rol: string } | null>(null);

  // Cargar productos para compra de mercancía
  const productsQueryEnabled: boolean = expenseType === 'MERCHANDISE';
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await productRepository.listProducts({ status: true });
      return response.data ?? [];
    },
    enabled: productsQueryEnabled,
  });

  // Cargar usuarios para pagos de salarios (solo no clientes)
  const employeesQueryEnabled = expenseType === 'SALARY';
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await userRepository.listUsers({ status: 'true' });
      // Filtrar solo usuarios que no sean clientes (todos los roles excepto CLIENT si existe)
      return (response.data || []).filter((u) => (u.rol as string) !== 'CLIENT');
    },
    enabled: employeesQueryEnabled,
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const titleTrim = title?.trim() ?? '';
    if (!titleTrim) {
      newErrors.title = 'El título del gasto es requerido (mín. 1 carácter)';
    } else if (titleTrim.length > 200) {
      newErrors.title = 'El título no puede superar 200 caracteres';
    }

    if (!expenseType) {
      newErrors.type = 'El tipo de gasto es requerido';
    }

    if (expenseType === 'MERCHANDISE' && (!merchandiseItems || merchandiseItems.length === 0)) {
      newErrors.merchandiseItemsRequired = 'Debes agregar al menos un ítem para gastos de tipo Mercancía';
    }

    if (expenseType === 'SALARY' && !salaryEmployee) {
      newErrors.salaryEmployee = 'Debes seleccionar un empleado';
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

    const descriptionForSubmit =
      expenseType === 'SALARY' && salaryEmployee
        ? `Empleado: ${salaryEmployee.name} ${salaryEmployee.last_name} (${salaryEmployee.email})`
        : description?.trim() || null;

    const base = {
      title: title.trim(),
      type: expenseType as ExpenseType,
      date: new Date(date).toISOString(),
      total: parseFloat(total),
      subtotal: parseFloat(subtotal),
      iva: parseFloat(iva),
      description: descriptionForSubmit,
      paymentMethod: paymentMethod as PaymentMethod,
      userId: user.id,
    };
    const expenseData: CreateExpenseRequest =
      expenseType === 'MERCHANDISE' && merchandiseItems.length > 0
        ? { ...base, type: 'MERCHANDISE', items: merchandiseItems }
        : { ...base, type: base.type as 'SERVICE_BUSINESS' | 'UTILITY' | 'RENT' | 'SALARY' | 'OTHER' };

    await onSubmit(expenseData);
  };

  const expenseTypes: ExpenseType[] = [
    'SERVICE_BUSINESS',
    'UTILITY',
    'RENT',
    'MERCHANDISE',
    'SALARY',
    'OTHER',
  ];

  const expenseTypeIcons: Record<ExpenseType, LucideIcon> = {
    SERVICE_BUSINESS: Wrench,
    UTILITY: Zap,
    RENT: Building2,
    MERCHANDISE: Package,
    SALARY: Banknote,
    OTHER: FileText,
  };

  const paymentMethods: PaymentMethod[] = [1, 2, 3];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información General */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
            <Info className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Información General
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">
              Título del Gasto <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Mercancía Proveedor Central"
              className={cn(errors.title && 'border-red-500')}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {title.length}/200 caracteres
            </p>
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">
              Tipo de Gasto <span className="text-red-500">*</span>
            </Label>
            <Select
              value={expenseType}
              onValueChange={(value) => {
                const type = value as ExpenseType;
                setExpenseType(type);
                setTitle(getExpenseTypeLabel(type));
                setErrors({});
                if (value !== 'SALARY') setSalaryEmployee(null);
              }}
            >
              <SelectTrigger
                id="type"
                className={cn(errors.type && 'border-red-500')}
              >
                {expenseType ? (
                  <span className="flex items-center gap-2">
                    {React.createElement(expenseTypeIcons[expenseType], {
                      className: 'h-4 w-4 shrink-0',
                    })}
                    {getExpenseTypeLabel(expenseType)}
                  </span>
                ) : (
                  'Seleccionar tipo'
                )}
              </SelectTrigger>
              <SelectContent>
                {expenseTypes.map((type) => {
                  const Icon = expenseTypeIcons[type];
                  return (
                    <SelectItem key={type} value={type}>
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0" />
                        {getExpenseTypeLabel(type)}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type}</p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2 md:max-w-xs">
            <Label htmlFor="date">
              Fecha de Compra <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={cn('pr-10', errors.date && 'border-red-500')}
              />
              <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date}</p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Descripción / Notas</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles adicionales sobre la compra..."
              rows={3}
              className="flex w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">
              Método de Pago <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Select
                value={paymentMethod.toString()}
                onValueChange={(value) => setPaymentMethod(Number(value) as PaymentMethod)}
              >
                <SelectTrigger
                  id="paymentMethod"
                  className={cn('pl-10', errors.paymentMethod && 'border-red-500')}
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
              <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {errors.paymentMethod && (
              <p className="text-sm text-red-500">{errors.paymentMethod}</p>
            )}
          </div>
        </div>
      </section>

      {/* Formularios específicos por tipo */}
      {expenseType === 'MERCHANDISE' && (
        <>
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
          {errors.merchandiseItemsRequired && (
            <p className="text-sm text-red-500">{errors.merchandiseItemsRequired}</p>
          )}
        </>
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

      {expenseType === 'SALARY' && (
        <>
          <SalaryExpenseForm
            employees={employees}
            selectedEmployee={salaryEmployee}
            onEmployeeSelect={setSalaryEmployee}
            onAmountChange={(amount) => {
              setSubtotal(amount.toFixed(2));
              setIva('0.00');
              setTotal(amount.toFixed(2));
            }}
          />
          {errors.salaryEmployee && (
            <p className="text-sm text-red-500">{errors.salaryEmployee}</p>
          )}
        </>
      )}

      {expenseType === 'OTHER' && (
        <ServiceExpenseForm
          onAmountChange={(amount) => {
            setSubtotal(amount.toFixed(2));
            setIva('0.00');
            setTotal(amount.toFixed(2));
          }}
        />
      )}

      {/* Resumen y totales */}
      <section className="border-t border-slate-200 pt-6 dark:border-slate-700">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {expenseType === 'MERCHANDISE' && (
            <div className="flex gap-3 rounded-lg bg-slate-100 p-4 dark:bg-slate-800/50">
              <Info className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Los subtotales y totales se calculan automáticamente basándose en la cantidad y
                precio unitario ingresado. El IVA se calcula al 19% por defecto.
              </p>
            </div>
          )}
          <div className={cn('flex flex-col gap-2 md:min-w-[200px]', expenseType !== 'MERCHANDISE' && 'md:ml-auto')} data-testid="expense-form-totals">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
              <span className="font-medium" data-testid="expense-form-subtotal">{formatCurrency(parseFloat(subtotal || '0'))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">IVA:</span>
              <span className="font-medium" data-testid="expense-form-iva">{formatCurrency(parseFloat(iva || '0'))}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
              <span className="font-semibold text-slate-900 dark:text-white" data-testid="expense-form-total-label">Total a Pagar</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400" data-testid="expense-form-total">
                {formatCurrency(parseFloat(total || '0'))}
              </span>
            </div>
          </div>
        </div>
        {errors.subtotal && (
          <p className="mt-2 text-sm text-red-500">{errors.subtotal}</p>
        )}
        {errors.iva && (
          <p className="mt-1 text-sm text-red-500">{errors.iva}</p>
        )}
        {errors.total && (
          <p className="mt-1 text-sm text-red-500">{errors.total}</p>
        )}
      </section>

      {/* Botones de acción */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-between dark:border-slate-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Guardando...' : 'Guardar Gasto'}
        </Button>
      </div>
    </form>
  );
};


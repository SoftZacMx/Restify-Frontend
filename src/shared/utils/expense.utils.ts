import type { ExpenseListItem, ExpenseTableItem, ExpenseType, PaymentMethod, UnitOfMeasure } from '@/domain/types';
import { APP_TIMEZONE } from '@/shared/constants';

/**
 * Obtiene la etiqueta en español para el tipo de gasto
 */
export function getExpenseTypeLabel(type: ExpenseType): string {
  const labels: Record<ExpenseType, string> = {
    SERVICE_BUSINESS: 'Servicios del negocio',
    UTILITY: 'Servicios públicos',
    RENT: 'Renta',
    MERCHANDISE: 'Compra de mercancía',
    SALARY: 'Salarios',
    OTHER: 'Otros',
    MERCADO_PAGO_FEE: 'Comisión Mercado Pago',
  };
  return labels[type] || type;
}

/**
 * Obtiene el color del badge para el tipo de gasto
 */
export function getExpenseTypeBadgeColor(type: ExpenseType): string {
  const colors: Record<ExpenseType, string> = {
    SERVICE_BUSINESS: 'bg-fresco-suave text-fresco-texto',
    UTILITY: 'bg-primary/10 dark:bg-primary/20/50 text-primary dark:text-primary',
    RENT: 'bg-destructive-suave text-destructive-texto',
    MERCHANDISE: 'bg-apoyo-suave text-apoyo-texto',
    SALARY: 'bg-chart-5/15 text-chart-5',
    OTHER: 'bg-muted text-foreground',
    MERCADO_PAGO_FEE: 'bg-chart-4/15 text-chart-4',
  };
  return colors[type] || '';
}

/**
 * Obtiene la etiqueta en español para la unidad de medida (ítems MERCHANDISE)
 */
export function getUnitOfMeasureLabel(unit: UnitOfMeasure | string | null): string {
  if (!unit) return '—';
  const labels: Record<string, string> = {
    KG: 'Kilogramos',
    G: 'Gramos',
    PCS: 'Piezas',
    OTHER: 'Otro',
  };
  return labels[unit] || unit;
}

/**
 * Obtiene la etiqueta en español para el método de pago
 */
export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    1: 'Efectivo',
    2: 'Transferencia',
    3: 'Tarjeta',
  };
  return labels[method] || 'Desconocido';
}

/**
 * Formatea un gasto para mostrar en la tabla
 */
export function formatExpenseForTable(expense: ExpenseListItem): ExpenseTableItem {
  const fallbackUserName = expense.userId
    ? `Usuario ${expense.userId.substring(0, 8)}...`
    : 'Sistema';
  return {
    id: expense.id,
    title: expense.title ?? expense.description ?? '—',
    date: typeof expense.date === 'string' ? expense.date : (expense.date as Date).toISOString?.()?.split('T')[0] ?? String(expense.date),
    type: expense.type,
    typeLabel: getExpenseTypeLabel(expense.type),
    description: expense.description,
    total: expense.total,
    paymentMethod: expense.paymentMethod,
    paymentMethodLabel: getPaymentMethodLabel(expense.paymentMethod),
    userId: expense.userId,
    userName:
      expense.userName ??
      (expense.user ? `${expense.user.name} ${expense.user.last_name}` : null) ??
      fallbackUserName,
  };
}

/**
 * Formatea una lista de gastos para mostrar en la tabla
 */
export function formatExpensesForTable(expenses: ExpenseListItem[]): ExpenseTableItem[] {
  return expenses.map(formatExpenseForTable);
}

export { formatCurrency } from './currency.utils';

/**
 * Formatea una fecha
 */
export function formatExpenseDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: APP_TIMEZONE,
  }).format(dateObj);
}


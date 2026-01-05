/**
 * Tipos relacionados con gastos (expenses)
 */

export type ExpenseType = 'SERVICE_BUSINESS' | 'UTILITY' | 'RENT' | 'MERCHANDISE' | 'OTHER';

export type PaymentMethod = 1 | 2 | 3; // 1: Cash, 2: Transfer, 3: Card

export type UnitOfMeasure = 'pieza' | 'kg' | 'gramos';

/**
 * Gastos
 */
export interface Expense {
  id: string;
  type: ExpenseType;
  date: Date | string;
  total: number;
  subtotal: number;
  iva: number;
  description: string | null;
  paymentMethod: PaymentMethod;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: {
    id: string;
    name: string;
    last_name: string;
    email: string;
  };
  items?: ExpenseItem[];
}

/**
 * Items de gasto (solo para tipo MERCHANDISE)
 */
export interface ExpenseItem {
  id: string;
  expenseId: string;
  productId: string;
  amount: number;
  subtotal: number;
  total: number;
  unitOfMeasure: string | null;
  product?: {
    id: string;
    name: string;
  };
}

/**
 * Filtros para la tabla de gastos
 */
export interface ExpenseTableFilters {
  search?: string;
  type?: ExpenseType | 'all';
  paymentMethod?: PaymentMethod | 'all';
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Datos para mostrar en la tabla de gastos
 */
export interface ExpenseTableItem {
  id: string;
  date: string;
  type: ExpenseType;
  typeLabel: string;
  description: string | null;
  total: number;
  paymentMethod: PaymentMethod;
  paymentMethodLabel: string;
  userId: string;
  userName: string;
}

/**
 * Request para crear un gasto
 */
export interface CreateExpenseRequest {
  type: ExpenseType;
  date?: string; // ISO date string
  total: number;
  subtotal: number;
  iva: number;
  description?: string | null;
  paymentMethod: PaymentMethod;
  userId: string;
  items?: CreateExpenseItemRequest[];
}

/**
 * Request para crear un item de gasto (MERCHANDISE)
 */
export interface CreateExpenseItemRequest {
  productId: string;
  amount: number;
  subtotal: number;
  total: number;
  unitOfMeasure?: string | null;
}

/**
 * Errores de validación del formulario de gasto
 */
export interface ExpenseFormErrors {
  type?: string;
  date?: string;
  total?: string;
  subtotal?: string;
  iva?: string;
  description?: string;
  paymentMethod?: string;
  userId?: string;
  items?: {
    productId?: string;
    amount?: string;
    subtotal?: string;
    total?: string;
    unitOfMeasure?: string;
  }[];
}

/**
 * Producto para selección en compra de mercancía
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  status: boolean;
}

/**
 * Usuario para selección en pagos de salarios
 */
export interface EmployeeUser {
  id: string;
  name: string;
  last_name: string;
  email: string;
  rol: string;
}



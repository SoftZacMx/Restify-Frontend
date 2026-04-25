/**
 * Tipos relacionados con gastos (expenses)
 */

export type ExpenseType = 'SERVICE_BUSINESS' | 'UTILITY' | 'RENT' | 'MERCHANDISE' | 'SALARY' | 'OTHER' | 'MERCADO_PAGO_FEE';

export type PaymentMethod = 1 | 2 | 3; // 1: Cash, 2: Transfer, 3: Card

/** Unidades de medida para ítems MERCHANDISE (enum del backend) */
export type UnitOfMeasure = 'KG' | 'G' | 'PCS' | 'OTHER';

/**
 * Gastos
 */
export interface Expense {
  id: string;
  title: string;
  type: ExpenseType;
  date: Date | string;
  total: number;
  subtotal: number;
  iva: number;
  description: string | null;
  paymentMethod: PaymentMethod;
  /** null cuando el gasto fue creado por el sistema (ej. comisiones de Mercado Pago). */
  userId: string | null;
  /** Vínculo opcional al Payment del que se derivó el gasto (ej. comisión MP). */
  paymentId?: string | null;
  userName?: string; // Nombre del usuario que registró (viene del backend); "Sistema" para gastos automáticos
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
 * Filtros y paginación para listar gastos (query params del backend)
 */
export interface ListExpensesQuery {
  type?: ExpenseType;
  userId?: string;
  paymentMethod?: PaymentMethod;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

/** Elemento de gasto en listados (sin items ni updatedAt) */
export type ExpenseListItem = Omit<Expense, 'items' | 'updatedAt'>;

/**
 * Resultado de listar gastos (backend devuelve data + pagination)
 */
export interface ListExpensesResult {
  data: ExpenseListItem[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

/**
 * Filtros para la tabla de gastos (UI)
 */
export interface ExpenseTableFilters {
  search?: string; // Solo filtrado en frontend (no se envía al API)
  type?: ExpenseType | 'all';
  userId?: string; // UUID del usuario que registró el gasto (opcional)
  paymentMethod?: PaymentMethod | 'all';
  dateFrom?: string; // ISO ej. 2026-01-01
  dateTo?: string;   // ISO ej. 2026-01-31
  page?: number;
  pageSize?: number;
}

/**
 * Datos para mostrar en la tabla de gastos
 */
export interface ExpenseTableItem {
  id: string;
  title: string;
  date: string;
  type: ExpenseType;
  typeLabel: string;
  description: string | null;
  total: number;
  paymentMethod: PaymentMethod;
  paymentMethodLabel: string;
  userId: string | null;
  userName: string;
}

/**
 * Request para crear un gasto (sin ítems: SERVICE_BUSINESS, UTILITY, RENT, OTHER)
 */
export interface CreateExpenseRequestNoItems {
  title: string; // Obligatorio, mín. 1 carácter, máx. 200
  type: 'SERVICE_BUSINESS' | 'UTILITY' | 'RENT' | 'SALARY' | 'OTHER';
  total: number;
  subtotal: number;
  iva: number;
  paymentMethod: PaymentMethod;
  userId: string;
  date?: string;
  description?: string | null;
}

/**
 * Request para crear un gasto tipo MERCHANDISE (con ítems)
 */
export interface CreateExpenseRequestMerchandise {
  title: string;
  type: 'MERCHANDISE';
  total: number;
  subtotal: number;
  iva: number;
  paymentMethod: PaymentMethod;
  userId: string;
  date?: string;
  description?: string | null;
  items: CreateExpenseItemRequest[];
}

export type CreateExpenseRequest = CreateExpenseRequestNoItems | CreateExpenseRequestMerchandise;

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
 * Request para actualizar un gasto (todos los campos opcionales; no se puede cambiar type ni items)
 */
export interface UpdateExpenseRequest {
  title?: string;
  date?: string;
  total?: number;
  subtotal?: number;
  iva?: number;
  description?: string | null;
  paymentMethod?: PaymentMethod;
}

/**
 * Errores de validación del formulario de gasto
 */
export interface ExpenseFormErrors {
  title?: string;
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
 * Named ExpenseProduct to avoid conflict with Product from product.types.ts
 */
export interface ExpenseProduct {
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



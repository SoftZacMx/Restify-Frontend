// Base types and interfaces

// User types
export type UserRole = 'ADMIN' | 'MANAGER' | 'WAITER' | 'CHEF';

export interface User {
  id: string;
  name: string;
  last_name: string;
  second_last_name: string | null;
  email: string;
  phone: string | null;
  status: boolean;
  rol: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    last_name: string;
    second_last_name: string | null;
    rol: string;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

// Re-export user table types
export type {
  UserStatusFilter,
  UserTableFilters,
  PaginationData,
  UserTableItem,
  UserTableProps,
  UserSearchBarProps,
  UserPaginationProps,
  CreateUserRequest,
  UpdateUserRequest,
  UserFormErrors,
} from './user.types';

// Re-export expense types
export type {
  ExpenseType,
  PaymentMethod,
  UnitOfMeasure,
  Expense,
  ExpenseItem,
  ExpenseTableFilters,
  ExpenseTableItem,
  CreateExpenseRequest,
  CreateExpenseItemRequest,
  ExpenseFormErrors,
  Product,
  EmployeeUser,
} from './expense.types';


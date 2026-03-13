/**
 * Constantes de la aplicación
 */

// API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  WAITER: 'WAITER',
  CHEF: 'CHEF',
} as const;

// Rutas
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  ORDERS: '/orders',
  TABLES: '/tables',
  PRODUCTS: '/products',
  MENU: '/menu',
  PAYMENTS: '/payments',
  EXPENSES: '/expenses',
  REPORTS: '/reports',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  AUTH_STORAGE: 'auth-storage',
} as const;

// Role-based access
export {
  WAITER_ALLOWED_PATH_PREFIXES,
  isWaiterAllowedPath,
  FULL_ACCESS_ROLES,
  hasFullAccess,
} from './roles.constants';

// POS constants
export {
  AVAILABLE_TABLES,
  PRODUCT_CATEGORIES,
  EXTRA_PRODUCTS,
  AVAILABLE_EXTRAS,
  POS_PRODUCTS,
  TAX_RATE,
  PAYMENT_METHODS,
} from './pos.constants';

// Currency (global config for all money display)
export { CURRENCY_CODE, CURRENCY_LOCALE } from './currency.constants';

// Input lengths (simple_input, extended_input, text_area)
export { INPUT_LENGTH, getInputMaxLength, type InputLengthType } from './input.constants';
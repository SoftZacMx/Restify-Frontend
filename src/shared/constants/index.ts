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


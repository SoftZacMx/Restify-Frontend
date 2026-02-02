/**
 * Constantes y datos hardcodeados para el sistema de punto de venta (POS)
 * Estos datos pueden ser reemplazados por llamadas a API en el futuro
 */

import type { Table, Category, PosProduct } from '@/domain/types';

/**
 * Mesas disponibles del restaurante
 */
export const AVAILABLE_TABLES: Table[] = [
  { id: '1', number: 1, capacity: 2, isAvailable: true, location: 'Interior' },
  { id: '2', number: 2, capacity: 4, isAvailable: true, location: 'Interior' },
  { id: '3', number: 3, capacity: 4, isAvailable: true, location: 'Interior' },
  { id: '4', number: 4, capacity: 6, isAvailable: true, location: 'Interior' },
  { id: '5', number: 5, capacity: 2, isAvailable: true, location: 'Terraza' },
  { id: '6', number: 6, capacity: 4, isAvailable: true, location: 'Terraza' },
  { id: '7', number: 7, capacity: 4, isAvailable: false, location: 'Terraza' },
  { id: '8', number: 8, capacity: 8, isAvailable: true, location: 'Interior' },
  { id: '9', number: 9, capacity: 2, isAvailable: true, location: 'Interior' },
  { id: '10', number: 10, capacity: 4, isAvailable: true, location: 'Terraza' },
];

/**
 * Categorías de productos
 */
export const PRODUCT_CATEGORIES: Category[] = [
  { id: '1', name: 'Bebidas', description: 'Bebidas frías y calientes', icon: '🥤' },
  { id: '2', name: 'Entradas', description: 'Aperitivos y entradas', icon: '🍽️' },
  { id: '3', name: 'Platos Principales', description: 'Platos fuertes', icon: '🍛' },
  { id: '4', name: 'Postres', description: 'Dulces y postres', icon: '🍰' },
  { id: '5', name: 'Especiales', description: 'Platos especiales del día', icon: '⭐' },
];

/**
 * Productos que son extras (isExtra = true)
 * Estos productos pueden agregarse como extras a otros platillos
 * NOTA: Los IDs son UUIDs válidos para compatibilidad con el backend
 */
export const EXTRA_PRODUCTS: PosProduct[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Queso Extra',
    description: 'Queso adicional',
    price: 15.00,
    categoryId: '1',
    status: true,
    isExtra: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Tocino',
    description: 'Tocino crujiente',
    price: 20.00,
    categoryId: '1',
    status: true,
    isExtra: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Aguacate',
    description: 'Aguacate fresco',
    price: 18.00,
    categoryId: '1',
    status: true,
    isExtra: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Huevo',
    description: 'Huevo frito',
    price: 12.00,
    categoryId: '1',
    status: true,
    isExtra: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Salsa Extra',
    description: 'Salsa adicional',
    price: 5.00,
    categoryId: '1',
    status: true,
    isExtra: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'Papas Extra',
    description: 'Porción adicional de papas',
    price: 25.00,
    categoryId: '1',
    status: true,
    isExtra: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    name: 'Cebolla',
    description: 'Cebolla caramelizada',
    price: 8.00,
    categoryId: '1',
    status: true,
    isExtra: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    name: 'Champiñones',
    description: 'Champiñones salteados',
    price: 15.00,
    categoryId: '1',
    status: true,
    isExtra: true,
  },
];

/**
 * Colección de extras disponibles (filtrados de productos con isExtra = true)
 * En producción, esto se obtendría de la API filtrando productos con isExtra = true
 */
export const AVAILABLE_EXTRAS = EXTRA_PRODUCTS.filter((product) => product.isExtra && product.status);

/**
 * Productos del menú (hardcoded)
 * En producción, estos vendrían de la API
 * Los extras se obtienen de la colección AVAILABLE_EXTRAS (productos con isExtra = true)
 */
/**
 * Productos del menú (hardcoded)
 * En producción, estos vendrían de la API
 * Los extras se obtienen de la colección AVAILABLE_EXTRAS (productos con isExtra = true)
 * NOTA: Los IDs son UUIDs válidos para compatibilidad con el backend
 */
export const POS_PRODUCTS: PosProduct[] = [
  // Bebidas
  {
    id: '10000000-0000-0000-0000-000000000001',
    name: 'Coca Cola',
    description: 'Refresco de cola 500ml',
    price: 25.00,
    categoryId: '1',
    status: true,
    isExtra: false,
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    name: 'Agua Natural',
    description: 'Agua purificada 500ml',
    price: 15.00,
    categoryId: '1',
    status: true,
    isExtra: false,
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    name: 'Jugo de Naranja',
    description: 'Jugo natural de naranja',
    price: 30.00,
    categoryId: '1',
    status: true,
    isExtra: false,
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    name: 'Café Americano',
    description: 'Café negro americano',
    price: 35.00,
    categoryId: '1',
    status: true,
    isExtra: false,
  },
  // Entradas
  {
    id: '10000000-0000-0000-0000-000000000005',
    name: 'Nachos con Queso',
    description: 'Nachos con queso derretido',
    price: 85.00,
    categoryId: '2',
    status: true,
    isExtra: false,
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    name: 'Alitas BBQ',
    description: '6 alitas con salsa BBQ',
    price: 120.00,
    categoryId: '2',
    status: true,
    isExtra: false,
  },
  // Platos Principales
  {
    id: '10000000-0000-0000-0000-000000000007',
    name: 'Hamburguesa Clásica',
    description: 'Hamburguesa con carne, lechuga, tomate y queso',
    price: 150.00,
    categoryId: '3',
    status: true,
    isExtra: false,
  },
  {
    id: '10000000-0000-0000-0000-000000000008',
    name: 'Pasta Carbonara',
    description: 'Pasta con crema, tocino y queso',
    price: 180.00,
    categoryId: '3',
    status: true,
    isExtra: false,
  },
  {
    id: '10000000-0000-0000-0000-000000000009',
    name: 'Pizza Margherita',
    description: 'Pizza con tomate, mozzarella y albahaca',
    price: 200.00,
    categoryId: '3',
    status: true,
    isExtra: false,
  },
  // Postres
  {
    id: '10000000-0000-0000-0000-000000000010',
    name: 'Pastel de Chocolate',
    description: 'Rebanada de pastel de chocolate',
    price: 75.00,
    categoryId: '4',
    status: true,
    isExtra: false,
  },
  {
    id: '10000000-0000-0000-0000-000000000011',
    name: 'Flan Napolitano',
    description: 'Flan casero con caramelo',
    price: 65.00,
    categoryId: '4',
    status: true,
    isExtra: false,
  },
  // Especiales
  {
    id: '10000000-0000-0000-0000-000000000012',
    name: 'Platillo del Día',
    description: 'Especial del chef',
    price: 220.00,
    categoryId: '5',
    status: true,
    isExtra: false,
  },
];

/**
 * Tasa de impuesto (IVA)
 */
export const TAX_RATE = 0.16; // 16% IVA

/**
 * Métodos de pago disponibles
 */
export const PAYMENT_METHODS = {
  CASH: 'CASH' as const,
  CARD: 'CARD' as const,
} as const;

import { describe, it, expect } from 'vitest';
import {
  mapMenuItemToPosProduct,
  mapTableResponseToTable,
  mapOrderItemResponseToOrderItem,
} from './pos.mappers';
import type {
  MenuItemResponse,
  TableResponse,
  OrderItemResponse,
  PosProduct,
} from '@/domain/types';

const menuItem: MenuItemResponse = {
  id: 'mi-1',
  name: 'Tacos',
  price: 50,
  status: true,
  isExtra: false,
  categoryId: 'cat-1',
  userId: 'u-1',
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-01T10:00:00.000Z',
  imageUrl: 'https://example.com/taco.png',
};

const tableResponse: TableResponse = {
  id: 't-1',
  name: '1A',
  userId: 'u-1',
  status: true,
  availabilityStatus: true,
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-01T10:00:00.000Z',
};

describe('mapMenuItemToPosProduct', () => {
  it('maps all main fields', () => {
    const result = mapMenuItemToPosProduct(menuItem);
    expect(result.id).toBe('mi-1');
    expect(result.name).toBe('Tacos');
    expect(result.price).toBe(50);
    expect(result.categoryId).toBe('cat-1');
    expect(result.status).toBe(true);
    expect(result.description).toBe('');
  });

  it('sets isExtra to false when not present on the menuItem', () => {
    expect(mapMenuItemToPosProduct(menuItem).isExtra).toBe(false);
  });

  it('preserves isExtra true', () => {
    expect(mapMenuItemToPosProduct({ ...menuItem, isExtra: true }).isExtra).toBe(true);
  });

  it('defaults categoryId to empty string when falsy', () => {
    expect(mapMenuItemToPosProduct({ ...menuItem, categoryId: '' }).categoryId).toBe('');
    expect(mapMenuItemToPosProduct({ ...menuItem, categoryId: null as unknown as string }).categoryId).toBe('');
  });

  it('maps imageUrl as undefined when null', () => {
    expect(mapMenuItemToPosProduct({ ...menuItem, imageUrl: null }).imageUrl).toBeUndefined();
    expect(mapMenuItemToPosProduct(menuItem).imageUrl).toBe('https://example.com/taco.png');
  });
});

describe('mapTableResponseToTable', () => {
  it('is available when both status and availabilityStatus are true', () => {
    expect(mapTableResponseToTable(tableResponse).isAvailable).toBe(true);
  });

  it('is unavailable when status is false', () => {
    expect(mapTableResponseToTable({ ...tableResponse, status: false }).isAvailable).toBe(false);
  });

  it('is unavailable when availabilityStatus is false', () => {
    expect(mapTableResponseToTable({ ...tableResponse, availabilityStatus: false }).isAvailable).toBe(false);
  });

  it('sets capacity to 4 and location to undefined', () => {
    const table = mapTableResponseToTable(tableResponse);
    expect(table.capacity).toBe(4);
    expect(table.location).toBeUndefined();
  });

  it('copies id and name', () => {
    const table = mapTableResponseToTable(tableResponse);
    expect(table.id).toBe('t-1');
    expect(table.name).toBe('1A');
  });
});

describe('mapOrderItemResponseToOrderItem', () => {
  const products: PosProduct[] = [
    { id: 'p-1', name: 'Harina', description: null, price: 25.5, categoryId: 'c-1', status: true, isExtra: false },
    { id: 'ex-1', name: 'Extra Queso', description: null, price: 10, categoryId: 'c-2', status: true, isExtra: true },
  ];

  const orderItemResponse: OrderItemResponse = {
    id: 'oi-1',
    quantity: 2,
    price: 25.5,
    orderId: 'ord-1',
    productId: 'p-1',
    menuItemId: null,
    note: null,
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
  };

  it('returns null when neither menuItemId nor productId exist', () => {
    const result = mapOrderItemResponseToOrderItem({ ...orderItemResponse, productId: null, menuItemId: null }, products);
    expect(result).toBeNull();
  });

  it('finds a matching product in the products list', () => {
    const result = mapOrderItemResponseToOrderItem(orderItemResponse, products);
    expect(result).not.toBeNull();
    expect(result!.product.id).toBe('p-1');
    expect(result!.product.name).toBe('Harina');
    expect(result!.basePrice).toBe(25.5);
  });

  it('falls back to menuItem when product not in list', () => {
    const response = {
      ...orderItemResponse,
      productId: null,
      menuItemId: 'mi-unknown',
      menuItem: { ...menuItem, id: 'mi-unknown', price: 30 },
    };
    const result = mapOrderItemResponseToOrderItem(response, products);
    expect(result).not.toBeNull();
    expect(result!.product.id).toBe('mi-unknown');
    expect(result!.product.name).toBe('Tacos');
    expect(result!.basePrice).toBe(25.5);
  });

  it('falls back to product embedded in the response', () => {
    const response = {
      ...orderItemResponse,
      productId: 'p-unknown',
      menuItemId: null,
      product: { id: 'p-unknown', name: 'Producto Embebido', description: null, price: 15, registrationDate: '2025-01-01T10:00:00.000Z', status: true, userId: 'u-1', createdAt: '2025-01-01T10:00:00.000Z', updatedAt: '2025-01-01T10:00:00.000Z' },
    };
    const result = mapOrderItemResponseToOrderItem(response, products);
    expect(result).not.toBeNull();
    expect(result!.product.name).toBe('Producto Embebido');
  });

  it('uses a placeholder when no product/menuItem is available', () => {
    const response = {
      ...orderItemResponse,
      productId: 'p-ghost',
      menuItemId: null,
    };
    const result = mapOrderItemResponseToOrderItem(response, products);
    expect(result).not.toBeNull();
    expect(result!.product.name).toContain('p-ghost');
    expect(result!.product.isExtra).toBe(false);
  });

  it('accumulates extras with quantity and price', () => {
    const response: OrderItemResponse = {
      ...orderItemResponse,
      quantity: 1,
      price: 100,
      extras: [
        { id: 'e-1', orderId: 'ord-1', orderItemId: 'oi-1', extraId: 'ex-1', quantity: 2, price: 10, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
      ],
    };
    const result = mapOrderItemResponseToOrderItem(response, products);
    expect(result!.selectedExtras).toHaveLength(2);
    expect(result!.extrasTotal).toBe(20);
    expect(result!.itemSubtotal).toBe(120);
    expect(result!.itemTotal).toBe(120);
  });

  it('uses a placeholder for an extra not found in the products list', () => {
    const response: OrderItemResponse = {
      ...orderItemResponse,
      quantity: 1,
      price: 100,
      extras: [
        { id: 'e-2', orderId: 'ord-1', orderItemId: 'oi-1', extraId: 'ex-ghost', quantity: 1, price: 5, createdAt: '2025-01-01', updatedAt: '2025-01-01', extra: { ...menuItem, id: 'ex-ghost', name: 'Extra Fantasma', isExtra: true } },
      ],
    };
    const result = mapOrderItemResponseToOrderItem(response, products);
    expect(result!.selectedExtras).toHaveLength(1);
    expect(result!.selectedExtras[0].name).toBe('Extra Fantasma');
    expect(result!.selectedExtras[0].isExtra).toBe(true);
    expect(result!.extrasTotal).toBe(5);
  });

  it('computes itemSubtotal as (basePrice + extrasTotal) * quantity', () => {
    const response: OrderItemResponse = {
      ...orderItemResponse,
      quantity: 3,
      price: 50,
      extras: [
        { id: 'e-1', orderId: 'ord-1', orderItemId: 'oi-1', extraId: 'ex-1', quantity: 1, price: 10, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
      ],
    };
    const result = mapOrderItemResponseToOrderItem(response, products);
    // (50 + 10) * 3 = 180
    expect(result!.itemSubtotal).toBe(180);
    expect(result!.itemTotal).toBe(180);
  });

  it('copies note as undefined when null', () => {
    const result = mapOrderItemResponseToOrderItem(orderItemResponse, products);
    expect(result!.note).toBeUndefined();
  });

  it('preserves note when present', () => {
    const result = mapOrderItemResponseToOrderItem(
      { ...orderItemResponse, note: 'Sin picante' },
      products
    );
    expect(result!.note).toBe('Sin picante');
  });

  it('sets menuItemId only when present', () => {
    const withMenuItem = mapOrderItemResponseToOrderItem(
      { ...orderItemResponse, productId: null, menuItemId: 'mi-1', menuItem },
      products
    );
    expect(withMenuItem!.menuItemId).toBe('mi-1');

    const withoutMenuItem = mapOrderItemResponseToOrderItem(orderItemResponse, products);
    expect(withoutMenuItem!.menuItemId).toBeUndefined();
  });
});

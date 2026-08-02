import { describe, it, expect } from 'vitest';
import { getMenuItemStockMode, formatMenuItemsForTable } from './menu-item.utils';
import type { MenuItemResponse } from '@/domain/types';

const baseMenuItem: MenuItemResponse = {
  id: 'mi-1',
  name: 'Tacos',
  price: 50,
  status: true,
  isExtra: false,
  categoryId: 'cat-1',
  userId: 'u-1',
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-01T10:00:00.000Z',
};

describe('getMenuItemStockMode', () => {
  it('returns direct when linked to a product', () => {
    expect(getMenuItemStockMode({ productId: 'p-1', hasRecipe: false })).toBe('direct');
  });

  it('returns recipe when it has a recipe and no product', () => {
    expect(getMenuItemStockMode({ productId: null, hasRecipe: true })).toBe('recipe');
  });

  it('returns none when there is neither product nor recipe', () => {
    expect(getMenuItemStockMode({ productId: null, hasRecipe: false })).toBe('none');
    expect(getMenuItemStockMode({ productId: undefined, hasRecipe: false })).toBe('none');
  });
});

describe('formatMenuItemsForTable', () => {
  it('formats a regular menu item', () => {
    const result = formatMenuItemsForTable([baseMenuItem])[0];
    expect(result.id).toBe('mi-1');
    expect(result.price).toBe(50);
    expect(result.statusLabel).toBe('Activo');
    expect(result.isExtraLabel).toBe('No');
    expect(result.stockMode).toBe('none');
  });

  it('labels extras and links stock mode', () => {
    const result = formatMenuItemsForTable([
      { ...baseMenuItem, isExtra: true, productId: 'p-1' },
    ])[0];
    expect(result.isExtraLabel).toBe('Sí');
    expect(result.stockMode).toBe('direct');
  });

  it('returns an empty array for no items', () => {
    expect(formatMenuItemsForTable([])).toEqual([]);
  });
});

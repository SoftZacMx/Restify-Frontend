import { describe, it, expect } from 'vitest';
import { formatCategoryForTable, formatCategoriesForTable } from './menu-category.utils';
import type { MenuCategoryResponse } from '@/domain/types';

const activeCategory: MenuCategoryResponse = {
  id: 'cat-1',
  name: 'Tacos',
  status: true,
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-02T10:00:00.000Z',
};

const inactiveCategory: MenuCategoryResponse = {
  ...activeCategory,
  id: 'cat-2',
  name: 'Postres',
  status: false,
};

describe('formatCategoryForTable', () => {
  it('formats an active category', () => {
    expect(formatCategoryForTable(activeCategory)).toEqual({
      id: 'cat-1',
      name: 'Tacos',
      status: true,
      statusLabel: 'Activa',
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-02T10:00:00.000Z',
    });
  });

  it('labels an inactive category as Inactiva', () => {
    const result = formatCategoryForTable(inactiveCategory);
    expect(result.status).toBe(false);
    expect(result.statusLabel).toBe('Inactiva');
  });
});

describe('formatCategoriesForTable', () => {
  it('maps each category through formatCategoryForTable', () => {
    const result = formatCategoriesForTable([activeCategory, inactiveCategory]);
    expect(result).toHaveLength(2);
    expect(result[0].statusLabel).toBe('Activa');
    expect(result[1].statusLabel).toBe('Inactiva');
  });

  it('returns an empty array when given no categories', () => {
    expect(formatCategoriesForTable([])).toEqual([]);
  });
});

import { describe, it, expect } from 'vitest';
import { formatProductsForTable } from './product.utils';
import type { ProductResponse } from '@/domain/types';

const baseProduct: ProductResponse = {
  id: 'p-1',
  name: 'Harina',
  description: 'Bolsa 1kg',
  registrationDate: '2025-01-01T10:00:00.000Z',
  status: true,
  userId: 'u-1',
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-01T10:00:00.000Z',
};

describe('formatProductsForTable', () => {
  it('formats an active product', () => {
    const result = formatProductsForTable([baseProduct])[0];
    expect(result.id).toBe('p-1');
    expect(result.name).toBe('Harina');
    expect(result.statusLabel).toBe('Activo');
    expect(result.registrationDate).toBe('2025-01-01T10:00:00.000Z');
  });

  it('labels an inactive product', () => {
    const result = formatProductsForTable([{ ...baseProduct, status: false }])[0];
    expect(result.statusLabel).toBe('Inactivo');
  });

  it('returns an empty array for no products', () => {
    expect(formatProductsForTable([])).toEqual([]);
  });
});

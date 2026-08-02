import { describe, it, expect } from 'vitest';
import { formatCurrency } from './currency.utils';

describe('formatCurrency', () => {
  it('formats amounts as MXN with 2 decimals', () => {
    expect(formatCurrency(1234.5)).toBe('MX$1,234.50');
    expect(formatCurrency(0)).toBe('MX$0.00');
    expect(formatCurrency(5)).toBe('MX$5.00');
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-5)).toBe('-MX$5.00');
  });
});

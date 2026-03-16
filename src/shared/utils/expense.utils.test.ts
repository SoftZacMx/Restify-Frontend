import { describe, it, expect } from 'vitest';
import {
  getExpenseTypeLabel,
  getExpenseTypeBadgeColor,
  getUnitOfMeasureLabel,
  getPaymentMethodLabel,
  formatExpenseForTable,
  formatExpensesForTable,
  formatExpenseDate,
} from './expense.utils';
import type { ExpenseListItem, ExpenseType, PaymentMethod } from '@/domain/types';

describe('expense.utils', () => {
  describe('getExpenseTypeLabel', () => {
    it('returns Spanish label for each expense type', () => {
      expect(getExpenseTypeLabel('SERVICE_BUSINESS')).toBe('Servicios del negocio');
      expect(getExpenseTypeLabel('UTILITY')).toBe('Servicios públicos');
      expect(getExpenseTypeLabel('RENT')).toBe('Renta');
      expect(getExpenseTypeLabel('MERCHANDISE')).toBe('Compra de mercancía');
      expect(getExpenseTypeLabel('SALARY')).toBe('Salarios');
      expect(getExpenseTypeLabel('OTHER')).toBe('Otros');
    });

    it('returns the type string when unknown', () => {
      expect(getExpenseTypeLabel('UNKNOWN' as ExpenseType)).toBe('UNKNOWN');
    });
  });

  describe('getExpenseTypeBadgeColor', () => {
    it('returns a non-empty class string for known types', () => {
      expect(getExpenseTypeBadgeColor('SERVICE_BUSINESS')).toContain('green');
      expect(getExpenseTypeBadgeColor('UTILITY')).toContain('blue');
      expect(getExpenseTypeBadgeColor('RENT')).toContain('red');
      expect(getExpenseTypeBadgeColor('MERCHANDISE')).toContain('orange');
      expect(getExpenseTypeBadgeColor('SALARY')).toContain('violet');
      expect(getExpenseTypeBadgeColor('OTHER')).toContain('gray');
    });

    it('returns empty string for unknown type', () => {
      expect(getExpenseTypeBadgeColor('UNKNOWN' as ExpenseType)).toBe('');
    });
  });

  describe('getUnitOfMeasureLabel', () => {
    it('returns Spanish label for each unit', () => {
      expect(getUnitOfMeasureLabel('KG')).toBe('Kilogramos');
      expect(getUnitOfMeasureLabel('G')).toBe('Gramos');
      expect(getUnitOfMeasureLabel('PCS')).toBe('Piezas');
      expect(getUnitOfMeasureLabel('OTHER')).toBe('Otro');
    });

    it('returns em dash for null or empty', () => {
      expect(getUnitOfMeasureLabel(null)).toBe('—');
      expect(getUnitOfMeasureLabel('')).toBe('—');
    });

    it('returns the unit string when unknown', () => {
      expect(getUnitOfMeasureLabel('LITERS')).toBe('LITERS');
    });
  });

  describe('getPaymentMethodLabel', () => {
    it('returns Spanish label for each payment method', () => {
      expect(getPaymentMethodLabel(1)).toBe('Efectivo');
      expect(getPaymentMethodLabel(2)).toBe('Transferencia');
      expect(getPaymentMethodLabel(3)).toBe('Tarjeta');
    });

    it('returns Desconocido for unknown method', () => {
      expect(getPaymentMethodLabel(99 as PaymentMethod)).toBe('Desconocido');
    });
  });

  describe('formatExpenseForTable', () => {
    const baseExpense: ExpenseListItem = {
      id: 'exp-1',
      title: 'Gasto test',
      type: 'SERVICE_BUSINESS',
      date: '2026-03-01',
      total: 1000,
      subtotal: 1000,
      iva: 0,
      description: null,
      paymentMethod: 2,
      userId: 'user-1',
      userName: 'Juan Pérez',
      createdAt: '2026-03-01T10:00:00.000Z',
    };

    it('maps expense to table item with typeLabel and paymentMethodLabel', () => {
      const result = formatExpenseForTable(baseExpense);
      expect(result.id).toBe('exp-1');
      expect(result.title).toBe('Gasto test');
      expect(result.typeLabel).toBe('Servicios del negocio');
      expect(result.paymentMethodLabel).toBe('Transferencia');
      expect(result.total).toBe(1000);
      expect(result.userName).toBe('Juan Pérez');
    });

    it('uses title when present, else description, else fallback', () => {
      expect(formatExpenseForTable({ ...baseExpense, title: 'Título' }).title).toBe('Título');
      expect(formatExpenseForTable({ ...baseExpense, title: undefined, description: 'Desc' } as unknown as ExpenseListItem).title).toBe('Desc');
      expect(formatExpenseForTable({ ...baseExpense, title: undefined, description: null } as unknown as ExpenseListItem).title).toBe('—');
    });

    it('formats date from string or Date', () => {
      expect(formatExpenseForTable({ ...baseExpense, date: '2026-03-15' }).date).toBe('2026-03-15');
    });

    it('builds userName from user object when userName is missing', () => {
      const withUser = {
        ...baseExpense,
        userName: undefined,
        user: { id: 'u1', name: 'Ana', last_name: 'López', email: 'ana@test.com' },
      };
      const result = formatExpenseForTable(withUser);
      expect(result.userName).toBe('Ana López');
    });

    it('falls back to truncated userId when no userName or user', () => {
      const noUser = { ...baseExpense, userName: undefined, user: undefined };
      const result = formatExpenseForTable(noUser);
      expect(result.userName).toMatch(/^Usuario .+\.\.\.$/);
    });
  });

  describe('formatExpensesForTable', () => {
    it('maps array of expenses to table items', () => {
      const expenses: ExpenseListItem[] = [
        { id: '1', title: 'A', type: 'RENT', date: '2026-01-01', total: 100, subtotal: 100, iva: 0, description: null, paymentMethod: 1, userId: 'u1', createdAt: '' },
        { id: '2', title: 'B', type: 'UTILITY', date: '2026-01-02', total: 200, subtotal: 200, iva: 0, description: null, paymentMethod: 2, userId: 'u1', createdAt: '' },
      ];
      const result = formatExpensesForTable(expenses);
      expect(result).toHaveLength(2);
      expect(result[0].typeLabel).toBe('Renta');
      expect(result[1].typeLabel).toBe('Servicios públicos');
    });
  });

  describe('formatExpenseDate', () => {
    it('formats date string in es-MX style', () => {
      const formatted = formatExpenseDate('2026-03-15');
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('accepts Date object', () => {
      const formatted = formatExpenseDate(new Date('2026-03-15T12:00:00.000Z'));
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });
});

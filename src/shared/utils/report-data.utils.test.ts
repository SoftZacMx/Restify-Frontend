import { describe, it, expect } from 'vitest';
import { normalizeCashFlowReportData } from './report-data.utils';
import type { CashFlowReportData } from '@/domain/types';

const baseReport: CashFlowReportData = {
  incomes: {
    orders: [{ id: 'o-1', date: '2025-01-01', total: 100, paymentMethod: 1 }],
    totalIncomes: 100,
    byPaymentMethod: { cash: 40, transfer: 20, card: 40 },
  },
  expenses: {
    businessServices: { items: [], total: 0 },
    utility: { items: [], total: 0 },
    rent: { items: [], total: 0 },
    merchandise: { items: [], total: 0 },
    salary: { items: [], total: 0 },
    other: { items: [], total: 0 },
    mercadoPagoFee: { items: [], total: 0 },
    employeeSalaries: { items: [], total: 0 },
    tips: { orders: [], total: 0 },
    totalExpenses: 0,
  },
  cashFlow: { balance: 0, status: 'BREAK_EVEN' },
};

describe('normalizeCashFlowReportData', () => {
  it('passes through a fully numeric payload unchanged', () => {
    const result = normalizeCashFlowReportData(baseReport);
    expect(result.incomes.totalIncomes).toBe(100);
    expect(result.incomes.byPaymentMethod).toEqual({ cash: 40, transfer: 20, card: 40 });
    expect(result.incomes.orders).toHaveLength(1);
  });

  it('parses string numbers', () => {
    const raw = {
      ...baseReport,
      incomes: {
        ...baseReport.incomes,
        totalIncomes: '100',
        byPaymentMethod: { cash: '40', transfer: '20', card: '40' },
      },
    } as unknown as CashFlowReportData;

    const result = normalizeCashFlowReportData(raw);
    expect(result.incomes.totalIncomes).toBe(100);
    expect(result.incomes.byPaymentMethod).toEqual({ cash: 40, transfer: 20, card: 40 });
  });

  it('supports snake_case fields', () => {
    const raw = {
      ...baseReport,
      incomes: {
        ...baseReport.incomes,
        totalIncomes: undefined,
        byPaymentMethod: undefined,
        total_incomes: '250',
        by_payment_method: { cash: '100', transfer: '50', card: '100' },
      },
    } as unknown as CashFlowReportData;

    const result = normalizeCashFlowReportData(raw);
    expect(result.incomes.totalIncomes).toBe(250);
    expect(result.incomes.byPaymentMethod).toEqual({ cash: 100, transfer: 50, card: 100 });
  });

  it('defaults missing payment buckets to zero', () => {
    const raw = {
      ...baseReport,
      incomes: { ...baseReport.incomes, byPaymentMethod: undefined },
    } as unknown as CashFlowReportData;

    const result = normalizeCashFlowReportData(raw);
    expect(result.incomes.byPaymentMethod).toEqual({ cash: 0, transfer: 0, card: 0 });
  });

  it('treats unparseable numbers as zero', () => {
    const raw = {
      ...baseReport,
      incomes: {
        ...baseReport.incomes,
        totalIncomes: 'abc' as unknown as number,
        byPaymentMethod: { cash: null, transfer: 'x', card: {} },
      },
    } as unknown as CashFlowReportData;

    const result = normalizeCashFlowReportData(raw);
    expect(result.incomes.totalIncomes).toBe(0);
    expect(result.incomes.byPaymentMethod).toEqual({ cash: 0, transfer: 0, card: 0 });
  });

  it('returns the object unchanged when it has no incomes', () => {
    const raw = { foo: 'bar' } as unknown as CashFlowReportData;
    expect(normalizeCashFlowReportData(raw)).toBe(raw);
  });

  it('returns nullish input as-is', () => {
    expect(normalizeCashFlowReportData(undefined)).toBeUndefined();
    expect(normalizeCashFlowReportData(null as unknown as CashFlowReportData)).toBeNull();
  });
});

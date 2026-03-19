import type { CashFlowReportData } from '@/domain/types';

type UnknownRecord = Record<string, unknown>;

function num(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

/**
 * Normaliza el payload de flujo de caja: acepta camelCase o snake_case y números como string.
 * El backend debe enviar `data` dentro de BaseReportResponse; esta función solo sanea el interior.
 */
export function normalizeCashFlowReportData(raw: unknown): CashFlowReportData {
  const d = raw as CashFlowReportData;
  if (!d?.incomes) return d;

  const inc = d.incomes as unknown as UnknownRecord;
  const bpm = (inc.byPaymentMethod ?? inc.by_payment_method) as UnknownRecord | undefined;

  return {
    ...d,
    incomes: {
      ...d.incomes,
      totalIncomes: num(inc.totalIncomes ?? inc.total_incomes ?? d.incomes.totalIncomes),
      byPaymentMethod: {
        cash: num(bpm?.cash),
        transfer: num(bpm?.transfer),
        card: num(bpm?.card),
      },
    },
  };
}

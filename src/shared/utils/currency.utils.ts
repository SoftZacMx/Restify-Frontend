import { CURRENCY_CODE, CURRENCY_LOCALE } from '@/shared/constants/currency.constants';

/**
 * Formatea un número como moneda usando la configuración global (CURRENCY_CODE, CURRENCY_LOCALE).
 * Usar en toda la app donde se muestren montos: gastos, órdenes, POS, reportes.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: 2,
  }).format(amount);
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatInTimeZone } from 'date-fns-tz';
import {
  getOrderStatusInfo,
  formatOrderNumber,
  convertViewFiltersToApiFilters,
  filterOrdersClient,
  getDefaultOrderFiltersForToday,
  getTodayDateString,
  getLocalDayBoundsUtc,
} from './order.utils';
import { APP_TIMEZONE } from '@/shared/constants';
import type { OrderResponse } from '@/domain/types';

const baseOrder: OrderResponse = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  date: '2025-01-15T12:00:00.000Z',
  status: false,
  paymentMethod: 1,
  total: 100,
  subtotal: 82.5,
  iva: 17.5,
  delivered: false,
  tableId: null,
  tip: 0,
  origin: 'Local',
  client: null,
  paymentDiffer: false,
  note: null,
  userId: 'user-1',
  customerName: null,
  customerPhone: null,
  latitude: null,
  longitude: null,
  deliveryAddress: null,
  scheduledAt: null,
  trackingToken: null,
  deliveryStatus: null,
  createdAt: '2025-01-15T12:00:00.000Z',
  updatedAt: '2025-01-15T12:00:00.000Z',
};

describe('order.utils', () => {
  describe('getOrderStatusInfo', () => {
    it('returns Pendiente when not paid and not delivered', () => {
      const info = getOrderStatusInfo({ ...baseOrder, status: false, delivered: false });
      expect(info.label).toBe('Pendiente');
      expect(info.color).toBe('yellow');
    });

    it('returns Entregada when not paid but delivered', () => {
      const info = getOrderStatusInfo({ ...baseOrder, status: false, delivered: true });
      expect(info.label).toBe('Entregada');
      expect(info.color).toBe('orange');
    });

    it('returns Pagada when paid and not delivered', () => {
      const info = getOrderStatusInfo({ ...baseOrder, status: true, delivered: false });
      expect(info.label).toBe('Pagada');
      expect(info.color).toBe('blue');
    });

    it('returns Completada when paid and delivered', () => {
      const info = getOrderStatusInfo({ ...baseOrder, status: true, delivered: true });
      expect(info.label).toBe('Completada');
      expect(info.color).toBe('green');
    });
  });

  describe('formatOrderNumber', () => {
    it('formats order id as last 8 chars uppercase with hash', () => {
      expect(formatOrderNumber('550e8400-e29b-41d4-a716-446655440000')).toBe('#55440000');
    });
  });

  describe('convertViewFiltersToApiFilters', () => {
    it('maps pending status to status false', () => {
      const api = convertViewFiltersToApiFilters({
        search: '',
        status: 'pending',
        dateFrom: '2025-01-15',
        dateTo: '2025-01-15',
        tableId: '',
        origin: '',
      });
      expect(api.status).toBe(false);
    });

    it('maps paid status to status true', () => {
      const api = convertViewFiltersToApiFilters({
        search: '',
        status: 'paid',
        dateFrom: '',
        dateTo: '',
        tableId: '',
        origin: '',
      });
      expect(api.status).toBe(true);
    });

    it('converts local dates to UTC day bounds in the app timezone', () => {
      const api = convertViewFiltersToApiFilters({
        search: '',
        status: 'all',
        dateFrom: '2025-01-15',
        dateTo: '2025-01-16',
        tableId: '',
        origin: '',
      });
      // America/Mexico_City is UTC-6 year-round (no DST since 2022).
      expect(api.dateFrom).toBe('2025-01-15T06:00:00.000Z');
      expect(api.dateTo).toBe('2025-01-17T05:59:59.999Z');
    });
  });

  describe('filterOrdersClient', () => {
    it('filters by search (client name)', () => {
      const orders: OrderResponse[] = [
        { ...baseOrder, id: '1', client: 'Juan' },
        { ...baseOrder, id: '2', client: 'Maria' },
      ];
      const filtered = filterOrdersClient(orders, {
        ...getDefaultOrderFiltersForToday(),
        search: 'juan',
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].client).toBe('Juan');
    });

    it('returns all orders when search is empty', () => {
      const orders: OrderResponse[] = [
        { ...baseOrder, id: '1' },
        { ...baseOrder, id: '2' },
      ];
      const filtered = filterOrdersClient(orders, getDefaultOrderFiltersForToday());
      expect(filtered).toHaveLength(2);
    });
  });

  describe('getDefaultOrderFiltersForToday', () => {
    it('sets dateFrom and dateTo to today in the app timezone', () => {
      const filters = getDefaultOrderFiltersForToday();
      const today = formatInTimeZone(new Date(), APP_TIMEZONE, 'yyyy-MM-dd');
      expect(filters.dateFrom).toBe(today);
      expect(filters.dateTo).toBe(today);
    });

    it('sets status to all and search to empty', () => {
      const filters = getDefaultOrderFiltersForToday();
      expect(filters.status).toBe('all');
      expect(filters.search).toBe('');
    });
  });

  describe('getTodayDateString (timezone-aware)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns the Mexico_City local date at 23:50 MX (UTC already next day)', () => {
      // 2026-04-23T04:50:00Z == 2026-04-22 22:50 Mexico_City (UTC-6)
      vi.setSystemTime(new Date('2026-04-23T04:50:00Z'));
      expect(getTodayDateString()).toBe('2026-04-22');
    });

    it('returns the Mexico_City local date at 00:30 MX (same UTC day)', () => {
      // 2026-04-22T06:30:00Z == 2026-04-22 00:30 Mexico_City
      vi.setSystemTime(new Date('2026-04-22T06:30:00Z'));
      expect(getTodayDateString()).toBe('2026-04-22');
    });

    it('returns the Mexico_City local date at 05:59 UTC (still yesterday MX)', () => {
      // 2026-04-22T05:59:00Z == 2026-04-21 23:59 Mexico_City
      vi.setSystemTime(new Date('2026-04-22T05:59:00Z'));
      expect(getTodayDateString()).toBe('2026-04-21');
    });
  });

  describe('getLocalDayBoundsUtc', () => {
    // Mexico eliminated DST in 2022: America/Mexico_City is UTC-6 year-round.
    it('returns UTC bounds of a Mexico_City calendar day', () => {
      const bounds = getLocalDayBoundsUtc('2026-04-22');
      expect(bounds.dateFrom).toBe('2026-04-22T06:00:00.000Z');
      expect(bounds.dateTo).toBe('2026-04-23T05:59:59.999Z');
    });

    it('handles end-of-month boundaries', () => {
      const bounds = getLocalDayBoundsUtc('2026-01-31');
      expect(bounds.dateFrom).toBe('2026-01-31T06:00:00.000Z');
      expect(bounds.dateTo).toBe('2026-02-01T05:59:59.999Z');
    });

    it('handles end-of-year boundary', () => {
      const bounds = getLocalDayBoundsUtc('2026-12-31');
      expect(bounds.dateFrom).toBe('2026-12-31T06:00:00.000Z');
      expect(bounds.dateTo).toBe('2027-01-01T05:59:59.999Z');
    });
  });

  describe("today filter covers the full local day (regression for '23 vs 22' bug)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('at 23:55 MX builds an API range covering the whole MX day', () => {
      // 2026-04-23T05:55:00Z == 2026-04-22 23:55 Mexico_City
      vi.setSystemTime(new Date('2026-04-23T05:55:00Z'));
      const api = convertViewFiltersToApiFilters(getDefaultOrderFiltersForToday());
      expect(api.dateFrom).toBe('2026-04-22T06:00:00.000Z');
      expect(api.dateTo).toBe('2026-04-23T05:59:59.999Z');
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  getOrderStatusInfo,
  formatOrderNumber,
  convertViewFiltersToApiFilters,
  filterOrdersClient,
  getDefaultOrderFiltersForToday,
} from './order.utils';
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

    it('includes dateFrom and dateTo as ISO strings', () => {
      const api = convertViewFiltersToApiFilters({
        search: '',
        status: 'all',
        dateFrom: '2025-01-15',
        dateTo: '2025-01-16',
        tableId: '',
        origin: '',
      });
      expect(api.dateFrom).toBe('2025-01-15T00:00:00.000Z');
      expect(api.dateTo).toBe('2025-01-16T23:59:59.999Z');
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
    it('sets dateFrom and dateTo to today', () => {
      const filters = getDefaultOrderFiltersForToday();
      const today = new Date().toISOString().slice(0, 10);
      expect(filters.dateFrom).toBe(today);
      expect(filters.dateTo).toBe(today);
    });

    it('sets status to all and search to empty', () => {
      const filters = getDefaultOrderFiltersForToday();
      expect(filters.status).toBe('all');
      expect(filters.search).toBe('');
    });
  });
});

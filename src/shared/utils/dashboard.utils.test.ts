import { describe, it, expect } from 'vitest';
import {
  getInitials,
  getOrderStatusLabel,
  getOrderStatusStyle,
  getTableDisplay,
} from './dashboard.utils';
import type { DashboardOrderSummary } from '@/domain/types';

const order = (partial: Partial<DashboardOrderSummary>): DashboardOrderSummary => ({
  id: 'order-1',
  total: 100,
  date: '2025-01-01T10:00:00.000Z',
  origin: 'local',
  tableId: null,
  tableName: null,
  status: false,
  delivered: false,
  ...partial,
});

describe('getInitials', () => {
  it('returns uppercased initials of name and last name', () => {
    expect(getInitials('juan', 'pérez')).toBe('JP');
    expect(getInitials('Ana', 'María')).toBe('AM');
  });

  it('handles empty strings', () => {
    expect(getInitials('', '')).toBe('');
  });
});

describe('getOrderStatusLabel', () => {
  it('returns Completado when paid and delivered', () => {
    expect(getOrderStatusLabel(order({ status: true, delivered: true }))).toBe('Completado');
  });

  it('returns Pagado when paid but not delivered', () => {
    expect(getOrderStatusLabel(order({ status: true, delivered: false }))).toBe('Pagado');
  });

  it('returns Pendiente when not paid', () => {
    expect(getOrderStatusLabel(order({ status: false, delivered: false }))).toBe('Pendiente');
  });
});

describe('getOrderStatusStyle', () => {
  it('returns the completed style class', () => {
    expect(getOrderStatusStyle(order({ status: true, delivered: true }))).toContain('green');
  });

  it('returns the paid style class', () => {
    expect(getOrderStatusStyle(order({ status: true, delivered: false }))).toContain('blue');
  });

  it('returns the pending style class', () => {
    expect(getOrderStatusStyle(order({ status: false, delivered: false }))).toContain('yellow');
  });
});

describe('getTableDisplay', () => {
  it('prefers the table name when present', () => {
    expect(getTableDisplay(order({ tableName: '3' }))).toBe('Ubicación 3');
  });

  it('falls back to Local for local origin without a table', () => {
    expect(getTableDisplay(order({ tableName: null, origin: 'local' }))).toBe('Local');
  });

  it('falls back to origin for other origins', () => {
    expect(getTableDisplay(order({ tableName: null, origin: 'uber' }))).toBe('uber');
  });

  it('returns Sin ubicación when nothing is available', () => {
    expect(getTableDisplay(order({ tableName: null, origin: '' }))).toBe('Sin ubicación');
  });
});

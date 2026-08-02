import { describe, it, expect } from 'vitest';
import {
  formatTableForDisplay,
  formatTablesForDisplay,
  getTableStatusInfo,
  validateTableName,
  getStatusBadgeClasses,
  getAvailabilityBadgeClasses,
} from './table.utils';
import type { TableResponse } from '@/domain/types';

const baseTable: TableResponse = {
  id: 't-1',
  name: 'Mesa 1',
  userId: 'u-1',
  status: true,
  availabilityStatus: true,
  createdAt: '2025-01-01T12:00:00.000Z',
  updatedAt: '2025-01-01T12:00:00.000Z',
};

describe('formatTableForDisplay', () => {
  it('formats an active and available table', () => {
    const result = formatTableForDisplay(baseTable);
    expect(result.id).toBe('t-1');
    expect(result.name).toBe('Mesa 1');
    expect(result.statusLabel).toBe('Activa');
    expect(result.availabilityLabel).toBe('Libre');
    expect(result.createdAt).toContain('2025');
  });

  it('labels inactive and occupied tables', () => {
    const result = formatTableForDisplay({
      ...baseTable,
      status: false,
      availabilityStatus: false,
    });
    expect(result.statusLabel).toBe('Inactiva');
    expect(result.availabilityLabel).toBe('Ocupada');
  });
});

describe('formatTablesForDisplay', () => {
  it('maps an array of tables', () => {
    const results = formatTablesForDisplay([baseTable, { ...baseTable, id: 't-2' }]);
    expect(results).toHaveLength(2);
    expect(results[1].name).toBe('Mesa 1');
  });

  it('returns an empty array for no tables', () => {
    expect(formatTablesForDisplay([])).toEqual([]);
  });
});

describe('getTableStatusInfo', () => {
  it('marks disabled tables as gray and not assignable', () => {
    expect(getTableStatusInfo({ ...baseTable, status: false })).toEqual({
      label: 'Deshabilitada',
      color: 'gray',
      canAssignOrder: false,
    });
  });

  it('marks active and available tables as green and assignable', () => {
    expect(getTableStatusInfo({ ...baseTable, status: true, availabilityStatus: true })).toEqual({
      label: 'Libre',
      color: 'green',
      canAssignOrder: true,
    });
  });

  it('marks active but occupied tables as red and not assignable', () => {
    expect(getTableStatusInfo({ ...baseTable, status: true, availabilityStatus: false })).toEqual({
      label: 'Ocupada',
      color: 'red',
      canAssignOrder: false,
    });
  });
});

describe('validateTableName', () => {
  it('requires a non-empty name', () => {
    expect(validateTableName('')).toBe('El nombre de la ubicación es requerido');
    expect(validateTableName('   ')).toBe('El nombre de la ubicación es requerido');
  });

  it('rejects names longer than 64 characters', () => {
    expect(validateTableName('a'.repeat(65))).toBe('El nombre no puede exceder 64 caracteres');
  });

  it('accepts valid names including the 64-char limit', () => {
    expect(validateTableName('Mesa 1')).toBeNull();
    expect(validateTableName('a'.repeat(64))).toBeNull();
  });
});

describe('badge classes', () => {
  it('returns green/red classes for status', () => {
    expect(getStatusBadgeClasses(true)).toContain('green');
    expect(getStatusBadgeClasses(false)).toContain('red');
  });

  it('returns emerald/orange classes for availability', () => {
    expect(getAvailabilityBadgeClasses(true)).toContain('emerald');
    expect(getAvailabilityBadgeClasses(false)).toContain('orange');
  });
});

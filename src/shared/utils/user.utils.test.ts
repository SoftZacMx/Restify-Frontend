import { describe, it, expect } from 'vitest';
import {
  getRoleLabel,
  getStatusLabel,
  getFullName,
  formatDate,
  formatUserForTable,
  formatUsersForTable,
} from './user.utils';
import type { User, UserRole } from '@/domain/types';

const baseUser: User = {
  id: 'u-1',
  name: 'Juan',
  last_name: 'Pérez',
  second_last_name: 'García',
  email: 'juan@restify.com',
  phone: '5512345678',
  status: true,
  rol: 'ADMIN',
  organizationId: 'org-1',
  organizationName: 'Restify',
  mustChangePassword: false,
  emailVerified: true,
  createdAt: new Date('2025-01-01T12:00:00.000Z'),
  updatedAt: new Date('2025-01-01T12:00:00.000Z'),
};

describe('getRoleLabel', () => {
  it('maps every role to its Spanish label', () => {
    const expected: Record<UserRole, string> = {
      OWNER: 'Propietario',
      ADMIN: 'Administrador',
      MANAGER: 'Gerente',
      WAITER: 'Empleado',
      CHEF: 'Operario',
    };
    for (const [role, label] of Object.entries(expected)) {
      expect(getRoleLabel(role as UserRole)).toBe(label);
    }
  });

  it('falls back to the role string for unknown roles', () => {
    expect(getRoleLabel('SUPERADMIN' as UserRole)).toBe('SUPERADMIN');
  });
});

describe('getStatusLabel', () => {
  it('returns Activo/Inactivo', () => {
    expect(getStatusLabel(true)).toBe('Activo');
    expect(getStatusLabel(false)).toBe('Inactivo');
  });
});

describe('getFullName', () => {
  it('includes the second last name when present', () => {
    expect(getFullName(baseUser)).toBe('Juan Pérez García');
  });

  it('omits the second last name when null', () => {
    expect(getFullName({ ...baseUser, second_last_name: null })).toBe('Juan Pérez');
  });
});

describe('formatDate', () => {
  it('formats a valid date as dd/MM/yyyy in the app timezone', () => {
    expect(formatDate('2025-01-01T12:00:00.000Z')).toBe('01/01/2025');
    expect(formatDate(new Date('2025-01-01T12:00:00.000Z'))).toBe('01/01/2025');
  });

  it('returns Fecha inválida for an invalid date', () => {
    expect(formatDate('not-a-date')).toBe('Fecha inválida');
  });
});

describe('formatUserForTable / formatUsersForTable', () => {
  it('adds fullName, statusLabel and roleLabel', () => {
    const result = formatUserForTable(baseUser);
    expect(result.id).toBe('u-1');
    expect(result.fullName).toBe('Juan Pérez García');
    expect(result.statusLabel).toBe('Activo');
    expect(result.roleLabel).toBe('Administrador');
    expect(result).not.toHaveProperty('password');
  });

  it('maps an array of users', () => {
    const results = formatUsersForTable([baseUser, { ...baseUser, id: 'u-2' }]);
    expect(results).toHaveLength(2);
    expect(results[1].fullName).toBe('Juan Pérez García');
  });
});

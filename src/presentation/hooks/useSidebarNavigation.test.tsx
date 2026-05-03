import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useSidebarNavigation } from './useSidebarNavigation';
import { useAuthStore } from '@/presentation/store/auth.store';
import type { User, UserRole } from '@/domain/types';

function buildUser(rol: UserRole): User {
  return {
    id: 'user-1',
    name: 'Test',
    last_name: 'User',
    second_last_name: null,
    email: 'test@test.com',
    phone: null,
    status: true,
    rol,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/** Setea el authStore con un user del rol indicado (o null para no logueado). */
function setAuthUser(user: User | null) {
  useAuthStore.setState({
    user,
    token: user ? 'fake-token' : null,
    isAuthenticated: !!user,
    _hasHydrated: true,
  });
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('useSidebarNavigation — visibilidad de "Stock" (Fase 6.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthUser(null);
  });

  it('rol ADMIN ve "Stock" en mainNavItems', () => {
    setAuthUser(buildUser('ADMIN'));
    const { result } = renderHook(() => useSidebarNavigation(), { wrapper });

    const labels = result.current.mainNavItems.map((i) => i.label);
    expect(labels).toContain('Stock');
  });

  it('rol MANAGER ve "Stock" en mainNavItems', () => {
    setAuthUser(buildUser('MANAGER'));
    const { result } = renderHook(() => useSidebarNavigation(), { wrapper });

    const labels = result.current.mainNavItems.map((i) => i.label);
    expect(labels).toContain('Stock');
  });

  it('rol CHEF NO ve "Stock" (filtrado por allowedRoles)', () => {
    setAuthUser(buildUser('CHEF'));
    const { result } = renderHook(() => useSidebarNavigation(), { wrapper });

    const labels = result.current.mainNavItems.map((i) => i.label);
    expect(labels).not.toContain('Stock');
    // Pero sí ve el resto del menú full (Dashboard, etc.)
    expect(labels).toContain('Dashboard');
  });

  it('rol WAITER ve solo POS y Órdenes (no ve Stock)', () => {
    setAuthUser(buildUser('WAITER'));
    const { result } = renderHook(() => useSidebarNavigation(), { wrapper });

    const labels = result.current.mainNavItems.map((i) => i.label);
    expect(labels).not.toContain('Stock');
    expect(labels).toContain('Punto De Venta');
    expect(labels).toContain('Órdenes');
    expect(labels).not.toContain('Dashboard');
  });

  it('sin login (user=null) NO se ve "Stock"', () => {
    setAuthUser(null);
    const { result } = renderHook(() => useSidebarNavigation(), { wrapper });

    const labels = result.current.mainNavItems.map((i) => i.label);
    expect(labels).not.toContain('Stock');
  });

  it('items sin allowedRoles siguen visibles para roles full-access (regression check)', () => {
    setAuthUser(buildUser('ADMIN'));
    const { result } = renderHook(() => useSidebarNavigation(), { wrapper });

    const labels = result.current.mainNavItems.map((i) => i.label);
    // Estos items NO tienen allowedRoles → deben aparecer para todos los full-access.
    expect(labels).toEqual(
      expect.arrayContaining(['Dashboard', 'Productos', 'Gastos', 'Reportes', 'Usuarios'])
    );
  });

  it('rol CHEF sigue viendo el resto del menú full (Productos, Reportes, etc.)', () => {
    setAuthUser(buildUser('CHEF'));
    const { result } = renderHook(() => useSidebarNavigation(), { wrapper });

    const labels = result.current.mainNavItems.map((i) => i.label);
    expect(labels).toEqual(
      expect.arrayContaining(['Dashboard', 'Productos', 'Gastos', 'Reportes', 'Usuarios'])
    );
  });
});

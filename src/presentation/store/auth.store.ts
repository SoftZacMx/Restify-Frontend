import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginResponse, AccessibleBranch } from '@/domain/types';

/**
 * Store de autenticación
 * Maneja el estado global de autenticación.
 * El backend guarda el JWT en cookie HttpOnly y además lo devuelve en el body del login.
 * Guardamos el JWT en el store para enviarlo en el handshake/register_connection del WebSocket
 * (el servidor WebSocket no lee la cookie).
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  /** Sucursales a las que el usuario tiene acceso (de login/signup). */
  branches: AccessibleBranch[];
  /**
   * Sucursal en la que el usuario decidió trabajar. Gobierna la navegación.
   * - null cuando hay varias sucursales y aún no se elige (fuerza la pantalla de selección).
   * - auto-elegida cuando solo hay una sucursal.
   */
  selectedBranchId: string | null;
  /** Solo en memoria: true cuando el persist terminó de rehidratar desde localStorage */
  _hasHydrated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
  setUser: (user: User) => void;
  /** Baja el flag mustChangePassword tras un cambio exitoso (flujo forzado). */
  clearMustChangePassword: () => void;
  /** Fija la sucursal elegida y reemplaza el token por el nuevo de switch-branch. */
  selectBranch: (branchId: string, token: string) => void;
  /** Reabre la selección de sucursal (acción "cambiar de sucursal"). */
  clearSelectedBranch: () => void;
  /** Refresca el listado de sucursales disponibles (ej: después de crear/deshabilitar una). */
  setBranches: (branches: AccessibleBranch[]) => void;
  setHasHydrated: (value: boolean) => void;
}

/**
 * Al iniciar sesión, decide la sucursal elegida:
 * - 0 o 1 sucursal → se elige sola (no hay nada que preguntar).
 * - 2+ sucursales → null, para que la UI obligue a elegir.
 */
function resolveInitialBranch(branches: AccessibleBranch[]): string | null {
  return branches.length <= 1 ? branches[0]?.id ?? null : null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      branches: [],
      selectedBranchId: null,
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      login: (data) => {
        const branches = data.branches ?? [];
        set({
          user: data.user as User,
          token: data.token ?? null,
          isAuthenticated: true,
          branches,
          selectedBranchId: resolveInitialBranch(branches),
        });
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          branches: [],
          selectedBranchId: null,
        });
        // Clear subscription store on logout
        try {
          const { useSubscriptionStore } = require('./subscription.store');
          useSubscriptionStore.getState().clear();
        } catch { /* ignore if not loaded */ }
      },
      setUser: (user) => set({ user }),
      clearMustChangePassword: () =>
        set((state) =>
          state.user ? { user: { ...state.user, mustChangePassword: false } } : {}
        ),
      selectBranch: (branchId, token) => set({ selectedBranchId: branchId, token }),
      clearSelectedBranch: () => set({ selectedBranchId: null }),
      setBranches: (branches) => set({ branches }),
    }),
    {
      name: 'auth-storage',
      version: 2, // Incrementar versión para limpiar datos antiguos
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        branches: state.branches,
        selectedBranchId: state.selectedBranchId,
      }),
      onRehydrateStorage: () => (_state) => {
        useAuthStore.getState().setHasHydrated(true);
      },
      migrate: (persistedState: any, version: number) => {
        // Migración: eliminar token de datos antiguos
        if (version < 2 && persistedState) {
          // Eliminar token si existe en el estado antiguo
          const { token, ...rest } = persistedState;
          return rest;
        }
        return persistedState;
      },
    }
  )
);


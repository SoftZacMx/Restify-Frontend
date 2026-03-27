import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginResponse } from '@/domain/types';

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
  /** Solo en memoria: true cuando el persist terminó de rehidratar desde localStorage */
  _hasHydrated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      login: (data) => {
        set({
          user: data.user as User,
          token: data.token ?? null,
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        // Clear subscription store on logout
        try {
          const { useSubscriptionStore } = require('./subscription.store');
          useSubscriptionStore.getState().clear();
        } catch { /* ignore if not loaded */ }
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      version: 2, // Incrementar versión para limpiar datos antiguos
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
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


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
  login: (data: LoginResponse) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
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
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      version: 2, // Incrementar versión para limpiar datos antiguos
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


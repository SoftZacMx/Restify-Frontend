import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginResponse } from '@/domain/types';

/**
 * Store de autenticación
 * Maneja el estado global de autenticación
 * El token se almacena en HttpOnly cookie (no en el frontend)
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (data) => {
        // El token se almacena en HttpOnly cookie por el backend
        // Solo guardamos el usuario para mostrar información en la UI
        set({
          user: data.user as User,
          isAuthenticated: true,
        });
      },
      logout: () => {
        // La cookie HttpOnly se limpia automáticamente por el backend al llamar /api/auth/logout
        // Solo limpiamos el estado local
        set({
          user: null,
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


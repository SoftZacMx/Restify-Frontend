import { useAuthStore } from '../store/auth.store';
import { authService } from '@/application/services/auth.service';
import type { LoginRequest } from '@/domain/types';
import { AppError } from '@/domain/errors';
import { useState } from 'react';

/**
 * Hook personalizado para autenticación
 * Encapsula la lógica de autenticación y expone una API simple
 * Maneja errores usando AppError centralizado
 */
export const useAuth = () => {
  const { login: loginStore, logout: logoutStore, user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);

      if (response.success && response.data) {
        loginStore(response.data);
        return { success: true };
      } else {
        // Backend returned error in response
        const errorMessage = response.error?.message || 'Error al iniciar sesión';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      // Error is already an AppError (converted by interceptor or service)
      const appError = err instanceof AppError ? err : AppError.create('UNKNOWN_ERROR', 'Error desconocido');
      setError(appError.message);
      return { success: false, error: appError.message, errorCode: appError.code };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Llamar al backend para limpiar la cookie HttpOnly
      await authService.logout();
      // Limpiar el estado local
      logoutStore();
      return { success: true };
    } catch (err) {
      // Error is already an AppError (converted by interceptor or service)
      const appError = err instanceof AppError ? err : AppError.create('UNKNOWN_ERROR', 'Error desconocido');
      setError(appError.message);
      // Aún así limpiamos el estado local aunque falle el logout en el backend
      logoutStore();
      return { success: false, error: appError.message, errorCode: appError.code };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError: () => setError(null),
  };
};


import { useAuthStore } from '../store/auth.store';
import { authService } from '@/application/services/auth.service';
import type { LoginRequest, SignupRequest } from '@/domain/types';
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

  const signup = async (data: SignupRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.signup(data);

      if (response.success && response.data) {
        // El backend ya dejó la sesión iniciada (cookie HttpOnly). Poblamos el store.
        // Tras un signup el usuario arranca con email sin verificar y sin cambio de contraseña forzado.
        const { token, user } = response.data;
        loginStore({
          token,
          user: {
            id: user.id,
            name: user.name,
            last_name: user.last_name,
            second_last_name: null,
            email: user.email,
            rol: user.rol,
            organizationId: user.organizationId,
            mustChangePassword: false,
            emailVerified: false,
          },
        });
        return { success: true };
      } else {
        const errorMessage = response.error?.message || 'Error al registrarse';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
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
    signup,
    logout,
    clearError: () => setError(null),
  };
};


import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { isWaiterAllowedPath } from '@/shared/constants/roles.constants';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const HYDRATE_FALLBACK_MS = 400;

/**
 * Componente para proteger rutas que requieren autenticación.
 * Espera a que el store rehidrate desde localStorage antes de decidir, para evitar
 * redirigir al login cuando el usuario sí está logueado pero el estado aún no se ha leído.
 * Incluye un fallback por tiempo por si onRehydrateStorage no dispara (p. ej. en algunos builds).
 * - Redirige al login si el usuario no está autenticado.
 * - Si el usuario es mesero (WAITER), solo puede acceder a POS y Órdenes;
 *   cualquier otra ruta redirige a /pos.
 */
export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const setHasHydrated = useAuthStore((s) => s.setHasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  useEffect(() => {
    if (hasHydrated) return;
    const t = setTimeout(() => setHasHydrated(true), HYDRATE_FALLBACK_MS);
    return () => clearTimeout(t);
  }, [hasHydrated, setHasHydrated]);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.warn('[Auth] PrivateRoute → redirect to login (guard)', {
      pathname: location.pathname,
      hasHydrated,
      isAuthenticated,
      hasUser: !!user,
    });
    return <Navigate to="/auth/login" replace />;
  }

  if (user?.rol === 'WAITER' && !isWaiterAllowedPath(location.pathname)) {
    return <Navigate to="/pos" replace />;
  }

  return <>{children}</>;
};


import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { isWaiterAllowedPath } from '@/shared/constants/roles.constants';

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * Componente para proteger rutas que requieren autenticación.
 * - Redirige al login si el usuario no está autenticado.
 * - Si el usuario es mesero (WAITER), solo puede acceder a POS y Órdenes;
 *   cualquier otra ruta redirige a /pos.
 */
export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user?.rol === 'WAITER' && !isWaiterAllowedPath(location.pathname)) {
    return <Navigate to="/pos" replace />;
  }

  return <>{children}</>;
};


import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, UtensilsCrossed, RotateCcw } from 'lucide-react';
import { organizationService } from '@/application/services';
import { AppError } from '@/domain/errors';
import { useAuthStore } from '@/presentation/store/auth.store';
import { getDefaultRouteForRole } from '@/shared/constants/roles.constants';
import type { UserRole } from '@/domain/types';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { ThemeToggle } from '@/presentation/components/ui/theme-toggle';
import { showSuccessToast } from '@/shared/utils/toast';

type Status = 'reactivating' | 'success' | 'already' | 'error';

/**
 * Reactivación de organización — paso 2 (ruta pública, `?token=...`).
 * Página a la que llega el owner desde el enlace del correo. Confirma la reactivación
 * con un POST al montar (sin botón: los escáneres de correo pre-cargan la URL pero no
 * ejecutan JS, así que no consumen el token). En éxito, el backend deja la sesión
 * iniciada (cookie HttpOnly) y devuelve la forma del login: poblamos el store y
 * entramos directo al dashboard, sin volver a pedir contraseña.
 *
 * Unicidad de uso por estado: si la org ya está activa (token reusado), el backend
 * responde ORGANIZATION_ALREADY_ACTIVE y mostramos "ya está activa, inicia sesión".
 */
export default function ConfirmReactivationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const loginStore = useAuthStore((s) => s.login);
  const token = searchParams.get('token') ?? '';

  const [status, setStatus] = useState<Status>(token ? 'reactivating' : 'error');
  const [message, setMessage] = useState(
    token ? '' : 'El enlace de reactivación es inválido o está incompleto.'
  );

  // Evita doble ejecución en StrictMode (el token es de un solo flujo).
  const startedRef = useRef(false);

  useEffect(() => {
    if (!token || startedRef.current) return;
    startedRef.current = true;

    organizationService
      .reactivate({ token })
      .then((response) => {
        if (!response.success || !response.data) {
          throw AppError.create('UNKNOWN_ERROR', 'No se pudo reactivar la organización');
        }
        const data = response.data;
        loginStore({
          token: data.token,
          user: {
            id: data.user.id,
            name: data.user.name,
            last_name: data.user.last_name,
            second_last_name: data.user.second_last_name,
            email: data.user.email,
            rol: data.user.rol,
            organizationId: data.user.organizationId,
            organizationName: data.user.organizationName,
            mustChangePassword: data.user.mustChangePassword,
            emailVerified: data.user.emailVerified,
          },
          branches: data.branches ?? [],
        });
        setStatus('success');
        showSuccessToast('Organización reactivada', 'Bienvenido de vuelta.');
        // Deja ver la confirmación un instante antes de entrar.
        setTimeout(() => {
          navigate(getDefaultRouteForRole(data.user.rol as UserRole), { replace: true });
        }, 1500);
      })
      .catch((error) => {
        // Token reusado sobre una org ya activa → mensaje específico "ya está activa".
        if (error instanceof AppError && error.code === 'ORGANIZATION_ALREADY_ACTIVE') {
          setStatus('already');
          return;
        }
        setStatus('error');
        setMessage(
          error instanceof AppError
            ? error.message
            : 'No se pudo reactivar la organización. El enlace pudo haber expirado.'
        );
      });
  }, [token, loginStore, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex items-center gap-2 text-primary">
            <UtensilsCrossed className="h-6 w-6" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">RESTIFY</span>
          </div>

          {status === 'reactivating' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Reactivando tu organización...
              </h1>
              <p className="text-sm text-muted-foreground">Esto solo tomará un momento.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                ¡Organización reactivada!
              </h1>
              <p className="text-sm text-muted-foreground">
                Te estamos llevando a tu panel...
              </p>
            </>
          )}

          {status === 'already' && (
            <>
              <RotateCcw className="h-12 w-12 text-primary" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Tu organización ya está activa
              </h1>
              <p className="text-sm text-muted-foreground">
                No necesitas hacer nada más. Inicia sesión para continuar.
              </p>
              <Button className="mt-2 w-full" onClick={() => navigate('/auth/login')}>
                Ir a iniciar sesión
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                No pudimos reactivar tu organización
              </h1>
              <p className="text-sm text-muted-foreground">{message}</p>
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => navigate('/auth/reactivate-organization')}
              >
                Solicitar un nuevo enlace
              </Button>
              <Link
                to="/auth/login"
                className="text-sm text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 hover:underline font-medium"
              >
                Volver al inicio de sesión
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, UtensilsCrossed, MailCheck } from 'lucide-react';
import { authService } from '@/application/services/auth.service';
import { AppError } from '@/domain/errors';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { ThemeToggle } from '@/presentation/components/ui/theme-toggle';

type Status = 'verifying' | 'success' | 'already' | 'error';

/**
 * Página a la que llega el usuario desde el link del correo (`/verify-email?token=...`).
 * Verifica el token contra el backend y muestra el resultado. Ruta pública (sin login).
 */
export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  // Sin token el estado inicial ya es de error; con token arranca en "verifying".
  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'error');
  const [message, setMessage] = useState(
    token ? '' : 'El enlace de verificación es inválido o está incompleto.'
  );

  // Evita doble verificación en StrictMode (el token es de un solo flujo).
  const startedRef = useRef(false);

  useEffect(() => {
    if (!token || startedRef.current) return;
    startedRef.current = true;

    authService
      .verifyEmail(token)
      .then((response) => {
        setStatus(response.data?.alreadyVerified ? 'already' : 'success');
      })
      .catch((error) => {
        setStatus('error');
        setMessage(
          error instanceof AppError
            ? error.message
            : 'No se pudo verificar el correo. El enlace pudo haber expirado.'
        );
      });
  }, [token]);

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

          {status === 'verifying' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Verificando tu correo...
              </h1>
              <p className="text-sm text-muted-foreground">Esto solo tomará un momento.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                ¡Correo verificado!
              </h1>
              <p className="text-sm text-muted-foreground">
                Tu cuenta quedó confirmada. Ya puedes usar Restify con normalidad.
              </p>
              <Button className="mt-2 w-full" onClick={() => navigate('/auth/login')}>
                Ir a iniciar sesión
              </Button>
            </>
          )}

          {status === 'already' && (
            <>
              <MailCheck className="h-12 w-12 text-primary" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Tu correo ya estaba verificado
              </h1>
              <p className="text-sm text-muted-foreground">
                No necesitas hacer nada más. Puedes continuar usando Restify.
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
                No pudimos verificar tu correo
              </h1>
              <p className="text-sm text-muted-foreground">{message}</p>
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => navigate('/auth/login')}
              >
                Volver a iniciar sesión
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

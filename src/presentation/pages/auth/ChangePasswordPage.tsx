import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UtensilsCrossed, Check, ShieldAlert } from 'lucide-react';
import { authService } from '@/application/services/auth.service';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useAuthStore } from '@/presentation/store/auth.store';
import { AppError } from '@/domain/errors';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/card';
import { ThemeToggle } from '@/presentation/components/ui/theme-toggle';
import { PasswordRequirements, passwordsMatch } from '@/presentation/components/ui/password-requirements';
import { showSuccessToast } from '@/shared/utils/toast';
import { getDefaultRouteForRole } from '@/shared/constants/roles.constants';
import { resetPasswordSchema, type ResetPasswordFormData } from './recover-password.schema';

/**
 * Cambio de contraseña forzado (flujo `mustChangePassword`).
 * El usuario ya inició sesión (el admin le reseteó el acceso o se le exige rotar la clave):
 * aquí define su nueva contraseña sin pedir la anterior. Al terminar, el backend baja el flag
 * y navegamos al destino según su rol.
 */
export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const clearMustChangePassword = useAuthStore((s) => s.clearMustChangePassword);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const watchPassword = watch('password') || '';
  const watchConfirmPassword = watch('confirmPassword') || '';
  const doPasswordsMatch = passwordsMatch(watchPassword, watchConfirmPassword);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.changeMyPassword(data.password);

      if (response.success) {
        clearMustChangePassword();
        showSuccessToast('Contraseña actualizada', 'Ya puedes usar tu nueva contraseña.');
        const rol = useAuthStore.getState().user?.rol;
        navigate(getDefaultRouteForRole(rol), { replace: true });
      } else {
        setError(response.error?.message || 'No se pudo cambiar la contraseña');
      }
    } catch (err) {
      const appError = err instanceof AppError ? err : AppError.create('UNKNOWN_ERROR', 'Error desconocido');
      setError(appError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle variant="icon" />
      </div>

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-8 w-8 text-primary dark:text-primary" />
          <span className="text-2xl font-serif font-bold tracking-wide text-slate-900 dark:text-white">
            RESTIFY
          </span>
        </div>
      </div>

      <Card className="w-full max-w-[450px] shadow-lg border-slate-100 dark:border-border bg-white dark:bg-card">
        <CardHeader className="space-y-3 text-center pb-8 pt-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-serif">
            Cambia tu contraseña
          </h2>
          <p className="text-sm text-slate-500 dark:text-muted-foreground">
            Por seguridad debes establecer una nueva contraseña antes de continuar.
          </p>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-10">
          {/* Error */}
          {error && (
            <div
              className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative"
              role="alert"
            >
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-foreground">
                Nueva Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  {...register('password')}
                  placeholder="Ingresa tu nueva contraseña"
                  type={showPassword ? 'text' : 'password'}
                  className={`pr-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-muted-foreground dark:hover:text-foreground focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <PasswordRequirements password={watchPassword} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-foreground">
                Confirmar Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  placeholder="Repite la contraseña"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`pr-10 ${
                    watchConfirmPassword.length > 0 && !doPasswordsMatch
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : doPasswordsMatch
                      ? 'border-green-500 focus-visible:ring-green-500'
                      : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-muted-foreground dark:hover:text-foreground focus:outline-none"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {watchConfirmPassword.length > 0 && !doPasswordsMatch && (
                <span className="text-destructive text-xs">Las contraseñas no coinciden</span>
              )}
              {doPasswordsMatch && (
                <span className="text-green-600 dark:text-green-400 text-xs flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Las contraseñas coinciden
                </span>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium text-base shadow-sm mt-2"
            >
              {isLoading ? 'Cambiando contraseña...' : 'Guardar y continuar'}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => logout().then(() => navigate('/auth/login', { replace: true }))}
                className="text-sm text-slate-500 hover:text-slate-700 dark:text-muted-foreground dark:hover:text-foreground hover:underline font-medium"
              >
                Cerrar sesión
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

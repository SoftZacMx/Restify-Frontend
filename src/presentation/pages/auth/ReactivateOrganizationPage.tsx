import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UtensilsCrossed, ArrowLeft, RotateCcw } from 'lucide-react';
import { organizationService } from '@/application/services';
import { AppError } from '@/domain/errors';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/card';
import { ThemeToggle } from '@/presentation/components/ui/theme-toggle';
import { showSuccessToast } from '@/shared/utils/toast';
import { loginSchema, type LoginFormData } from './login.schema';

/**
 * Reactivación de organización (ruta pública).
 * Tras cerrar la org, el login queda bloqueado; aquí el owner re-valida sus credenciales
 * (email + password) para reactivarla dentro de la ventana de 30 días. No pide el nombre.
 */
export default function ReactivateOrganizationPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await organizationService.reactivate({
        email: data.email,
        password: data.password,
      });

      if (response.success) {
        showSuccessToast('Organización reactivada', 'Ya puedes iniciar sesión con normalidad.');
        navigate('/auth/login', { replace: true });
      } else {
        setError(response.error?.message || 'No se pudo reactivar la organización');
      }
    } catch (err) {
      const appError = err instanceof AppError ? err : AppError.create('UNKNOWN_ERROR', 'Error desconocido');
      setError(appError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle variant="icon" />
      </div>

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="text-2xl font-serif font-bold tracking-wide text-slate-900 dark:text-white">
            RESTIFY
          </span>
        </div>
      </div>

      <Card className="w-full max-w-[450px] shadow-lg border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800">
        <CardHeader className="space-y-3 text-center pb-8 pt-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <RotateCcw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-serif">
            Reactivar organización
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ingresa las credenciales del propietario para reactivar tu organización.
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
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                {...register('email')}
                placeholder="correo@ejemplo.com"
                type="email"
                className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.email && (
                <span className="text-red-500 text-sm">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  {...register('password')}
                  placeholder="Introduce tu contraseña"
                  type={showPassword ? 'text' : 'password'}
                  className={`pr-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-500 text-sm">{errors.password.message}</span>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base shadow-sm mt-2"
            >
              {isLoading ? 'Reactivando...' : 'Reactivar organización'}
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/auth/login"
                className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

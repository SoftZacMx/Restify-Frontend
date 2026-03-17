import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UtensilsCrossed, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '@/application/services/auth.service';
import { AppError } from '@/domain/errors';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/card';
import { ThemeToggle } from '@/presentation/components/ui/theme-toggle';
import {
  verifyEmailSchema,
  resetPasswordSchema,
  type VerifyEmailFormData,
  type ResetPasswordFormData,
} from './recover-password.schema';

type Step = 'verify-email' | 'reset-password';

export default function RecoverPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('verify-email');
  const [userId, setUserId] = useState<string>('');
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const emailForm = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
  });

  const passwordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onVerifyEmail = async (data: VerifyEmailFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.verifyUser(data.email);

      if (response.success && response.data) {
        const responseData = response.data as any;
        setUserId(responseData.id);
        setVerifiedEmail(data.email);
        setStep('reset-password');
      } else {
        setError(response.error?.message || 'No se pudo verificar el usuario');
      }
    } catch (err) {
      const appError = err instanceof AppError ? err : AppError.create('UNKNOWN_ERROR', 'Error desconocido');
      setError(appError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.setPassword(userId, data.password);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
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

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle variant="icon" />
        </div>

        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-2xl font-serif font-bold tracking-wide text-slate-900 dark:text-white">
              RESTIFY
            </span>
          </div>
        </div>

        <Card className="w-full max-w-[450px] shadow-lg border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800">
          <CardContent className="flex flex-col items-center gap-4 py-12 px-8">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif">
              Contraseña actualizada
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Tu contraseña ha sido cambiada exitosamente. Redirigiendo al inicio de sesión...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <CardHeader className="space-y-1 text-center pb-8 pt-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-serif">
            {step === 'verify-email' ? 'Recuperar Contraseña' : 'Nueva Contraseña'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {step === 'verify-email'
              ? 'Ingresa tu correo electrónico para verificar tu cuenta.'
              : `Establece una nueva contraseña para ${verifiedEmail}`}
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

          {/* Step 1: Verify Email */}
          {step === 'verify-email' && (
            <form onSubmit={emailForm.handleSubmit(onVerifyEmail)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  {...emailForm.register('email')}
                  placeholder="correo@ejemplo.com"
                  type="email"
                  className={emailForm.formState.errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {emailForm.formState.errors.email && (
                  <span className="text-red-500 text-sm">{emailForm.formState.errors.email.message}</span>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base shadow-sm mt-2"
              >
                {isLoading ? 'Verificando...' : 'Verificar Cuenta'}
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
          )}

          {/* Step 2: Reset Password */}
          {step === 'reset-password' && (
            <form onSubmit={passwordForm.handleSubmit(onResetPassword)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nueva Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    {...passwordForm.register('password')}
                    placeholder="Mínimo 6 caracteres"
                    type={showPassword ? 'text' : 'password'}
                    className={`pr-10 ${passwordForm.formState.errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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
                {passwordForm.formState.errors.password && (
                  <span className="text-red-500 text-sm">{passwordForm.formState.errors.password.message}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    {...passwordForm.register('confirmPassword')}
                    placeholder="Repite la contraseña"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`pr-10 ${passwordForm.formState.errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus:outline-none"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <span className="text-red-500 text-sm">{passwordForm.formState.errors.confirmPassword.message}</span>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base shadow-sm mt-2"
              >
                {isLoading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('verify-email');
                    setError(null);
                    passwordForm.reset();
                  }}
                  className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cambiar correo
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

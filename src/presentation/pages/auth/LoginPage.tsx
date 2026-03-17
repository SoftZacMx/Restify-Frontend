import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useAuthStore } from '@/presentation/store/auth.store';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/card';
import { ThemeToggle } from '@/presentation/components/ui/theme-toggle';
import { loginSchema, type LoginFormData } from './login.schema';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    const result = await login({
      email: data.email,
      password: data.password,
    });

    if (result.success) {
      const currentUser = useAuthStore.getState().user;
      navigate(currentUser?.rol === 'WAITER' ? '/pos' : '/dashboard');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle variant="icon" />
      </div>

      {/* Logo Section */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="text-2xl font-serif font-bold tracking-wide text-slate-900 dark:text-white">
            RESTIFY
          </span>
        </div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-[450px] shadow-lg border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800">
        <CardHeader className="space-y-1 text-center pb-8 pt-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-serif">
            Bienvenido de Nuevo
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Inicia sesión para gestionar tu restaurante.
          </p>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-10">
          {/* Error Message */}
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
            {/* Email Field */}
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

            {/* Password Field */}
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
                  onClick={togglePasswordVisibility}
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

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base shadow-sm mt-2"
            >
              {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
            </Button>

            {/* Forgot Password Link */}
            <div className="text-center pt-2">
              <Link
                to="/auth/recover-password"
                className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

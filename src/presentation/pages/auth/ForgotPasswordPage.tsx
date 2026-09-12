import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UtensilsCrossed, ArrowLeft, MailCheck } from 'lucide-react';
import { authService } from '@/application/services/auth.service';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Card, CardContent, CardHeader } from '@/presentation/components/ui/card';
import { ThemeToggle } from '@/presentation/components/ui/theme-toggle';
import { verifyEmailSchema, type VerifyEmailFormData } from './recover-password.schema';

/**
 * Flujo forgot-password (paso 1): pide el correo y solicita al backend el envío del
 * enlace de restablecimiento. Ruta pública (sin login).
 *
 * Anti-enumeración: tanto en éxito como en error mostramos el mismo mensaje neutro,
 * para no revelar si el correo existe. El backend responde siempre 200.
 */
export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
  });

  const onSubmit = async (data: VerifyEmailFormData) => {
    setIsLoading(true);
    try {
      await authService.requestPasswordReset(data.email);
    } catch {
      // Ignoramos el error a propósito: la pantalla de éxito es la misma exista o no
      // la cuenta (anti-enumeración). Un fallo real (red/SES) tampoco se le revela.
    } finally {
      setIsLoading(false);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background flex flex-col items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle variant="icon" />
        </div>

        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-8 w-8 text-primary dark:text-primary" />
            <span className="text-2xl font-serif font-bold tracking-wide text-slate-900 dark:text-white">
              RESTIFY
            </span>
          </div>
        </div>

        <Card className="w-full max-w-[450px] shadow-lg border-slate-100 dark:border-border bg-white dark:bg-card">
          <CardContent className="flex flex-col items-center gap-4 py-12 px-8">
            <MailCheck className="h-16 w-16 text-primary" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif text-center">
              Revisa tu correo
            </h2>
            <p className="text-sm text-slate-500 dark:text-muted-foreground text-center">
              Si existe una cuenta asociada a ese correo, te enviamos un enlace para
              restablecer tu contraseña. El enlace caduca en 5 minutos.
            </p>
            <Link
              to="/auth/login"
              className="text-sm text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 hover:underline font-medium inline-flex items-center gap-1 pt-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <CardHeader className="space-y-1 text-center pb-8 pt-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-serif">
            Recuperar Contraseña
          </h2>
          <p className="text-sm text-slate-500 dark:text-muted-foreground">
            Ingresa tu correo y te enviaremos un enlace para restablecerla.
          </p>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-10">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-foreground">
                Email
              </Label>
              <Input
                id="email"
                {...form.register('email')}
                placeholder="correo@ejemplo.com"
                type="email"
                className={form.formState.errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {form.formState.errors.email && (
                <span className="text-destructive text-sm">{form.formState.errors.email.message}</span>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium text-base shadow-sm mt-2"
            >
              {isLoading ? 'Enviando...' : 'Enviar enlace'}
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/auth/login"
                className="text-sm text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 hover:underline font-medium inline-flex items-center gap-1"
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

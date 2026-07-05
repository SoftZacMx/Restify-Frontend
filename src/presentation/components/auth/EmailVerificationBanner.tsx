import { useState } from 'react';
import { MailWarning, X } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { authService } from '@/application/services/auth.service';
import { useAuthStore } from '@/presentation/store/auth.store';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

/**
 * Aviso persistente para usuarios autenticados que aún no verificaron su correo.
 * Ofrece reenviar el correo de verificación. Se oculta si el email ya está verificado
 * o si el usuario lo descarta en la sesión actual.
 */
export const EmailVerificationBanner = () => {
  const user = useAuthStore((s) => s.user);
  const [dismissed, setDismissed] = useState(false);
  const [isResending, setIsResending] = useState(false);

  if (!user || user.emailVerified || dismissed) return null;

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authService.resendVerification(user.email);
      showSuccessToast(
        'Correo enviado',
        'Revisa tu bandeja de entrada para verificar tu cuenta.'
      );
    } catch (error) {
      showErrorToast(
        'No se pudo reenviar',
        error instanceof AppError ? error.message : 'Intentalo de nuevo en unos minutos.'
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 px-4 py-3">
      <div className="flex items-center gap-2">
        <MailWarning className="h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
        <span className="text-sm text-yellow-700 dark:text-yellow-300">
          Verifica tu correo para asegurar tu cuenta. Enviamos un enlace a{' '}
          <strong>{user.email}</strong>.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          disabled={isResending}
          className="h-7 text-xs border-yellow-400 text-yellow-700 hover:bg-yellow-100 dark:text-yellow-300 dark:hover:bg-yellow-900/40"
          onClick={handleResend}
        >
          {isResending ? 'Enviando...' : 'Reenviar correo'}
        </Button>
        <button onClick={() => setDismissed(true)} aria-label="Descartar aviso">
          <X className="h-4 w-4 text-yellow-500" />
        </button>
      </div>
    </div>
  );
};

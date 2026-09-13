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
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-apoyo bg-apoyo-suave px-4 py-3">
      <div className="flex items-center gap-2">
        <MailWarning className="h-4 w-4 shrink-0 text-apoyo" />
        <span className="text-sm text-apoyo-texto">
          Verifica tu correo para asegurar tu cuenta. Enviamos un enlace a{' '}
          <strong>{user.email}</strong>.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          disabled={isResending}
          className="h-7 text-xs border-apoyo text-apoyo-texto hover:bg-apoyo-suave"
          onClick={handleResend}
        >
          {isResending ? 'Enviando...' : 'Reenviar correo'}
        </Button>
        <button onClick={() => setDismissed(true)} aria-label="Descartar aviso">
          <X className="h-4 w-4 text-apoyo" />
        </button>
      </div>
    </div>
  );
};

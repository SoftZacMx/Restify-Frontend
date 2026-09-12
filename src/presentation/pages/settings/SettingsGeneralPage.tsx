import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useAuthStore } from '@/presentation/store/auth.store';
import { organizationService } from '@/application/services';
import { AppError } from '@/domain/errors';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';
import { CloseOrganizationDialog } from '@/presentation/components/settings/CloseOrganizationDialog';

/**
 * Página de configuración general (paleta de colores).
 * El modo claro/oscuro se alterna desde el pie de la sidebar.
 * Se muestra dentro del layout de configuración en /settings.
 */
const SettingsGeneralPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.rol === 'OWNER';
  const organizationName = user?.organizationName ?? '';

  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleConfirmClose = async () => {
    setIsClosing(true);
    try {
      await organizationService.close(organizationName);
      showSuccessToast(
        'Organización cerrada',
        'Tu organización fue cerrada. Puedes reactivarla dentro de los próximos 30 días.'
      );
      await logout();
      navigate('/auth/login', { replace: true });
    } catch (error) {
      const message = error instanceof AppError ? error.message : 'No se pudo cerrar la organización';
      showErrorToast('Error al cerrar organización', message);
      setIsClosing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Zona de peligro — solo owner */}
      {isOwner && (
        <Card className="border-red-200 dark:border-red-900/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Zona de peligro
            </CardTitle>
            <CardDescription>
              Cerrar la organización cerrará la sesión de todos sus usuarios. Podrás reactivarla
              dentro de los 30 días siguientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-red-200 dark:border-red-900/50 p-4">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Cerrar organización
                </p>
                <p className="text-sm text-slate-500 dark:text-muted-foreground">
                  Esta acción no es inmediata: la organización se elimina de forma permanente a los 30 días.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setIsCloseDialogOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white shrink-0"
              >
                Cerrar organización
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <CloseOrganizationDialog
        open={isCloseDialogOpen}
        onClose={() => setIsCloseDialogOpen(false)}
        organizationName={organizationName}
        isLoading={isClosing}
        onConfirm={handleConfirmClose}
      />
    </div>
  );
};

export default SettingsGeneralPage;

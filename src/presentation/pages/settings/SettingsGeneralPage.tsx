import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { usePalette } from '@/presentation/contexts/palette.context';
import { Palette, AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/utils';
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
  const { paletteId, setPaletteId, palettes } = usePalette();
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
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-primary" />
            Paleta de colores
          </CardTitle>
          <CardDescription>
            Selecciona una paleta; el color principal se aplicará a botones, enlaces y acentos en toda la app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {palettes.map((palette) => {
              const isSelected = paletteId === palette.id;
              return (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => setPaletteId(palette.id)}
                  className={cn(
                    'flex flex-col items-stretch rounded-xl border-2 p-4 text-left transition-all hover:shadow-md',
                    isSelected
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md ring-2 ring-primary/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50'
                  )}
                >
                  <div
                    className="h-10 w-full rounded-lg mb-3 shadow-inner"
                    style={{ backgroundColor: palette.previewHex }}
                  />
                  <span className="font-medium text-slate-900 dark:text-white text-sm">
                    {palette.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {palette.description}
                  </span>
                  {isSelected && (
                    <span className="mt-2 text-xs font-medium text-primary">Seleccionada</span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
                <p className="text-sm text-slate-500 dark:text-slate-400">
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

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';

interface CloseOrganizationDialogProps {
  open: boolean;
  onClose: () => void;
  organizationName: string;
  isLoading: boolean;
  onConfirm: () => void;
}

/**
 * Diálogo de confirmación para cerrar (soft-delete) la organización.
 * Confirmación tipo "type to confirm": el owner debe escribir el nombre exacto de la
 * organización. Se muestra el nombre actual como texto seleccionable para poder copiarlo.
 */
export function CloseOrganizationDialog({
  open,
  onClose,
  organizationName,
  isLoading,
  onConfirm,
}: CloseOrganizationDialogProps) {
  const [confirmationName, setConfirmationName] = useState('');
  const matches = confirmationName === organizationName;

  const handleClose = () => {
    if (isLoading) return;
    setConfirmationName('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Cerrar organización
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Esta acción cerrará tu organización y cerrará la sesión de todos sus usuarios.
            Podrás reactivarla dentro de los próximos 30 días; después se eliminará de forma
            permanente.
          </p>

          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Nombre de tu organización
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white select-all break-words">
              {organizationName}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmationName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Escribe el nombre para confirmar
            </Label>
            <Input
              id="confirmationName"
              value={confirmationName}
              onChange={(e) => setConfirmationName(e.target.value)}
              placeholder={organizationName}
              autoComplete="off"
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={!matches || isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? 'Cerrando...' : 'Cerrar organización'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

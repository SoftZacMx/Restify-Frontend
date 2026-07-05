import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/presentation/components/ui/dialog';
import { cn } from '@/shared/lib/utils';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Ancho del contenido; por defecto el usado por los diálogos con formulario. */
  contentClassName?: string;
}

/**
 * Contenedor universal para diálogos con contenido libre (formularios, vistas de detalle).
 * Encapsula el cascarón repetido (`DialogContent` + `DialogClose` + header) y recibe el
 * contenido específico vía `children`. Para confirmaciones destructivas usar `ConfirmDialog`.
 */
export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  contentClassName,
}) => (
  <Dialog
    open={open}
    onOpenChange={(next) => {
      if (!next) onClose();
    }}
  >
    <DialogContent
      className={cn('w-full md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto', contentClassName)}
    >
      <DialogClose />
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);

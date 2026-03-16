import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils';

export interface LoadingOverlayProps {
  /** Si es true, el overlay cubre la vista; si es false, no se renderiza */
  open: boolean;
  /** Mensaje opcional debajo del spinner */
  message?: string;
  /** Clases adicionales para el contenedor */
  className?: string;
}

/**
 * Overlay de carga que cubre toda la vista con transparencia
 * y un spinner circular animado centrado.
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  open,
  message,
  className,
}) => {
  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        'bg-background/70 backdrop-blur-sm',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message ?? 'Cargando'}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2
          className="h-12 w-12 animate-spin text-primary"
          aria-hidden
        />
        {message && (
          <p className="text-sm font-medium text-foreground max-w-xs text-center">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

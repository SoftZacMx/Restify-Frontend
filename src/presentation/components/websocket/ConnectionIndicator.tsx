/**
 * Indicador de estado de conexión WebSocket
 */

import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Tooltip } from '@/presentation/components/ui/tooltip';

interface ConnectionIndicatorProps {
  isConnected: boolean;
  connectionId?: string | null;
  showLabel?: boolean;
  className?: string;
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  isConnected,
  connectionId,
  showLabel = false,
  className,
}) => {
  // Construir el contenido del tooltip
  const tooltipContent = isConnected
    ? `Conectado al servidor${connectionId ? ` (ID: ${connectionId.slice(-12)})` : ''}`
    : 'Sin conexión - Las notificaciones en tiempo real no están disponibles';

  return (
    <Tooltip content={tooltipContent} side="bottom">
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1 rounded-full transition-colors cursor-default',
          isConnected
            ? 'bg-fresco-suave'
            : 'bg-destructive-suave',
          className
        )}
      >
        {/* Indicador de punto */}
        <span className="relative flex h-2.5 w-2.5">
          {isConnected && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fresco opacity-75" />
          )}
          <span
            className={cn(
              'relative inline-flex rounded-full h-2.5 w-2.5',
              isConnected ? 'bg-fresco' : 'bg-destructive'
            )}
          />
        </span>

        {/* Icono */}
        {isConnected ? (
          <Wifi className="h-4 w-4 text-fresco" />
        ) : (
          <WifiOff className="h-4 w-4 text-destructive" />
        )}

        {/* Label opcional */}
        {showLabel && (
          <span
            className={cn(
              'text-xs font-medium',
              isConnected
                ? 'text-fresco-texto'
                : 'text-destructive-texto'
            )}
          >
            {isConnected ? 'En línea' : 'Desconectado'}
          </span>
        )}
      </div>
    </Tooltip>
  );
};

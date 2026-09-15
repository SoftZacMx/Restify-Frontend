import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

const ERROR_CODE = 'ERR_SYSTEM_CRASH_0X42';

interface ErrorBoundaryFallbackProps {
  onRetry?: () => void;
}

/**
 * UI de fallback cuando el Error Boundary captura un error.
 * Respeta el tema (light/dark) del usuario. Sin header: solo mensaje y acciones.
 */
export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({ onRetry }) => {
  useEffect(() => {
    const prev = document.title;
    document.title = 'Error Boundary RESTIFY';
    return () => {
      document.title = prev;
    };
  }, []);

  const handleRetry = () => {
    if (onRetry) onRetry();
    else window.location.reload();
  };

  const handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted text-foreground">
      {/* Contenido centrado - sin header */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-border bg-primary/10 dark:bg-primary/20">
            <AlertTriangle className="h-10 w-10 text-primary" strokeWidth={2} />
          </div>

          <div className="space-y-2">
            <h1 className="text-h1 text-foreground">
              ¡Ups! Algo salió mal
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ha ocurrido un error inesperado en el sistema. No te preocupes, tus datos están a
              salvo. Por favor, intenta realizar la acción nuevamente.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Intentar de nuevo
            </button>
            <button
              type="button"
              onClick={handleGoToDashboard}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary dark:hover:bg-card focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Volver al Dashboard
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            CÓDIGO DE ERROR: {ERROR_CODE}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        © 2024 RESTIFY Admin Panel. Todos los derechos reservados.
      </footer>
    </div>
  );
};

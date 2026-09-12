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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background text-slate-900 dark:text-foreground">
      {/* Contenido centrado - sin header */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-slate-300 dark:border-border bg-primary/10 dark:bg-primary/20">
            <AlertTriangle className="h-10 w-10 text-primary dark:text-primary" strokeWidth={2} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-foreground">
              ¡Ups! Algo salió mal
            </h1>
            <p className="text-sm text-slate-600 dark:text-muted-foreground leading-relaxed">
              Ha ocurrido un error inesperado en el sistema. No te preocupes, tus datos están a
              salvo. Por favor, intenta realizar la acción nuevamente.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Intentar de nuevo
            </button>
            <button
              type="button"
              onClick={handleGoToDashboard}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-200 dark:bg-card px-5 py-2.5 text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-card focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Volver al Dashboard
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-2">
            CÓDIGO DE ERROR: {ERROR_CODE}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-slate-500 dark:text-muted-foreground border-t border-slate-200 dark:border-border/50">
        © 2024 RESTIFY Admin Panel. Todos los derechos reservados.
      </footer>
    </div>
  );
};

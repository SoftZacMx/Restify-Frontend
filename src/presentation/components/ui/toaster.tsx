import { Toaster as SonnerToaster } from 'sonner';

/**
 * Componente Toaster
 * Wrapper para Sonner que proporciona notificaciones toast
 * Soporta dark mode y personalización
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      expand={true}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'bg-white dark:bg-card border border-slate-200 dark:border-border text-slate-900 dark:text-foreground',
          title: 'text-slate-900 dark:text-foreground font-semibold',
          description: 'text-slate-600 dark:text-muted-foreground',
          success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
          info: 'bg-primary/10 dark:bg-primary/20/20 border-primary/30 dark:border-primary',
        },
      }}
    />
  );
}

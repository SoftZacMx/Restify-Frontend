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
          toast: 'bg-card border border-border text-foreground',
          title: 'text-foreground font-semibold',
          description: 'text-muted-foreground',
          success: 'bg-fresco-suave border-fresco',
          error: 'bg-destructive-suave border-destructive',
          warning: 'bg-apoyo-suave border-apoyo',
          info: 'bg-primary/10 dark:bg-primary/20 border-primary/30 dark:border-primary',
        },
      }}
    />
  );
}

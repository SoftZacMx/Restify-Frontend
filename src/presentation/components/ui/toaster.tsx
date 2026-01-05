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
          toast: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100',
          title: 'text-slate-900 dark:text-slate-100 font-semibold',
          description: 'text-slate-600 dark:text-slate-400',
          success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
          info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        },
      }}
    />
  );
}

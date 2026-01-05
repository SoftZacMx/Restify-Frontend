import { toast } from 'sonner';

/**
 * Utilidades para mostrar notificaciones toast
 * Centraliza las llamadas a toast para mantener consistencia
 */

/**
 * Muestra un toast de éxito
 */
export const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 3000,
  });
};

/**
 * Muestra un toast de error
 */
export const showErrorToast = (message: string, description?: string) => {
  toast.error(message, {
    description,
    duration: 4000,
  });
};

/**
 * Muestra un toast de advertencia
 */
export const showWarningToast = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    duration: 3500,
  });
};

/**
 * Muestra un toast de información
 */
export const showInfoToast = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 3000,
  });
};

/**
 * Muestra un toast de carga (promise)
 */
export const showLoadingToast = (message: string, promise: Promise<any>) => {
  return toast.promise(promise, {
    loading: message,
    success: 'Operación completada',
    error: 'Error al completar la operación',
  });
};


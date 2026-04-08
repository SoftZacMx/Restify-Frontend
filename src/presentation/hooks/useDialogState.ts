import { useState, useCallback } from 'react';

/**
 * Hook genérico para gestionar el estado de un diálogo/modal.
 * Encapsula isOpen + data en un solo lugar.
 *
 * Uso:
 *   const deleteDialog = useDialogState<Order>();
 *   deleteDialog.open(order);   // abre con data
 *   deleteDialog.close();       // cierra y limpia data
 *   deleteDialog.isOpen         // boolean
 *   deleteDialog.data           // T | null
 */
export function useDialogState<T = undefined>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((item?: T) => {
    setData(item ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  return { isOpen, data, open, close };
}

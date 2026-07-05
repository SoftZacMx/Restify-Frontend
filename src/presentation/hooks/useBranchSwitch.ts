import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/application/services/auth.service';
import { useAuthStore } from '@/presentation/store/auth.store';
import { showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

/** Query keys cuyos datos dependen de la sucursal activa y deben recargarse al cambiar. */
const BRANCH_SCOPED_QUERY_KEYS = [
  'orders',
  'order',
  'tables',
  'tables-for-filter',
  'menuItems',
  'menuCategories',
  'products',
  'expenses',
  'dashboard',
  'employees',
];

/**
 * Encapsula el cambio de sucursal activa: pide el nuevo token al backend,
 * lo guarda junto a la sucursal elegida e invalida los datos de la sucursal anterior.
 */
export const useBranchSwitch = () => {
  const queryClient = useQueryClient();
  const selectBranch = useAuthStore((state) => state.selectBranch);
  const [isSwitching, setIsSwitching] = useState(false);

  const switchBranch = async (branchId: string): Promise<boolean> => {
    setIsSwitching(true);
    try {
      const token = await authService.switchBranch(branchId);
      selectBranch(branchId, token);
      BRANCH_SCOPED_QUERY_KEYS.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      return true;
    } catch (error) {
      showErrorToast(
        'No se pudo cambiar de sucursal',
        error instanceof AppError ? error.message : 'Intentalo de nuevo'
      );
      return false;
    } finally {
      setIsSwitching(false);
    }
  };

  return { switchBranch, isSwitching };
};

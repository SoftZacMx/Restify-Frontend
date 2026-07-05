import { useAuthStore } from '../store/auth.store';
import type { AccessibleBranch } from '@/domain/types';

interface UseActiveBranch {
  /** Sucursal elegida; null si hay varias y el usuario aún no elige. */
  selectedBranchId: string | null;
  /** La sucursal elegida resuelta a su objeto, o null. */
  selectedBranch: AccessibleBranch | null;
  /** Sucursales accesibles para el usuario. */
  branches: AccessibleBranch[];
  /** El usuario tiene más de una sucursal (muestra el selector / opción de cambiar). */
  hasMultipleBranches: boolean;
  /** Hay que obligar a elegir sucursal antes de dejar entrar a la app. */
  needsBranchSelection: boolean;
}

/**
 * Expone la sucursal activa y la lista de sucursales accesibles desde el auth store.
 * Lo consumen la pantalla de selección (Fase 2) y la config por sucursal (Fase 1).
 */
export const useActiveBranch = (): UseActiveBranch => {
  const branches = useAuthStore((state) => state.branches);
  const selectedBranchId = useAuthStore((state) => state.selectedBranchId);

  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) ?? null;

  return {
    selectedBranchId,
    selectedBranch,
    branches,
    hasMultipleBranches: branches.length > 1,
    needsBranchSelection: branches.length > 1 && selectedBranchId === null,
  };
};

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Store } from 'lucide-react';
import { Badge } from '@/presentation/components/ui/badge';
import { branchService } from '@/application/services';
import type { User as UserType, UserRole } from '@/domain/types';

interface UserBranchesProps {
  user: UserType;
}

// OWNER y ADMIN acceden a toda la organización, sin asignación explícita.
const ORG_WIDE_ROLES: UserRole[] = ['OWNER', 'ADMIN'];

/**
 * Card con las sucursales a las que el usuario tiene acceso.
 * `branchIds` solo trae ids: los nombres se resuelven con la lista de sucursales.
 */
export const UserBranches: React.FC<UserBranchesProps> = ({ user }) => {
  const hasOrgWideAccess = ORG_WIDE_ROLES.includes(user.rol);
  const assignedIds = user.branchIds ?? [];

  // Incluye deshabilitadas: la asignación sigue existiendo aunque la sucursal se apague.
  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches', 'all'],
    queryFn: () => branchService.listBranches(true),
    enabled: !hasOrgWideAccess && assignedIds.length > 0,
  });

  const assignedBranches = branches.filter((branch) => assignedIds.includes(branch.id));

  const renderContent = () => {
    if (hasOrgWideAccess) {
      return (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Este rol tiene acceso a todas las sucursales de la organización.
        </p>
      );
    }

    if (assignedIds.length === 0) {
      return (
        <p className="text-sm text-slate-500 dark:text-slate-400">Sin sucursales asignadas</p>
      );
    }

    if (isLoading) {
      return <p className="text-sm text-slate-500 dark:text-slate-400">Cargando sucursales...</p>;
    }

    if (assignedBranches.length === 0) {
      return (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No se pudo obtener el nombre de las sucursales asignadas.
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignedBranches.map((branch) => (
          <div
            key={branch.id}
            className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 p-3 min-w-0"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
              <Store className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {branch.name}
                </p>
                {branch.status === 'disabled' && (
                  <Badge className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                    Deshabilitada
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {branch.city}, {branch.state}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-6">
        Sucursales Asignadas
      </h3>
      {renderContent()}
    </div>
  );
};

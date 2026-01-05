import React from 'react';
import { Badge } from '@/presentation/components/ui/badge';
import type { User } from '@/domain/types';
import { getRoleLabel, getStatusLabel } from '@/shared/utils';

interface UserAccountInfoProps {
  user: User;
}

/**
 * Componente para mostrar la información de la cuenta del usuario
 */
export const UserAccountInfo: React.FC<UserAccountInfoProps> = ({ user }) => {
  const statusLabel = getStatusLabel(user.status);
  const roleLabel = getRoleLabel(user.rol);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-6">
        Información de la Cuenta
      </h3>
      <div className="flex flex-col gap-5 text-sm">
        <div className="flex justify-between items-center">
          <p className="text-slate-500 dark:text-slate-400 font-medium">Estado</p>
          <Badge
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
              user.status
                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
            }`}
          >
            {statusLabel}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-slate-500 dark:text-slate-400 font-medium">Rol</p>
          <p className="text-slate-800 dark:text-slate-200 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
            {roleLabel}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">ID de Usuario</p>
          <p className="text-slate-800 dark:text-slate-200 mt-1 font-mono text-xs">{user.id}</p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Fecha de creación</p>
          <p className="text-slate-800 dark:text-slate-200 mt-1">
            {new Date(user.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Última actualización</p>
          <p className="text-slate-800 dark:text-slate-200 mt-1">
            {new Date(user.updatedAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
};


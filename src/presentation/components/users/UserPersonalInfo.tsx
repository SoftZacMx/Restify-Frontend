import React from 'react';
import type { User } from '@/domain/types';

interface UserPersonalInfoProps {
  user: User;
}

/**
 * Componente para mostrar la información personal del usuario
 */
export const UserPersonalInfo: React.FC<UserPersonalInfoProps> = ({ user }) => {
  const fullName = `${user.name} ${user.last_name}${user.second_last_name ? ` ${user.second_last_name}` : ''}`;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-6">
        Información Personal
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 text-sm">
        <div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Nombre completo</p>
          <p className="text-slate-800 dark:text-slate-200 mt-1">{fullName}</p>
        </div>
        <div className="sm:col-span-2 min-w-0">
          <p className="text-slate-500 dark:text-slate-400 font-medium">Email</p>
          <p className="text-slate-800 dark:text-slate-200 mt-1 break-words break-all">{user.email}</p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Número de teléfono</p>
          <p className="text-slate-800 dark:text-slate-200 mt-1">
            {user.phone || 'No proporcionado'}
          </p>
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
      </div>
    </div>
  );
};


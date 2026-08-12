import React from 'react';
import { Edit, Mail, Phone, CalendarDays } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/presentation/components/ui/avatar';
import { Button } from '@/presentation/components/ui/button';
import type { User } from '@/domain/types';
import { getFullName, getRoleLabel, getStatusLabel } from '@/shared/utils';
import { getInitials } from '@/shared/utils/dashboard.utils';
import { APP_TIMEZONE } from '@/shared/constants';

interface UserProfileHeaderProps {
  user: User;
  onEdit: () => void;
}


/**
 * Cabecera de perfil del usuario: avatar con iniciales, nombre, badges de rol/estado
 * y datos de contacto en tarjetas. Solo UI, no requiere datos adicionales de la API.
 */
export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ user, onEdit }) => {
  const fullName = getFullName(user);
  const roleLabel = getRoleLabel(user.rol);
  const statusLabel = getStatusLabel(user.status);
  const memberSince = new Date(user.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: APP_TIMEZONE,
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 pb-6 pt-6">
        {/* Avatar + nombre + acciones */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-slate-800 shadow-lg">
              <AvatarFallback className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-3xl font-black">
                {getInitials(user.name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">
                {fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <span
                    className={`h-2 w-2 rounded-full ${user.status ? 'bg-green-500' : 'bg-slate-400'}`}
                  />
                  {statusLabel}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{roleLabel}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={onEdit}
            className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span className="truncate">Editar Usuario</span>
          </Button>
        </div>

        {/* Tarjetas de contacto */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Email</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Phone className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Teléfono</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user.phone || 'No proporcionado'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Miembro desde</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{memberSince}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

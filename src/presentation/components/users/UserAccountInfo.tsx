import React from 'react';
import { ShieldCheck, UserCog, CalendarDays, Clock } from 'lucide-react';
import { Badge } from '@/presentation/components/ui/badge';
import type { User as UserType } from '@/domain/types';
import { getRoleLabel, getStatusLabel } from '@/shared/utils';
import { APP_TIMEZONE } from '@/shared/constants';

interface UserAccountInfoProps {
  user: UserType;
}

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: APP_TIMEZONE,
  });

/**
 * Componente para mostrar la información de la cuenta del usuario
 */
export const UserAccountInfo: React.FC<UserAccountInfoProps> = ({ user }) => {
  const statusLabel = getStatusLabel(user.status);
  const roleLabel = getRoleLabel(user.rol);

  const rows = [
    {
      icon: ShieldCheck,
      label: 'Estado',
      value: (
        <Badge
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
            user.status
              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
              : 'bg-slate-100 text-slate-800 dark:bg-card dark:text-foreground'
          }`}
        >
          {statusLabel}
        </Badge>
      ),
    },
    {
      icon: UserCog,
      label: 'Rol',
      value: (
        <span className="text-slate-800 dark:text-foreground font-medium bg-slate-100 dark:bg-card px-2 py-1 rounded text-xs">
          {roleLabel}
        </span>
      ),
    },
    { icon: CalendarDays, label: 'Fecha de creación', value: formatDate(user.createdAt) },
    { icon: Clock, label: 'Última actualización', value: formatDate(user.updatedAt) },
  ];

  return (
    <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6 border border-slate-200 dark:border-border h-full">
      <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-6">
        Información de la Cuenta
      </h3>
      <div className="flex flex-col gap-5 text-sm">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.label} className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-card text-slate-500 dark:text-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-slate-500 dark:text-muted-foreground font-medium">{row.label}</p>
              </div>
              <div className="min-w-0 text-right">{row.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

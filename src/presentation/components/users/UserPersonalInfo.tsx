import React from 'react';
import { User, Mail, Phone, CalendarDays } from 'lucide-react';
import type { User as UserType } from '@/domain/types';
import { getFullName } from '@/shared/utils';
import { APP_TIMEZONE } from '@/shared/constants';

interface UserPersonalInfoProps {
  user: UserType;
}

const fields = [
  { icon: User, label: 'Nombre completo', value: (u: UserType) => getFullName(u), colSpan: 'sm:col-span-2' },
  { icon: Mail, label: 'Email', value: (u: UserType) => u.email, colSpan: 'sm:col-span-2', breakWords: true },
  { icon: Phone, label: 'Teléfono', value: (u: UserType) => u.phone || 'No proporcionado', colSpan: '' },
  {
    icon: CalendarDays,
    label: 'Fecha de creación',
    value: (u: UserType) =>
      new Date(u.createdAt).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: APP_TIMEZONE,
      }),
    colSpan: '',
  },
];

/**
 * Componente para mostrar la información personal del usuario
 */
export const UserPersonalInfo: React.FC<UserPersonalInfoProps> = ({ user }) => {
  return (
    <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6 border border-slate-200 dark:border-border h-full">
      <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-6">
        Información Personal
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 text-sm">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.label} className={`flex items-start gap-3 min-w-0 ${field.colSpan}`}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-slate-500 dark:text-muted-foreground font-medium text-xs">{field.label}</p>
                <p
                  className={`text-slate-800 dark:text-foreground mt-0.5 font-medium ${
                    field.breakWords ? 'break-words break-all' : ''
                  }`}
                >
                  {field.value(user)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

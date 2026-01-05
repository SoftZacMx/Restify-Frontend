import React from 'react';
import { Receipt, Table } from 'lucide-react';

interface UserStatisticsProps {
  userId: string;
}

/**
 * Componente para mostrar estadísticas del usuario
 * TODO: Conectar con API para obtener estadísticas reales
 */
export const UserStatistics: React.FC<UserStatisticsProps> = ({ userId }) => {
  // Datos mock - TODO: Reemplazar con datos reales de la API
  const statistics = [
    {
      id: 1,
      icon: Receipt,
      value: '128',
      label: 'Órdenes creadas (mes)',
    },
    {
      id: 2,
      icon: Table,
      value: '76',
      label: 'Mesas atendidas (mes)',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-6">
        Estadísticas
      </h3>
      <div className="flex flex-col gap-4">
        {statistics.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="flex items-center gap-4">
              <div className="flex items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 p-3">
                <Icon className="text-primary dark:text-primary-300 text-2xl" />
              </div>
              <div>
                <p className="text-slate-900 dark:text-white text-xl font-bold">{stat.value}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


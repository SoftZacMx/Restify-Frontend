import React from 'react';
import { ShoppingCart, CreditCard } from 'lucide-react';

interface UserRecentActivityProps {
  userId: string;
}

/**
 * Componente para mostrar la actividad reciente del usuario
 * TODO: Conectar con API para obtener actividad real
 */
export const UserRecentActivity: React.FC<UserRecentActivityProps> = ({ userId: _userId }) => {
  // Datos mock - TODO: Reemplazar con datos reales de la API
  const activities = [
    {
      id: 1,
      type: 'order',
      icon: ShoppingCart,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/50',
      title: 'Creó la orden #8432',
      description: 'Para la Mesa 5',
      time: 'Hace 2 horas',
    },
    {
      id: 2,
      type: 'payment',
      icon: CreditCard,
      iconColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/50',
      title: 'Cerró la orden #8430',
      description: 'Pago con tarjeta',
      time: 'Ayer',
    },
    {
      id: 3,
      type: 'order',
      icon: ShoppingCart,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/50',
      title: 'Creó la orden #8429',
      description: 'Para la Mesa 2',
      time: 'Ayer',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] p-6 border-b border-slate-200 dark:border-slate-700">
        Actividad Reciente
      </h3>
      <ul className="divide-y divide-slate-200 dark:divide-slate-700">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <li
              key={activity.id}
              className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center justify-center size-10 rounded-full ${activity.bgColor}`}
                >
                  <Icon className={`${activity.iconColor} h-5 w-5`} />
                </div>
                <div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium text-sm">
                    {activity.title}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    {activity.description}
                  </p>
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{activity.time}</p>
            </li>
          );
        })}
      </ul>
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <button className="text-primary dark:text-primary-300 text-sm font-bold text-center w-full block hover:underline">
          Ver toda la actividad
        </button>
      </div>
    </div>
  );
};


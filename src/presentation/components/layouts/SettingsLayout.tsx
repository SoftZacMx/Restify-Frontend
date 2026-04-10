import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Building2, Settings, CreditCard } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { cn } from '@/shared/lib/utils';

interface SettingsNavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
}

const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  { id: 'company', label: 'Compañía', path: '/settings/company', icon: Building2 },
  { id: 'payments', label: 'Pasarelas de Pago', path: '/settings/payments', icon: CreditCard },
  { id: 'general', label: 'General', path: '/settings/general', icon: Settings },
];

const PATH_TO_BREADCRUMB: Record<string, string> = {
  '/settings/general': 'General',
  '/settings/company': 'Compañía',
  '/settings/payments': 'Pasarelas de Pago',
};

const PATH_TO_TITLE: Record<string, string> = {
  '/settings/general': 'Configuración General',
  '/settings/company': 'Configuración de la Compañía',
  '/settings/payments': 'Pasarelas de Pago',
};

const PATH_TO_DESCRIPTION: Record<string, string> = {
  '/settings/general': 'Personaliza la apariencia y preferencias de la aplicación.',
  '/settings/company': 'Administra la información general y legal de tu negocio en la plataforma RESTIFY.',
  '/settings/payments': 'Configura las credenciales de tus pasarelas de pago.',
};

/**
 * Layout para las páginas de configuración.
 * Muestra breadcrumb "Configuración > {sección}" y sidebar interno con secciones.
 * El contenido se renderiza via Outlet; usar dentro de una ruta anidada.
 */
export const SettingsLayout: React.FC = () => {
  const location = useLocation();
  const breadcrumbLabel =
    PATH_TO_BREADCRUMB[location.pathname] ??
    SETTINGS_NAV_ITEMS.find((i) => location.pathname.startsWith(i.path))?.label ??
    'Configuración';
  const pageTitle = PATH_TO_TITLE[location.pathname] ?? `Configuración - ${breadcrumbLabel}`;
  const pageDescription = PATH_TO_DESCRIPTION[location.pathname];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Link
            to="/settings/company"
            className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"
          >
            Configuración
          </Link>
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">/</span>
          <span className="text-slate-800 dark:text-slate-200 text-sm font-medium">{breadcrumbLabel}</span>
        </div>

        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">{pageTitle}</h1>
        {pageDescription && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">{pageDescription}</p>
        )}
        {!pageDescription && <div className="mb-8" />}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar de configuración */}
          <nav className="w-full md:w-56 shrink-0">
            <ul className="space-y-1">
              {SETTINGS_NAV_ITEMS.map((item) => {
                const isActive =
                  location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsLayout;

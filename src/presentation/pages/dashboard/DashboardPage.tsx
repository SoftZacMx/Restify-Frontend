import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Plus,
  DollarSign,
  MapPin,
  CheckCircle2,
  ClipboardList,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar';
import { useAuthStore } from '@/presentation/store/auth.store';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { DashboardKpiCards } from '@/presentation/components/dashboard/DashboardKpiCards';
import { SalesChart } from '@/presentation/components/dashboard/SalesChart';
import { ActiveOrdersCard } from '@/presentation/components/dashboard/ActiveOrdersCard';
import { RecentOrdersCard } from '@/presentation/components/dashboard/RecentOrdersCard';
import { dashboardService } from '@/application/services';
import { formatCurrency } from '@/shared/utils';
import { getInitials, formatOrderTime, getTableDisplay } from '@/shared/utils/dashboard.utils';
import { showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const {
    data: dashboard,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getDashboard(),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  React.useEffect(() => {
    if (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al cargar el dashboard', error.message);
      } else {
        showErrorToast('Error al cargar el dashboard', 'No se pudo obtener la información');
      }
    }
  }, [error]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Cargando dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const salesToday = dashboard?.salesToday ?? 0;
  const salesLast7Days = dashboard?.salesLast7Days ?? { total: 0, byDay: [] };
  const activeOrders = dashboard?.activeOrders ?? { count: 0, items: [] };
  const occupiedTables = dashboard?.occupiedTables ?? { count: 0, items: [] };
  const recentOrders = dashboard?.recentOrders ?? [];
  const lastCompletedOrders = dashboard?.lastCompletedOrders ?? [];

  const handleOrderClick = (orderId: string) => {
    navigate('/orders', { state: { openOrderId: orderId } });
  };

  return (
    <MainLayout>
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar órdenes, clientes, productos..."
            className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-600"
          />
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="relative text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 h-10 w-10 p-0"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
          </Button>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
            <Avatar className="h-9 w-9">
              <AvatarImage src={undefined} />
              <AvatarFallback>
                {user ? getInitials(user.name, user.last_name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium text-slate-900 dark:text-slate-100 leading-none">
                {user ? `${user.name} ${user.last_name}` : 'Usuario'}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                {user?.email || 'email@example.com'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <DashboardKpiCards
        salesToday={salesToday}
        activeOrdersCount={activeOrders.count}
        occupiedTables={occupiedTables}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main: Chart + Active Orders + Recent */}
        <div className="lg:col-span-2 space-y-8">
          <SalesChart salesLast7Days={salesLast7Days} />
          <ActiveOrdersCard activeOrders={activeOrders} onOrderClick={handleOrderClick} />
          <RecentOrdersCard orders={recentOrders} onOrderClick={handleOrderClick} />
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Acciones rápidas */}
          <Card className="border-slate-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Acciones rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  className="h-24 flex flex-col gap-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  onClick={() => navigate('/pos')}
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-sm font-medium">Nueva Orden</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                  onClick={() => navigate('/expenses')}
                >
                  <DollarSign className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium">Registrar Gasto</span>
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate('/tables')}
              >
                <MapPin className="h-5 w-5" />
                <span>Ver mapa de mesas</span>
              </Button>
            </CardContent>
          </Card>

          {/* Últimas completadas */}
          <Card className="border-slate-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Últimas completadas
              </CardTitle>
              <Link
                to="/orders"
                className="inline-flex items-center justify-center rounded-lg font-medium h-9 px-3 text-sm border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                Ver todas
              </Link>
            </CardHeader>
            <CardContent>
              {lastCompletedOrders.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-2">
                  No hay órdenes completadas recientes
                </p>
              ) : (
                <ul className="space-y-3">
                  {lastCompletedOrders.map((order) => (
                    <li
                      key={order.id}
                      className="flex items-center justify-between text-sm border-b border-slate-100 dark:border-slate-700 pb-3 last:border-0 last:pb-0 cursor-pointer hover:opacity-80"
                      onClick={() => handleOrderClick(order.id)}
                    >
                      <div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 ml-2">
                          {getTableDisplay(order)} · {formatOrderTime(order.date)}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(order.total)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Notificaciones */}
          <Card className="border-slate-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Notificaciones recientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <NotificationItem
                title="Dashboard conectado al API. Los datos se actualizan automáticamente."
                time="Ahora"
                iconBg="bg-green-100 dark:bg-green-900/20"
                iconColor="text-green-600 dark:text-green-400"
                IconComponent={CheckCircle2}
              />
              <NotificationItem
                title="Usa Órdenes para ver el detalle de cada orden."
                time="Información"
                iconBg="bg-blue-100 dark:bg-blue-900/20"
                iconColor="text-blue-600 dark:text-blue-400"
                IconComponent={ClipboardList}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

const NotificationItem = ({
  title,
  time,
  iconBg,
  iconColor,
  IconComponent,
}: {
  title: string;
  time: string;
  iconBg: string;
  iconColor: string;
  IconComponent: React.ComponentType<{ className?: string }>;
}) => (
  <div className="flex gap-4 items-start">
    <div
      className={`h-10 w-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
    >
      <IconComponent className={`h-5 w-5 ${iconColor}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{time}</p>
    </div>
  </div>
);

export default DashboardPage;

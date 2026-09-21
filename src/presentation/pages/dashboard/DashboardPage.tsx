import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Plus,
  DollarSign,
  MapPin,
  ClipboardList,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar';
import { Badge } from '@/presentation/components/ui/badge';
import { useAuthStore } from '@/presentation/store/auth.store';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { StatCard } from '@/presentation/components/dashboard/StatCard';
import { dashboardService } from '@/application/services';
import type { DashboardOrderSummary } from '@/domain/types';
import { formatCurrency, getTodayDateString } from '@/shared/utils';
import { APP_TIMEZONE } from '@/shared/constants';
import { showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

const DAY_NAMES_ES: Record<string, string> = {
  Sunday: 'Dom',
  Monday: 'Lun',
  Tuesday: 'Mar',
  Wednesday: 'Mié',
  Thursday: 'Jue',
  Friday: 'Vie',
  Saturday: 'Sáb',
};

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

  React.useEffect(() => {
    if (dashboard) {
      console.log('[Dashboard] Respuesta del API:', dashboard);
    }
  }, [dashboard]);

  const getInitials = (name: string, lastName: string) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatOrderTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: APP_TIMEZONE });
    } catch {
      return '—';
    }
  };

  const getOrderStatusLabel = (order: DashboardOrderSummary) => {
    if (order.status && order.delivered) return 'Completado';
    if (order.status) return 'Pagado';
    return 'Pendiente';
  };

  const getOrderStatusStyle = (order: DashboardOrderSummary) => {
    if (order.status && order.delivered)
      return 'bg-fresco-suave text-fresco-texto';
    if (order.status) return 'bg-primary/10 dark:bg-primary/20 text-primary';
    return 'bg-apoyo-suave text-apoyo-texto';
  };

  const getTableDisplay = (order: DashboardOrderSummary) => {
    if (order.tableName != null && order.tableName !== '') return `Ubicación ${order.tableName}`;
    return order.origin === 'local' ? 'Local' : order.origin || 'Sin ubicación';
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando dashboard...</p>
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

  const maxBarTotal =
    salesLast7Days.byDay.length > 0
      ? Math.max(...salesLast7Days.byDay.map((d) => d.total), 1)
      : 1;

  return (
    <MainLayout>
      {/* Header */}
      <header className="flex justify-end items-center mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="relative text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-card h-10 w-10 p-0"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full border-2 border-white dark:border-border" />
          </Button>
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <Avatar className="h-9 w-9">
              <AvatarImage src={undefined} />
              <AvatarFallback>
                {user ? getInitials(user.name, user.last_name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium text-foreground leading-none">
                {user ? `${user.name} ${user.last_name}` : 'Usuario'}
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                {user?.email || 'email@example.com'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid - tarjetas con icono y acento de color */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Ventas del día"
          value={formatCurrency(salesToday)}
          icon={TrendingUp}
          accent="emerald"
          subtitle="Hoy"
        />
        <StatCard
          title="Órdenes activas"
          value={String(activeOrders.count)}
          icon={ClipboardList}
          accent="amber"
          subtitle="Sin pagar"
        />
        <StatCard
          title="Ubicaciones ocupadas"
          value={occupiedTables.count}
          icon={UtensilsCrossed}
          accent="blue"
          subtitle={
            occupiedTables.items.length > 0
              ? `Ubicaciones ${occupiedTables.items.map((t) => t.name).join(', ')}`
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main: Chart + Active Orders + Recent */}
        <div className="lg:col-span-2 space-y-8">
          {/* Chart: Ventas últimos 7 días */}
          <Card className="border-border shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-h3 text-foreground">
                Ventas de los últimos 7 días
              </CardTitle>
              <div className="flex items-baseline gap-2">
                <span className="text-display text-foreground">
                  {formatCurrency(salesLast7Days.total)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2 pt-4 px-2">
                {salesLast7Days.byDay.length === 0 ? (
                  <p className="text-sm text-muted-foreground w-full text-center py-8">
                    Sin datos de ventas
                  </p>
                ) : (
                  salesLast7Days.byDay.map((d) => {
                    const isToday = d.date === getTodayDateString();
                    const heightPct = Math.round((d.total / maxBarTotal) * 100);
                    return (
                      <Bar
                        key={d.date}
                        height={`${Math.max(heightPct, 8)}%`}
                        day={DAY_NAMES_ES[d.day] ?? d.day}
                        active={isToday}
                        title={`${d.date}: ${formatCurrency(d.total)}`}
                      />
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Órdenes activas */}
          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-h3 text-foreground">
                Órdenes activas ({activeOrders.count})
              </CardTitle>
              <Link
                to="/orders"
                className="inline-flex items-center justify-center rounded-lg font-medium h-9 px-3 text-sm border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                Ver todas
              </Link>
            </CardHeader>
            <CardContent>
              {activeOrders.items.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No hay órdenes activas
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 dark:bg-card/50">
                      <tr>
                        <th className="px-4 py-3 font-medium rounded-l-lg">Orden</th>
                        <th className="px-4 py-3 font-medium">Ubicación</th>
                        <th className="px-4 py-3 font-medium">Hora</th>
                        <th className="px-4 py-3 font-medium text-right rounded-r-lg">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-border">
                      {activeOrders.items.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-muted/50 dark:hover:bg-card/50 transition-colors cursor-pointer"
                          onClick={() => navigate('/orders', { state: { openOrderId: order.id } })}
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            #{order.id.slice(0, 8)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {getTableDisplay(order)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatOrderTime(order.date)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-foreground">
                            {formatCurrency(order.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Órdenes recientes */}
          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-h3 text-foreground">
                Órdenes recientes
              </CardTitle>
              <Link
                to="/orders"
                className="inline-flex items-center justify-center rounded-lg font-medium h-9 px-3 text-sm border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                Ver todas
              </Link>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No hay órdenes recientes
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 dark:bg-card/50">
                      <tr>
                        <th className="px-4 py-3 font-medium rounded-l-lg">Orden</th>
                        <th className="px-4 py-3 font-medium">Ubicación</th>
                        <th className="px-4 py-3 font-medium">Estado</th>
                        <th className="px-4 py-3 font-medium">Hora</th>
                        <th className="px-4 py-3 font-medium text-right rounded-r-lg">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-border">
                      {recentOrders.map((order) => (
                        <DashboardOrderRow
                          key={order.id}
                          order={order}
                          getTableDisplay={getTableDisplay}
                          getOrderStatusLabel={getOrderStatusLabel}
                          getOrderStatusStyle={getOrderStatusStyle}
                          formatOrderTime={formatOrderTime}
                          onRowClick={() =>
                            navigate('/orders', { state: { openOrderId: order.id } })
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Acciones rápidas */}
          <Card className="border-border shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-h3 text-foreground">
                Acciones rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  className="h-24 flex flex-col gap-2 bg-primary/10 dark:bg-primary/20 hover:bg-primary/90 dark:hover:bg-primary/90 text-primary"
                  onClick={() => navigate('/pos')}
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-sm font-medium">Nueva Orden</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2 bg-muted hover:bg-secondary dark:hover:bg-card"
                  onClick={() => navigate('/expenses')}
                >
                  <DollarSign className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm font-medium">Registrar Gasto</span>
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate('/tables')}
              >
                <MapPin className="h-5 w-5" />
                <span>Ver mapa de ubicaciones</span>
              </Button>
            </CardContent>
          </Card>

          {/* Últimas completadas */}
          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-h3 text-foreground">
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
                <p className="text-sm text-muted-foreground py-2">
                  No hay órdenes completadas recientes
                </p>
              ) : (
                <ul className="space-y-3">
                  {lastCompletedOrders.map((order) => (
                    <li
                      key={order.id}
                      className="flex items-center justify-between text-sm border-b border-border pb-3 last:border-0 last:pb-0 cursor-pointer hover:opacity-80"
                      onClick={() =>
                        navigate('/orders', { state: { openOrderId: order.id } })
                      }
                    >
                      <div>
                        <span className="font-medium text-foreground">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {getTableDisplay(order)} · {formatOrderTime(order.date)}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(order.total)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Notificaciones (placeholder)
          <Card className="border-border shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-h3 text-foreground">
                Notificaciones recientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <NotificationItem
                title="Dashboard conectado al API. Los datos se actualizan automáticamente."
                time="Ahora"
                iconBg="bg-fresco-suave"
                iconColor="text-fresco"
                IconComponent={CheckCircle2}
              />
              <NotificationItem
                title="Usa Órdenes para ver el detalle de cada orden."
                time="Información"
                iconBg="bg-primary/10 dark:bg-primary/20"
                iconColor="text-primary"
                IconComponent={ClipboardList}
              />
            </CardContent>
          </Card>
           */}
        </div>
      </div>
    </MainLayout>
  );
};

// --- Helpers ---

const Bar = ({
  height,
  day,
  active = false,
  title,
}: {
  height: string;
  day: string;
  active?: boolean;
  title?: string;
}) => (
  <div className="flex flex-col items-center gap-2 flex-1 group cursor-pointer" title={title}>
    <div
      className={`w-full rounded-t-md transition-all group-hover:opacity-80 min-h-[24px] ${
        active ? 'bg-primary' : 'bg-primary/10 dark:bg-primary/20'
      }`}
      style={{ height }}
    />
    <span className="text-xs font-medium text-muted-foreground">{day}</span>
  </div>
);

function DashboardOrderRow({
  order,
  getTableDisplay,
  getOrderStatusLabel,
  getOrderStatusStyle,
  formatOrderTime,
  onRowClick,
}: {
  order: DashboardOrderSummary;
  getTableDisplay: (o: DashboardOrderSummary) => string;
  getOrderStatusLabel: (o: DashboardOrderSummary) => string;
  getOrderStatusStyle: (o: DashboardOrderSummary) => string;
  formatOrderTime: (d: string) => string;
  onRowClick: () => void;
}) {
  return (
    <tr
      className="hover:bg-muted/50 dark:hover:bg-card/50 transition-colors cursor-pointer"
      onClick={onRowClick}
    >
      <td className="px-4 py-4 font-medium text-foreground">
        #{order.id.slice(0, 8)}
      </td>
      <td className="px-4 py-4 text-muted-foreground">
        {getTableDisplay(order)}
      </td>
      <td className="px-4 py-4">
        <Badge variant="secondary" className={`${getOrderStatusStyle(order)} border-0 font-medium`}>
          {getOrderStatusLabel(order)}
        </Badge>
      </td>
      <td className="px-4 py-4 text-muted-foreground">
        {formatOrderTime(order.date)}
      </td>
      <td className="px-4 py-4 text-right font-bold text-foreground">
        {formatCurrency(order.total)}
      </td>
    </tr>
  );
}

export default DashboardPage;

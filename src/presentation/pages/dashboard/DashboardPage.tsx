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
  TrendingUp,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar';
import { Badge } from '@/presentation/components/ui/badge';
import { useAuthStore } from '@/presentation/store/auth.store';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { dashboardService } from '@/application/services';
import type { DashboardOrderSummary } from '@/domain/types';
import { formatCurrency } from '@/shared/utils';
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
      return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
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
      return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
    if (order.status) return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
    return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
  };

  const getTableDisplay = (order: DashboardOrderSummary) => {
    if (order.tableName != null && order.tableName !== '') return `Mesa ${order.tableName}`;
    return order.origin === 'local' ? 'Local' : order.origin || 'Sin mesa';
  };

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

  const maxBarTotal =
    salesLast7Days.byDay.length > 0
      ? Math.max(...salesLast7Days.byDay.map((d) => d.total), 1)
      : 1;

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
          title="Mesas ocupadas"
          value={occupiedTables.count}
          icon={UtensilsCrossed}
          accent="blue"
          subtitle={
            occupiedTables.items.length > 0
              ? `Mesas ${occupiedTables.items.map((t) => t.name).join(', ')}`
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main: Chart + Active Orders + Recent */}
        <div className="lg:col-span-2 space-y-8">
          {/* Chart: Ventas últimos 7 días */}
          <Card className="border-slate-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Ventas de los últimos 7 días
              </CardTitle>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(salesLast7Days.total)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2 pt-4 px-2">
                {salesLast7Days.byDay.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 w-full text-center py-8">
                    Sin datos de ventas
                  </p>
                ) : (
                  salesLast7Days.byDay.map((d) => {
                    const isToday =
                      d.date === new Date().toISOString().split('T')[0];
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
          <Card className="border-slate-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
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
                <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
                  No hay órdenes activas
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-3 font-medium rounded-l-lg">Orden</th>
                        <th className="px-4 py-3 font-medium">Mesa</th>
                        <th className="px-4 py-3 font-medium">Hora</th>
                        <th className="px-4 py-3 font-medium text-right rounded-r-lg">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {activeOrders.items.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                          onClick={() => navigate('/orders', { state: { openOrderId: order.id } })}
                        >
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                            #{order.id.slice(0, 8)}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {getTableDisplay(order)}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {formatOrderTime(order.date)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-100">
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
          <Card className="border-slate-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
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
                <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
                  No hay órdenes recientes
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-3 font-medium rounded-l-lg">Orden</th>
                        <th className="px-4 py-3 font-medium">Mesa</th>
                        <th className="px-4 py-3 font-medium">Estado</th>
                        <th className="px-4 py-3 font-medium">Hora</th>
                        <th className="px-4 py-3 font-medium text-right rounded-r-lg">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
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
                      onClick={() =>
                        navigate('/orders', { state: { openOrderId: order.id } })
                      }
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

          {/* Notificaciones (placeholder) */}
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

// --- Helpers ---

const ACCENT_STYLES: Record<
  string,
  {
    iconBg: string;
    iconColor: string;
    iconRing: string;
    cardBg: string;
    cardBorder: string;
    cardShadow: string;
    cardHoverShadow: string;
    cornerGlow: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  emerald: {
    iconBg: 'bg-emerald-500/15 dark:bg-emerald-400/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconRing: 'ring-emerald-500/20 dark:ring-emerald-400/30',
    cardBg:
      'bg-gradient-to-br from-white via-white to-emerald-50/60 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-950/30',
    cardBorder: 'border-emerald-200/60 dark:border-emerald-800/50',
    cardShadow: 'shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/10',
    cornerGlow:
      'before:absolute before:top-0 before:right-0 before:w-28 before:h-28 before:bg-emerald-400/15 dark:before:bg-emerald-500/15 before:rounded-full before:translate-x-1/3 before:-translate-y-1/3 before:blur-2xl',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
  },
  amber: {
    iconBg: 'bg-amber-500/15 dark:bg-amber-400/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconRing: 'ring-amber-500/20 dark:ring-amber-400/30',
    cardBg:
      'bg-gradient-to-br from-white via-white to-amber-50/50 dark:from-slate-800 dark:via-slate-800 dark:to-amber-950/25',
    cardBorder: 'border-amber-200/60 dark:border-amber-800/50',
    cardShadow: 'shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-amber-500/5 dark:hover:shadow-amber-500/10',
    cornerGlow:
      'before:absolute before:top-0 before:right-0 before:w-28 before:h-28 before:bg-amber-400/15 dark:before:bg-amber-500/15 before:rounded-full before:translate-x-1/3 before:-translate-y-1/3 before:blur-2xl',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
  },
  blue: {
    iconBg: 'bg-blue-500/15 dark:bg-blue-400/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconRing: 'ring-blue-500/20 dark:ring-blue-400/30',
    cardBg:
      'bg-gradient-to-br from-white via-white to-blue-50/50 dark:from-slate-800 dark:via-slate-800 dark:to-blue-950/25',
    cardBorder: 'border-blue-200/60 dark:border-blue-800/50',
    cardShadow: 'shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10',
    cornerGlow:
      'before:absolute before:top-0 before:right-0 before:w-28 before:h-28 before:bg-blue-400/15 dark:before:bg-blue-500/15 before:rounded-full before:translate-x-1/3 before:-translate-y-1/3 before:blur-2xl',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/40',
    badgeText: 'text-blue-700 dark:text-blue-300',
  },
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  accent = 'blue',
  subtitle,
}: {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  accent?: keyof typeof ACCENT_STYLES;
  subtitle?: string;
}) => {
  const styles = ACCENT_STYLES[accent] ?? ACCENT_STYLES.blue;
  return (
    <Card
      className={`relative overflow-hidden border-2 ${styles.cardBorder} ${styles.cardBg} ${styles.cardShadow} ${styles.cardHoverShadow} ${styles.cornerGlow} transition-all duration-300 hover:-translate-y-0.5`}
    >
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {subtitle && (
              <span
                className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md max-w-[160px] truncate ${styles.badgeBg} ${styles.badgeText} mb-2`}
                title={subtitle}
              >
                {subtitle}
              </span>
            )}
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
              {title}
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums tracking-tight drop-shadow-sm">
              {value}
            </h3>
          </div>
          {Icon && (
            <div
              className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ring-4 ${styles.iconBg} ${styles.iconColor} ${styles.iconRing}`}
              aria-hidden
            >
              <Icon className="w-7 h-7" strokeWidth={2.5} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

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
        active ? 'bg-blue-500 dark:bg-blue-400' : 'bg-blue-100 dark:bg-blue-900/30'
      }`}
      style={{ height }}
    />
    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{day}</span>
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
      className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
      onClick={onRowClick}
    >
      <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">
        #{order.id.slice(0, 8)}
      </td>
      <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
        {getTableDisplay(order)}
      </td>
      <td className="px-4 py-4">
        <Badge variant="secondary" className={`${getOrderStatusStyle(order)} border-0 font-medium`}>
          {getOrderStatusLabel(order)}
        </Badge>
      </td>
      <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
        {formatOrderTime(order.date)}
      </td>
      <td className="px-4 py-4 text-right font-bold text-slate-900 dark:text-slate-100">
        {formatCurrency(order.total)}
      </td>
    </tr>
  );
}

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

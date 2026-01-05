import React from 'react';
import {
  Bell,
  Search,
  Plus,
  DollarSign,
  MapPin,
  CheckCircle2,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/components/ui/avatar';
import { Badge } from '@/presentation/components/ui/badge';
import { useAuthStore } from '@/presentation/store/auth.store';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';

const DashboardPage = () => {
  const { user } = useAuthStore();

  const getInitials = (name: string, lastName: string) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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
            <Button variant="ghost" className="relative text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 h-10 w-10 p-0">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Ventas del Día"
            value="$1,250.75"
            trend="+5.2%"
            trendUp={true}
          />
          <StatCard
            title="Órdenes Activas"
            value="12"
            trend="-1.5%"
            trendUp={false}
          />
          <StatCard
            title="Mesas Ocupadas"
            value="8 / 15"
            trend="+10%"
            trendUp={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Chart Card */}
            <Card className="border-slate-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Ventas de los Últimos 7 Días
                </CardTitle>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">$8,950.00</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                    +12.5%
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-4 pt-4 px-2">
                  <Bar height="30%" day="Lun" />
                  <Bar height="45%" day="Mar" />
                  <Bar height="35%" day="Mié" />
                  <Bar height="60%" day="Jue" />
                  <Bar height="85%" day="Vie" active />
                  <Bar height="55%" day="Sáb" />
                  <Bar height="50%" day="Dom" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="border-slate-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Órdenes Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-3 font-medium rounded-l-lg">ID Orden</th>
                        <th className="px-4 py-3 font-medium">Mesa</th>
                        <th className="px-4 py-3 font-medium">Estado</th>
                        <th className="px-4 py-3 font-medium">Hora</th>
                        <th className="px-4 py-3 font-medium text-right rounded-r-lg">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      <OrderRow id="#8342" table="Mesa 5" status="Completado" time="14:32" total="$45.50" />
                      <OrderRow id="#8341" table="Mesa 2" status="Pendiente" time="14:30" total="$22.00" />
                      <OrderRow id="#8340" table="Delivery" status="Completado" time="14:25" total="$38.75" />
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar Section */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card className="border-slate-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <ActionButton icon={<Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />} label="Nueva Orden" bg="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30" />
                  <ActionButton icon={<DollarSign className="h-6 w-6 text-slate-600 dark:text-slate-400" />} label="Registrar Gasto" bg="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600" />
                </div>
                <Button variant="outline" className="w-full h-auto py-4 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 flex flex-col gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>Ver Mapa de Mesas</span>
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-slate-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Notificaciones Recientes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <NotificationItem
                  title="Ingrediente 'Tomate' bajo en stock."
                  time="Hace 5 minutos"
                  iconBg="bg-yellow-100 dark:bg-yellow-900/20"
                  iconColor="text-yellow-600 dark:text-yellow-400"
                  IconComponent={ClipboardList}
                />
                <NotificationItem
                  title="Mesa 5 solicita la cuenta."
                  time="Hace 12 minutos"
                  iconBg="bg-blue-100 dark:bg-blue-900/20"
                  iconColor="text-blue-600 dark:text-blue-400"
                  IconComponent={DollarSign}
                />
                <NotificationItem
                  title="Orden #8341 marcada como completada."
                  time="Hace 30 minutos"
                  iconBg="bg-green-100 dark:bg-green-900/20"
                  iconColor="text-green-600 dark:text-green-400"
                  IconComponent={CheckCircle2}
                />
              </CardContent>
            </Card>
          </div>
        </div>
    </MainLayout>
  );
};

// Helper Components

const StatCard = ({ title, value, trend, trendUp }: { title: string; value: string; trend: string; trendUp: boolean }) => (
  <Card className="border-slate-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
    <CardContent className="p-6">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{title}</p>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</h3>
        <p className={`text-xs font-medium ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {trend}
        </p>
      </div>
    </CardContent>
  </Card>
);

const Bar = ({ height, day, active = false }: { height: string; day: string; active?: boolean }) => (
  <div className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
    <div
      className={`w-full rounded-t-md transition-all group-hover:opacity-80 ${
        active ? 'bg-blue-500 dark:bg-blue-400' : 'bg-blue-100 dark:bg-blue-900/30'
      }`}
      style={{ height }}
    ></div>
    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{day}</span>
  </div>
);

const ActionButton = ({ icon, label, bg }: { icon: React.ReactNode; label: string; bg: string }) => (
  <button className={`${bg} p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors h-24 w-full`}>
    {icon}
    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center leading-tight">
      {label.split(' ').map((word, i) => (
        <span key={i} className="block">{word}</span>
      ))}
    </span>
  </button>
);

const OrderRow = ({ id, table, status, time, total }: { id: string; table: string; status: string; time: string; total: string }) => {
  const statusStyles: Record<string, string> = {
    Completado: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20',
    Pendiente: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/20',
  };

  return (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
      <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">{id}</td>
      <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{table}</td>
      <td className="px-4 py-4">
        <Badge variant="secondary" className={`${statusStyles[status] || ''} border-0 font-medium`}>
          {status}
        </Badge>
      </td>
      <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{time}</td>
      <td className="px-4 py-4 text-right font-bold text-slate-900 dark:text-slate-100">{total}</td>
    </tr>
  );
};

const NotificationItem = ({ title, time, iconBg, iconColor, IconComponent }: { title: string; time: string; iconBg: string; iconColor: string; IconComponent: React.ComponentType<{ className?: string }> }) => (
  <div className="flex gap-4 items-start">
    <div className={`h-10 w-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
      <IconComponent className={`h-5 w-5 ${iconColor}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{time}</p>
    </div>
  </div>
);

export default DashboardPage;


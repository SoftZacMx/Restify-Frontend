import { TrendingUp, ClipboardList, UtensilsCrossed } from 'lucide-react';
import { formatCurrency } from '@/shared/utils';
import { StatCard } from './StatCard';

interface DashboardKpiCardsProps {
  salesToday: number;
  activeOrdersCount: number;
  occupiedTables: { count: number; items: { name: string }[] };
}

export function DashboardKpiCards({
  salesToday,
  activeOrdersCount,
  occupiedTables,
}: DashboardKpiCardsProps) {
  return (
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
        value={String(activeOrdersCount)}
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
  );
}

import { TrendingUp, ClipboardList, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { formatCurrency } from '@/shared/utils';

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

function StatCard({
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
}) {
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
}

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
  );
}

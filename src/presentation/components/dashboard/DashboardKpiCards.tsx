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
    iconBg: 'bg-fresco/15',
    iconColor: 'text-fresco',
    iconRing: 'ring-fresco/20',
    cardBg:
      'bg-gradient-to-br from-white via-white to-fresco-suave/60 dark:from-card dark:via-card',
    cardBorder: 'border-fresco/60',
    cardShadow: 'shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/10',
    cornerGlow:
      'before:absolute before:top-0 before:right-0 before:w-28 before:h-28 before:bg-fresco/15 before:rounded-full before:translate-x-1/3 before:-translate-y-1/3 before:blur-2xl',
    badgeBg: 'bg-fresco-suave',
    badgeText: 'text-fresco-texto',
  },
  amber: {
    iconBg: 'bg-apoyo/15',
    iconColor: 'text-apoyo',
    iconRing: 'ring-apoyo/20',
    cardBg:
      'bg-gradient-to-br from-white via-white to-apoyo-suave/50 dark:from-card dark:via-card',
    cardBorder: 'border-apoyo/60',
    cardShadow: 'shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-amber-500/5 dark:hover:shadow-amber-500/10',
    cornerGlow:
      'before:absolute before:top-0 before:right-0 before:w-28 before:h-28 before:bg-apoyo/15 before:rounded-full before:translate-x-1/3 before:-translate-y-1/3 before:blur-2xl',
    badgeBg: 'bg-apoyo-suave',
    badgeText: 'text-apoyo-texto',
  },
  blue: {
    iconBg: 'bg-primary/15 dark:bg-primary/20',
    iconColor: 'text-primary dark:text-primary',
    iconRing: 'ring-primary/20 dark:ring-primary/30',
    cardBg:
      'bg-gradient-to-br from-white via-white to-primary/50 dark:from-card dark:via-card dark:to-primary/25',
    cardBorder: 'border-primary/30 dark:border-primary/50',
    cardShadow: 'shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50',
    cardHoverShadow: 'hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-primary/10',
    cornerGlow:
      'before:absolute before:top-0 before:right-0 before:w-28 before:h-28 before:bg-primary/15 dark:before:bg-primary/15 before:rounded-full before:translate-x-1/3 before:-translate-y-1/3 before:blur-2xl',
    badgeBg: 'bg-primary/10 dark:bg-primary/20',
    badgeText: 'text-primary dark:text-primary',
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
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              {title}
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground tabular-nums tracking-tight drop-shadow-sm">
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

import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { formatCurrency } from '@/shared/utils';

const DAY_NAMES_ES: Record<string, string> = {
  Sunday: 'Dom',
  Monday: 'Lun',
  Tuesday: 'Mar',
  Wednesday: 'Mié',
  Thursday: 'Jue',
  Friday: 'Vie',
  Saturday: 'Sáb',
};

function Bar({
  height,
  day,
  active = false,
  title,
}: {
  height: string;
  day: string;
  active?: boolean;
  title?: string;
}) {
  return (
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
}

interface SalesChartProps {
  salesLast7Days: {
    total: number;
    byDay: { date: string; day: string; total: number }[];
  };
}

export function SalesChart({ salesLast7Days }: SalesChartProps) {
  const maxBarTotal =
    salesLast7Days.byDay.length > 0
      ? Math.max(...salesLast7Days.byDay.map((d) => d.total), 1)
      : 1;

  return (
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
              const isToday = d.date === new Date().toISOString().split('T')[0];
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
  );
}

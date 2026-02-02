import React from 'react';
import { DollarSign, Package, BarChart2, Trophy, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { Badge } from '@/presentation/components/ui/badge';
import { formatCurrency } from '@/shared/utils';
import type { SalesPerformanceReportData } from '@/domain/types';

interface SalesPerformanceReportViewProps {
  data: SalesPerformanceReportData;
}

export const SalesPerformanceReportView: React.FC<SalesPerformanceReportViewProps> = ({ data }) => {
  const { sales, totalSold, summary } = data;

  return (
    <div className="space-y-6 p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="overflow-hidden border-l-4 border-l-emerald-500 dark:border-l-emerald-600 bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-800 dark:to-emerald-950/20 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <span className="rounded-lg bg-emerald-100 dark:bg-emerald-900/40 p-1.5">
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </span>
              Total vendido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalSold)}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-blue-500 dark:border-l-blue-600 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-blue-950/20 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <span className="rounded-lg bg-blue-100 dark:bg-blue-900/40 p-1.5">
                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </span>
              Ítems con ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.totalMenuItems}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-violet-500 dark:border-l-violet-600 bg-gradient-to-br from-white to-violet-50/30 dark:from-slate-800 dark:to-violet-950/20 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <span className="rounded-lg bg-violet-100 dark:bg-violet-900/40 p-1.5">
                <BarChart2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </span>
              Precio promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{formatCurrency(summary.averagePrice)}</p>
          </CardContent>
        </Card>
      </div>

      {summary.topSeller && (
        <Card className="overflow-hidden border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-950/30 dark:to-slate-800 shadow-lg">
          <CardHeader className="bg-amber-50/50 dark:bg-amber-900/20 border-b border-amber-200/50 dark:border-amber-800/50">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="rounded-xl bg-amber-200 dark:bg-amber-800 p-2">
                <Trophy className="h-5 w-5 text-amber-700 dark:text-amber-300" />
              </span>
              Mejor vendido
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-lg">{summary.topSeller.menuItemName}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total vendido: <span className="font-medium text-amber-700 dark:text-amber-300">{formatCurrency(summary.topSeller.totalSold)}</span></p>
            </div>
            <Badge className="bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100 border-0 text-sm px-3 py-1">
              Top 1
            </Badge>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-md border-slate-200 dark:border-slate-700">
        <CardHeader className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2 text-base">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
            Ventas por ítem del menú
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {sales.length === 0 ? (
            <p className="text-sm text-slate-500">No hay ventas en el período.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-700">
                  <TableHead>Platillo</TableHead>
                  <TableHead>Precio unit.</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Total vendido</TableHead>
                  <TableHead>% del total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((s, idx) => (
                  <TableRow key={s.menuItemId} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${idx === 0 ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}>
                    <TableCell className="font-medium">{s.menuItemName}</TableCell>
                    <TableCell>{formatCurrency(s.unitPrice)}</TableCell>
                    <TableCell>{s.quantitySold}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(s.totalSold)}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-primary/10 dark:bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                        {s.percentageOfTotal.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

import React from 'react';
import { Wallet, PieChart, Award, CreditCard, Briefcase, Zap, Home, Package, FolderOpen, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { formatCurrency, formatExpenseDate } from '@/shared/utils';
import type { ExpenseAnalysisReportData } from '@/domain/types';

interface ExpenseAnalysisReportViewProps {
  data: ExpenseAnalysisReportData;
}

const CATEGORY_LABELS: Record<string, string> = {
  businessServices: 'Servicios del negocio',
  utilities: 'Servicios públicos',
  rent: 'Renta',
  merchandise: 'Mercancía',
  other: 'Otros',
  employeeSalaries: 'Nómina',
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  businessServices: Briefcase,
  utilities: Zap,
  rent: Home,
  merchandise: Package,
  other: FolderOpen,
};

const CATEGORY_BORDER: Record<string, string> = {
  businessServices: 'border-l-amber-500 dark:border-l-amber-600',
  utilities: 'border-l-blue-500 dark:border-l-blue-600',
  rent: 'border-l-red-500 dark:border-l-red-600',
  merchandise: 'border-l-emerald-500 dark:border-l-emerald-600',
  other: 'border-l-slate-500 dark:border-l-slate-600',
};

function CategoryCard({
  title,
  items,
  total,
  percentage,
  icon: Icon,
  borderColor,
}: {
  title: string;
  items: Array<{ id: string; date: string; total: number; description: string | null }>;
  total: number;
  percentage: number;
  icon: React.ComponentType<{ className?: string }>;
  borderColor: string;
}) {
  return (
    <Card className={`overflow-hidden border-l-4 ${borderColor} shadow-md hover:shadow-lg transition-shadow`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="rounded-lg bg-slate-200/80 dark:bg-slate-700 p-1.5">
            <Icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </span>
          {title}
        </CardTitle>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total: {formatCurrency(total)}</p>
          <span className="rounded-full bg-primary/10 dark:bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
            {percentage.toFixed(1)}%
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">Sin registros.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((i) => (
                <TableRow key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <TableCell>{formatExpenseDate(i.date)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(i.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export const ExpenseAnalysisReportView: React.FC<ExpenseAnalysisReportViewProps> = ({ data }) => {
  const { expensesByCategory, employeeSalaries, summary } = data;

  return (
    <div className="space-y-6 p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden border-l-4 border-l-red-500 dark:border-l-red-600 bg-gradient-to-br from-white to-red-50/30 dark:from-slate-800 dark:to-red-950/20 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <span className="rounded-lg bg-red-100 dark:bg-red-900/40 p-1.5">
                <Wallet className="h-4 w-4 text-red-600 dark:text-red-400" />
              </span>
              Total gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(summary.totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-violet-500 dark:border-l-violet-600 bg-gradient-to-br from-white to-violet-50/30 dark:from-slate-800 dark:to-violet-950/20 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <span className="rounded-lg bg-violet-100 dark:bg-violet-900/40 p-1.5">
                <PieChart className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </span>
              Promedio por concepto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{formatCurrency(summary.averageExpense)}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-amber-500 dark:border-l-amber-600 bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-800 dark:to-amber-950/20 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <span className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-1.5">
                <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </span>
              Categoría con mayor gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-amber-700 dark:text-amber-300 capitalize">
              {CATEGORY_LABELS[summary.largestExpenseCategory] ?? summary.largestExpenseCategory}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md border-slate-200 dark:border-slate-700">
        <CardHeader className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-5 w-5 text-primary" />
            Por método de pago
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <span className="rounded-lg bg-amber-100 dark:bg-amber-900/40 px-3 py-1.5 text-sm font-medium text-amber-800 dark:text-amber-200">
              Efectivo: {formatCurrency(summary.totalByPaymentMethod.cash)}
            </span>
            <span className="rounded-lg bg-blue-100 dark:bg-blue-900/40 px-3 py-1.5 text-sm font-medium text-blue-800 dark:text-blue-200">
              Transferencia: {formatCurrency(summary.totalByPaymentMethod.transfer)}
            </span>
            <span className="rounded-lg bg-violet-100 dark:bg-violet-900/40 px-3 py-1.5 text-sm font-medium text-violet-800 dark:text-violet-200">
              Tarjeta: {formatCurrency(summary.totalByPaymentMethod.card)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {(['businessServices', 'utilities', 'rent', 'merchandise', 'other'] as const).map((key) => (
          <CategoryCard
            key={key}
            title={CATEGORY_LABELS[key] ?? key}
            items={expensesByCategory[key].items}
            total={expensesByCategory[key].total}
            percentage={expensesByCategory[key].percentage}
            icon={CATEGORY_ICONS[key] ?? FolderOpen}
            borderColor={`border-l-4 ${CATEGORY_BORDER[key] ?? 'border-l-slate-500'}`}
          />
        ))}
      </div>

      <Card className="overflow-hidden border-l-4 border-l-indigo-500 dark:border-l-indigo-600 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-indigo-50/50 dark:bg-indigo-950/30 border-b border-indigo-200/50 dark:border-indigo-800/50">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="rounded-lg bg-indigo-100 dark:bg-indigo-900/40 p-1.5">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </span>
            Nómina (empleados)
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total: {formatCurrency(employeeSalaries.total)}</p>
            <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:text-indigo-200">
              {employeeSalaries.percentage.toFixed(1)}%
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {employeeSalaries.items.length === 0 ? (
            <p className="text-sm text-slate-500">Sin registros.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeSalaries.items.map((i) => (
                  <TableRow key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell>{formatExpenseDate(i.date)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(i.amount)}</TableCell>
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

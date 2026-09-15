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
  businessServices: 'border-l-apoyo',
  utilities: 'border-l-primary',
  rent: 'border-l-destructive',
  merchandise: 'border-l-fresco',
  other: 'border-l-muted-foreground',
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
          <span className="rounded-lg bg-secondary/80 dark:bg-card p-1.5">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </span>
          {title}
        </CardTitle>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm font-semibold text-foreground">Total: {formatCurrency(total)}</p>
          <span className="rounded-full bg-primary/10 dark:bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
            {percentage.toFixed(1)}%
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin registros.</p>
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
                <TableRow key={i.id} className="hover:bg-muted dark:hover:bg-card/50">
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
        <Card className="overflow-hidden border-l-4 border-l-destructive bg-gradient-to-br from-white to-destructive-suave/30 dark:from-card shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="rounded-lg bg-destructive-suave p-1.5">
                <Wallet className="h-4 w-4 text-destructive" />
              </span>
              Total gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-h1 text-destructive">{formatCurrency(summary.totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-chart-5 bg-gradient-to-br from-white to-chart-5/15 dark:from-card shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="rounded-lg bg-chart-5/15 p-1.5">
                <PieChart className="h-4 w-4 text-chart-5" />
              </span>
              Promedio por concepto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-h1 text-chart-5">{formatCurrency(summary.averageExpense)}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-apoyo bg-gradient-to-br from-white to-apoyo-suave/30 dark:from-card shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="rounded-lg bg-apoyo-suave p-1.5">
                <Award className="h-4 w-4 text-apoyo" />
              </span>
              Categoría con mayor gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-h3 text-apoyo-texto capitalize">
              {CATEGORY_LABELS[summary.largestExpenseCategory] ?? summary.largestExpenseCategory}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md border-border">
        <CardHeader className="bg-muted/80 dark:bg-card/50 border-b border-border">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-5 w-5 text-primary" />
            Por método de pago
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <span className="rounded-lg bg-apoyo-suave px-3 py-1.5 text-sm font-medium text-apoyo-texto">
              Efectivo: {formatCurrency(summary.totalByPaymentMethod.cash)}
            </span>
            <span className="rounded-lg bg-primary/10 dark:bg-primary/20 px-3 py-1.5 text-sm font-medium text-primary">
              Transferencia: {formatCurrency(summary.totalByPaymentMethod.transfer)}
            </span>
            <span className="rounded-lg bg-chart-5/15 px-3 py-1.5 text-sm font-medium text-chart-5">
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
            borderColor={`border-l-4 ${CATEGORY_BORDER[key] ?? 'border-l-muted-foreground'}`}
          />
        ))}
      </div>

      <Card className="overflow-hidden border-l-4 border-l-apoyo shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-apoyo-suave border-b border-apoyo">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="rounded-lg bg-apoyo-suave p-1.5">
              <Users className="h-5 w-5 text-apoyo-texto" />
            </span>
            Nómina (empleados)
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm font-semibold text-foreground">Total: {formatCurrency(employeeSalaries.total)}</p>
            <span className="rounded-full bg-apoyo-suave px-2 py-0.5 text-xs font-medium text-apoyo-texto">
              {employeeSalaries.percentage.toFixed(1)}%
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {employeeSalaries.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin registros.</p>
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
                  <TableRow key={i.id} className="hover:bg-muted dark:hover:bg-card/50">
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

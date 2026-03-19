import React from 'react';
import { TrendingUp, TrendingDown, Scale, Receipt, Briefcase, Package } from 'lucide-react';
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
import { formatCurrency, formatExpenseDate } from '@/shared/utils';
import type { CashFlowReportData } from '@/domain/types';

interface CashFlowReportViewProps {
  data: CashFlowReportData;
}

const PAYMENT_LABELS: Record<number, string> = {
  1: 'Efectivo',
  2: 'Transferencia',
  3: 'Tarjeta',
};

const paymentPillClass: Record<number, string> = {
  1: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  3: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
};

export const CashFlowReportView: React.FC<CashFlowReportViewProps> = ({ data }) => {
  const { incomes, expenses, cashFlow } = data;
  const bpm = incomes.byPaymentMethod ?? { cash: 0, transfer: 0, card: 0 };
  const statusConfig =
    cashFlow.status === 'POSITIVE'
      ? { variant: 'default' as const, label: 'Positivo', icon: TrendingUp, className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' }
      : cashFlow.status === 'NEGATIVE'
        ? { variant: 'destructive' as const, label: 'Negativo', icon: TrendingDown, className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800' }
        : { variant: 'secondary' as const, label: 'En equilibrio', icon: Scale, className: 'bg-slate-100 text-slate-800 dark:bg-slate-700/50 dark:text-slate-300 border-slate-200 dark:border-slate-600' };
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6 p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="overflow-hidden border-l-4 border-l-green-500 dark:border-l-green-600 bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800 dark:to-green-950/20 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <span className="rounded-lg bg-green-100 dark:bg-green-900/40 p-1.5">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </span>
              Ingresos totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(incomes.totalIncomes)}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="rounded-md px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">Efectivo {formatCurrency(bpm.cash)}</span>
              <span className="rounded-md px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">Transf. {formatCurrency(bpm.transfer)}</span>
              <span className="rounded-md px-2 py-0.5 text-xs font-medium bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300">Tarjeta {formatCurrency(bpm.card)}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-red-500 dark:border-l-red-600 bg-gradient-to-br from-white to-red-50/30 dark:from-slate-800 dark:to-red-950/20 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <span className="rounded-lg bg-red-100 dark:bg-red-900/40 p-1.5">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              </span>
              Gastos totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(expenses.totalExpenses)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 space-x-1">
              Servicios {formatCurrency(expenses.businessServices.total)} · Mercancía {formatCurrency(expenses.merchandise.total)} · Nómina {formatCurrency(expenses.employeeSalaries.total)} · Propinas {formatCurrency(expenses.tips.total)}
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-primary bg-gradient-to-br from-white to-primary/5 dark:from-slate-800 dark:to-primary/10 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 p-1.5">
                <StatusIcon className="h-4 w-4 text-primary" />
              </span>
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(cashFlow.balance)}</p>
            <Badge variant={statusConfig.variant} className={`mt-2 border ${statusConfig.className}`}>
              {statusConfig.label}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md border-slate-200 dark:border-slate-700">
        <CardHeader className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-5 w-5 text-primary" />
            Órdenes (ingresos)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {incomes.orders.length === 0 ? (
            <p className="text-sm text-slate-500">No hay órdenes en el período.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-700">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Método de pago</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.orders.map((o) => (
                  <TableRow key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell>{formatExpenseDate(o.date)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(o.total)}</TableCell>
                    <TableCell>
                      {o.paymentMethod != null ? (
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${paymentPillClass[o.paymentMethod] ?? 'bg-slate-100 dark:bg-slate-700'}`}>
                          {PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-200 dark:bg-slate-600 px-2 py-0.5 text-xs">Dividido</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-md border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Servicios del negocio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.businessServices.items.length === 0 ? (
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
                  {expenses.businessServices.items.map((i) => (
                    <TableRow key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <TableCell>{formatExpenseDate(i.date)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(i.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <p className="text-sm font-semibold mt-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-amber-800 dark:text-amber-200">
              Total: {formatCurrency(expenses.businessServices.total)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Mercancía
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.merchandise.items.length === 0 ? (
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
                  {expenses.merchandise.items.map((i) => (
                    <TableRow key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <TableCell>{formatExpenseDate(i.date)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(i.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <p className="text-sm font-semibold mt-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 px-3 py-2 text-blue-800 dark:text-blue-200">
              Total: {formatCurrency(expenses.merchandise.total)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

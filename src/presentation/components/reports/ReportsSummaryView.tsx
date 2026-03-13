import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { DollarSign, ShoppingCart, TrendingUp, Receipt, Wallet } from 'lucide-react';
import { formatCurrency } from '@/shared/utils';
import type { ReportsSummaryResponse } from '@/domain/types';

const PAYMENT_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e'];
const EXPENSE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#22c55e', '#ef4444', '#6b7280'];

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

interface ReportsSummaryViewProps {
  data: ReportsSummaryResponse;
}

export const ReportsSummaryView: React.FC<ReportsSummaryViewProps> = ({ data }) => {
  const { kpis, salesOverTime, paymentDistribution, topProducts, expensesByCategory, dailyTable } = data;

  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Ventas totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(kpis.totalSales)}</p>
            <p className={`text-xs font-medium ${kpis.totalSalesChangePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatPercent(kpis.totalSalesChangePercent)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Órdenes procesadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.ordersProcessed}</p>
            <p className={`text-xs font-medium ${kpis.ordersProcessedChangePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatPercent(kpis.ordersProcessedChangePercent)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-violet-500">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Promedio por orden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(kpis.averagePerOrder)}</p>
            <p className={`text-xs font-medium ${kpis.averagePerOrderChangePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatPercent(kpis.averagePerOrderChangePercent)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Gastos totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(kpis.totalExpenses)}</p>
            <p className={`text-xs font-medium ${kpis.totalExpensesChangePercent <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatPercent(kpis.totalExpensesChangePercent)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Utilidad neta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${kpis.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(kpis.netProfit)}
            </p>
            <p className={`text-xs font-medium ${kpis.netProfitChangePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatPercent(kpis.netProfitChangePercent)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ventas en el tiempo - dataKey "date" para que cada punto sea único y el tooltip muestre el valor correcto */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas a lo largo del tiempo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesOverTime} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(dateStr: string) => {
                    const d = new Date(dateStr + 'T12:00:00');
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                />
                <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                  labelFormatter={(_, payload) => (payload?.[0]?.payload?.date ?? '')}
                />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Ventas" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribución por método de pago */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por método de pago</CardTitle>
            <p className="text-sm text-slate-500">{kpis.ordersProcessed} órdenes</p>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentDistribution}
                    dataKey="percentage"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ label, percentage }) => `${label} ${percentage.toFixed(0)}%`}
                  >
                    {paymentDistribution.map((_, i) => (
                      <Cell key={i} fill={PAYMENT_COLORS[i % PAYMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top 5 productos */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 productos más vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 20 }} barCategoryGap="12%">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis type="number" tickFormatter={(v) => v} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => [value, 'Cantidad']} />
                  <Bar dataKey="quantitySold" fill="#3b82f6" name="Vendidos" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gastos por categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de gastos por categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expensesByCategory} margin={{ bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Total']} />
                <Legend />
                <Bar dataKey="total" name="Total" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabla diaria */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen por día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Ventas</TableHead>
                  <TableHead className="text-right">Órdenes</TableHead>
                  <TableHead className="text-right">Gastos</TableHead>
                  <TableHead className="text-right">Utilidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyTable.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell className="font-medium">{row.date}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.sales)}</TableCell>
                    <TableCell className="text-right">{row.orders}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.expenses)}</TableCell>
                    <TableCell className={`text-right font-medium ${row.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(row.profit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

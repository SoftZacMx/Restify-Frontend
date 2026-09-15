import React from 'react';
import { TrendingUp, TrendingDown, Scale, Receipt, Briefcase, Package, Wallet, Zap, Building2, Users, FileText } from 'lucide-react';
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
  4: 'Mercado Pago',
};

const paymentPillClass: Record<number, string> = {
  1: 'bg-apoyo-suave text-apoyo-texto',
  2: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
  3: 'bg-chart-5/15 text-chart-5',
  4: 'bg-fresco-suave text-fresco-texto',
};

export const CashFlowReportView: React.FC<CashFlowReportViewProps> = ({ data }) => {
  const { incomes, expenses, cashFlow } = data;
  const bpm = incomes.byPaymentMethod ?? { cash: 0, transfer: 0, card: 0 };
  const statusConfig =
    cashFlow.status === 'POSITIVE'
      ? { variant: 'default' as const, label: 'Positivo', icon: TrendingUp, className: 'bg-fresco-suave text-fresco-texto border-fresco' }
      : cashFlow.status === 'NEGATIVE'
        ? { variant: 'destructive' as const, label: 'Negativo', icon: TrendingDown, className: 'bg-destructive-suave text-destructive-texto border-destructive' }
        : { variant: 'secondary' as const, label: 'En equilibrio', icon: Scale, className: 'bg-muted text-foreground dark:bg-card/50 dark:text-foreground border-border' };
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6 p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="overflow-hidden border-l-4 border-l-fresco bg-gradient-to-br from-white to-fresco-suave/30 dark:from-card shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="rounded-lg bg-fresco-suave p-1.5">
                <TrendingUp className="h-4 w-4 text-fresco" />
              </span>
              Ingresos totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-h1 text-fresco">{formatCurrency(incomes.totalIncomes)}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="rounded-md px-2 py-0.5 text-xs font-medium bg-apoyo-suave text-apoyo-texto">Efectivo {formatCurrency(bpm.cash)}</span>
              <span className="rounded-md px-2 py-0.5 text-xs font-medium bg-primary/10 dark:bg-primary/20 text-primary">Transf. {formatCurrency(bpm.transfer)}</span>
              <span className="rounded-md px-2 py-0.5 text-xs font-medium bg-chart-5/15 text-chart-5">Tarjeta {formatCurrency(bpm.card)}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-destructive bg-gradient-to-br from-white to-destructive-suave/30 dark:from-card shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="rounded-lg bg-destructive-suave p-1.5">
                <TrendingDown className="h-4 w-4 text-destructive" />
              </span>
              Gastos totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-h1 text-destructive">{formatCurrency(expenses.totalExpenses)}</p>
            <div className="flex flex-wrap gap-1.5 mt-2 text-xs">
              {expenses.businessServices.total > 0 && (
                <span className="rounded-md px-2 py-0.5 font-medium bg-apoyo-suave text-apoyo-texto">Servicios {formatCurrency(expenses.businessServices.total)}</span>
              )}
              {expenses.utility.total > 0 && (
                <span className="rounded-md px-2 py-0.5 font-medium bg-apoyo-suave text-apoyo-texto">S. públicos {formatCurrency(expenses.utility.total)}</span>
              )}
              {expenses.rent.total > 0 && (
                <span className="rounded-md px-2 py-0.5 font-medium bg-destructive-suave text-destructive-texto">Renta {formatCurrency(expenses.rent.total)}</span>
              )}
              {expenses.merchandise.total > 0 && (
                <span className="rounded-md px-2 py-0.5 font-medium bg-primary/10 dark:bg-primary/20 text-primary">Mercancía {formatCurrency(expenses.merchandise.total)}</span>
              )}
              {(expenses.salary.total + expenses.employeeSalaries.total) > 0 && (
                <span className="rounded-md px-2 py-0.5 font-medium bg-chart-5/15 text-chart-5">Nómina {formatCurrency(expenses.salary.total + expenses.employeeSalaries.total)}</span>
              )}
              {expenses.mercadoPagoFee.total > 0 && (
                <span className="rounded-md px-2 py-0.5 font-medium bg-chart-4/15 text-chart-4">Comisión MP {formatCurrency(expenses.mercadoPagoFee.total)}</span>
              )}
              {expenses.other.total > 0 && (
                <span className="rounded-md px-2 py-0.5 font-medium bg-muted text-foreground">Otros {formatCurrency(expenses.other.total)}</span>
              )}
              {expenses.tips.total > 0 && (
                <span className="rounded-md px-2 py-0.5 font-medium bg-destructive-suave text-destructive-texto">Propinas {formatCurrency(expenses.tips.total)}</span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-primary bg-gradient-to-br from-white to-primary/5 dark:from-card dark:to-primary/10 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 p-1.5">
                <StatusIcon className="h-4 w-4 text-primary" />
              </span>
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-h1 text-foreground">{formatCurrency(cashFlow.balance)}</p>
            <Badge variant={statusConfig.variant} className={`mt-2 border ${statusConfig.className}`}>
              {statusConfig.label}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md border-border">
        <CardHeader className="bg-muted/80 dark:bg-card/50 border-b border-border">
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-5 w-5 text-primary" />
            Órdenes (ingresos)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {incomes.orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay órdenes en el período.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Método de pago</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.orders.map((o) => (
                  <TableRow key={o.id} className="hover:bg-muted dark:hover:bg-card/50">
                    <TableCell>{formatExpenseDate(o.date)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(o.total)}</TableCell>
                    <TableCell>
                      {o.paymentMethod != null ? (
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${paymentPillClass[o.paymentMethod] ?? 'bg-muted'}`}>
                          {PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}
                        </span>
                      ) : (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">Dividido</span>
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
        <Card className="shadow-md border-border hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-apoyo" />
              Servicios del negocio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.businessServices.items.length === 0 ? (
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
                  {expenses.businessServices.items.map((i) => (
                    <TableRow key={i.id} className="hover:bg-muted dark:hover:bg-card/50">
                      <TableCell>{formatExpenseDate(i.date)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(i.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <p className="text-sm font-semibold mt-3 rounded-lg bg-apoyo-suave px-3 py-2 text-apoyo-texto">
              Total: {formatCurrency(expenses.businessServices.total)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-border hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Mercancía
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.merchandise.items.length === 0 ? (
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
                  {expenses.merchandise.items.map((i) => (
                    <TableRow key={i.id} className="hover:bg-muted dark:hover:bg-card/50">
                      <TableCell>{formatExpenseDate(i.date)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(i.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <p className="text-sm font-semibold mt-3 rounded-lg bg-primary/10 dark:bg-primary/20 px-3 py-2 text-primary">
              Total: {formatCurrency(expenses.merchandise.total)}
            </p>
          </CardContent>
        </Card>
      </div>

      {(expenses.utility.total > 0 ||
        expenses.rent.total > 0 ||
        expenses.salary.total > 0 ||
        expenses.other.total > 0 ||
        expenses.mercadoPagoFee.total > 0) && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ExpenseBucketCard
            visible={expenses.utility.total > 0}
            title="Servicios públicos"
            icon={Zap}
            iconClass="text-apoyo"
            totalClass="bg-apoyo-suave text-apoyo-texto"
            bucket={expenses.utility}
          />
          <ExpenseBucketCard
            visible={expenses.rent.total > 0}
            title="Renta"
            icon={Building2}
            iconClass="text-destructive"
            totalClass="bg-destructive-suave text-destructive-texto"
            bucket={expenses.rent}
          />
          <ExpenseBucketCard
            visible={expenses.salary.total > 0}
            title="Salarios (gastos)"
            icon={Users}
            iconClass="text-chart-5"
            totalClass="bg-chart-5/15 text-chart-5"
            bucket={expenses.salary}
          />
          <ExpenseBucketCard
            visible={expenses.mercadoPagoFee.total > 0}
            title="Comisión Mercado Pago"
            icon={Wallet}
            iconClass="text-chart-4"
            totalClass="bg-chart-4/15 text-chart-4"
            bucket={expenses.mercadoPagoFee}
          />
          <ExpenseBucketCard
            visible={expenses.other.total > 0}
            title="Otros gastos"
            icon={FileText}
            iconClass="text-muted-foreground"
            totalClass="bg-muted text-foreground"
            bucket={expenses.other}
          />
        </div>
      )}
    </div>
  );
};

interface ExpenseBucketCardProps {
  visible: boolean;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  totalClass: string;
  bucket: { items: Array<{ id: string; date: string; total: number }>; total: number };
}

const ExpenseBucketCard: React.FC<ExpenseBucketCardProps> = ({
  visible,
  title,
  icon: Icon,
  iconClass,
  totalClass,
  bucket,
}) => {
  if (!visible) return null;
  return (
    <Card className="shadow-md border-border hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className={`h-4 w-4 ${iconClass}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bucket.items.map((i) => (
              <TableRow key={i.id} className="hover:bg-muted dark:hover:bg-card/50">
                <TableCell>{formatExpenseDate(i.date)}</TableCell>
                <TableCell className="font-medium">{formatCurrency(i.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className={`text-sm font-semibold mt-3 rounded-lg px-3 py-2 ${totalClass}`}>
          Total: {formatCurrency(bucket.total)}
        </p>
      </CardContent>
    </Card>
  );
};

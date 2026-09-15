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
        <Card className="overflow-hidden border-l-4 border-l-fresco bg-gradient-to-br from-white to-fresco-suave/30 dark:from-card shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="rounded-lg bg-fresco-suave p-1.5">
                <DollarSign className="h-4 w-4 text-fresco" />
              </span>
              Total vendido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-h1 text-fresco">{formatCurrency(totalSold)}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-primary bg-gradient-to-br from-white to-primary/30 dark:from-card dark:to-primary/20 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 dark:bg-primary/20 p-1.5">
                <Package className="h-4 w-4 text-primary" />
              </span>
              Ítems con ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-h1 text-primary">{summary.totalMenuItems}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-chart-5 bg-gradient-to-br from-white to-chart-5/15 dark:from-card shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="rounded-lg bg-chart-5/15 p-1.5">
                <BarChart2 className="h-4 w-4 text-chart-5" />
              </span>
              Precio promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-h1 text-chart-5">{formatCurrency(summary.averagePrice)}</p>
          </CardContent>
        </Card>
      </div>

      {summary.topSeller && (
        <Card className="overflow-hidden border-2 border-apoyo bg-gradient-to-br from-apoyo-suave/80 to-white dark:to-card shadow-lg">
          <CardHeader className="bg-apoyo-suave/50 border-b border-apoyo/50">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="rounded-xl bg-apoyo-suave p-2">
                <Trophy className="h-5 w-5 text-apoyo-texto" />
              </span>
              Mejor vendido
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground text-lg">{summary.topSeller.menuItemName}</p>
              <p className="text-sm text-muted-foreground mt-1">Total vendido: <span className="font-medium text-apoyo-texto">{formatCurrency(summary.topSeller.totalSold)}</span></p>
            </div>
            <Badge className="bg-apoyo-suave text-apoyo-texto border-0 text-sm px-3 py-1">
              Top 1
            </Badge>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-md border-border">
        <CardHeader className="bg-muted/80 dark:bg-card/50 border-b border-border">
          <CardTitle className="flex items-center gap-2 text-base">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
            Ventas por ítem del catálogo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {sales.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay ventas en el período.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Producto</TableHead>
                  <TableHead>Precio unit.</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Total vendido</TableHead>
                  <TableHead>% del total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((s, idx) => (
                  <TableRow key={s.menuItemId} className={`hover:bg-muted dark:hover:bg-card/50 ${idx === 0 ? 'bg-apoyo-suave/50' : ''}`}>
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

import React, { useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { Card } from '@/presentation/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { ExpenseService } from '@/application/services/expense.service';
import { productService } from '@/application/services';
import type { Expense, ExpenseType } from '@/domain/types';
import {
  getExpenseTypeLabel,
  getExpenseTypeBadgeColor,
  getPaymentMethodLabel,
  getUnitOfMeasureLabel,
  formatCurrency,
  formatExpenseDate,
} from '@/shared/utils';
import { showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';
import { cn } from '@/shared/lib/utils';

const expenseService = new ExpenseService();

/**
 * Página de Detalle de Gasto
 * Muestra toda la información del gasto. Si es tipo MERCHANDISE (compra de mercancía), muestra la tabla de ítems.
 * Si se navega desde la lista, se usa el gasto en state para mostrar al instante y se refresca desde API (para obtener ítems).
 */
const ExpenseDetailPage: React.FC = () => {
  const { expenseId } = useParams<{ expenseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const expenseFromState = (location.state as { expense?: Expense } | null)?.expense;

  const {
    data: expense,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: async () => {
      if (!expenseId) throw new Error('Expense ID is required');
      return await expenseService.getExpenseById(expenseId);
    },
    enabled: !!expenseId,
    placeholderData: expenseFromState ?? undefined,
  });

  const productIds = useMemo(() => {
    if (!expense?.items?.length) return [];
    return [...new Set(expense.items.map((i) => i.productId))];
  }, [expense?.items]);

  const productQueries = useQueries({
    queries: productIds.map((id) => ({
      queryKey: ['product', id],
      queryFn: () => productService.getProductById(id),
      enabled: !!expense && productIds.length > 0,
    })),
  });

  const productNamesById = useMemo(() => {
    const map: Record<string, string> = {};
    expense?.items?.forEach((item) => {
      if (item.product?.name) map[item.productId] = item.product.name;
    });
    productQueries.forEach((q, i) => {
      const id = productIds[i];
      if (id && q.data?.name) map[id] = q.data.name;
    });
    return map;
  }, [expense?.items, productQueries, productIds]);

  const getProductName = (productId: string, item: { product?: { name?: string } }): string =>
    item.product?.name ?? productNamesById[productId] ?? `Producto ${productId.substring(0, 8)}...`;

  React.useEffect(() => {
    if (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al cargar gasto', error.message);
      } else {
        showErrorToast('Error al cargar gasto', 'No se pudo obtener la información del gasto');
      }
    }
  }, [error]);

  if (isLoading && !expense) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Cargando información del gasto...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!expense) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-slate-500 dark:text-slate-400 text-lg">Gasto no encontrado</p>
          <Button onClick={() => navigate('/expenses')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Gastos
          </Button>
        </div>
      </MainLayout>
    );
  }

  const typeLabel = getExpenseTypeLabel(expense.type as ExpenseType);
  const isMerchandise = expense.type === 'MERCHANDISE';
  const hasItems = isMerchandise && expense.items && expense.items.length > 0;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            to="/dashboard"
            className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">/</span>
          <Link
            to="/expenses"
            className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"
          >
            Gastos
          </Link>
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">/</span>
          <span className="text-slate-800 dark:text-slate-200 text-sm font-medium truncate max-w-[200px]">
            {expense.title || typeLabel}
          </span>
        </div>

        {/* Page Heading */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">
              {expense.title || typeLabel}
            </h1>
            <Badge
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0',
                getExpenseTypeBadgeColor(expense.type as ExpenseType)
              )}
            >
              {typeLabel}
            </Badge>
          </div>
          <Button onClick={() => navigate('/expenses')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Gastos
          </Button>
        </div>

        {/* Información General */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Información General
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Título</label>
                <p className="text-base text-slate-900 dark:text-white mt-1">{expense.title || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Descripción</label>
                <p className="text-base text-slate-900 dark:text-white mt-1">
                  {expense.description || 'Sin descripción'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Fecha</label>
                <p className="text-base text-slate-900 dark:text-white mt-1">
                  {formatExpenseDate(expense.date)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Método de pago</label>
                <p className="text-base text-slate-900 dark:text-white mt-1">
                  {getPaymentMethodLabel(expense.paymentMethod)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Usuario</label>
                <p className="text-base text-slate-900 dark:text-white mt-1">
                  {expense.user
                    ? `${expense.user.name} ${expense.user.last_name}`
                    : `Usuario ${expense.userId.substring(0, 8)}...`}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Totales
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Subtotal</span>
                <span className="text-base font-medium text-slate-900 dark:text-white">
                  {formatCurrency(expense.subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">IVA</span>
                <span className="text-base font-medium text-slate-900 dark:text-white">
                  {formatCurrency(expense.iva)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="text-base font-semibold text-slate-900 dark:text-white">Total</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency(expense.total)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Ítems de compra de mercancía (solo si type === MERCHANDISE y hay items) */}
        {hasItems && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Detalle de la compra de mercancía
            </h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Producto
                    </TableHead>
                    <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Cantidad
                    </TableHead>
                    <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Unidad
                    </TableHead>
                    <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                      Subtotal
                    </TableHead>
                    <TableHead className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expense.items!.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <TableCell className="text-sm font-medium text-slate-900 dark:text-white">
                        {getProductName(item.productId, item)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-300">
                        {item.amount}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-300">
                        {getUnitOfMeasureLabel(item.unitOfMeasure)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-300 text-right">
                        {formatCurrency(item.subtotal)}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-900 dark:text-white text-right">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ExpenseDetailPage;

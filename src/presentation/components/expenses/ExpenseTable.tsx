import React from 'react';
import { MoreVertical, Trash2, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { Badge } from '@/presentation/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import type { ExpenseTableItem } from '@/domain/types';
import { getExpenseTypeBadgeColor, formatCurrency, formatExpenseDate, cn } from '@/shared/utils';

interface ExpenseTableProps {
  expenses: ExpenseTableItem[];
  isLoading?: boolean;
  onExpenseAction?: (expenseId: string, action: 'delete' | 'view') => void;
}

/**
 * Componente ExpenseTable
 * Responsabilidad única: Renderizar tabla de gastos
 * Cumple SRP: Solo maneja la presentación de datos en tabla
 */
export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  isLoading = false,
  onExpenseAction,
}) => {
  if (isLoading) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Cargando gastos...
          </div>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4">
                <svg
                  className="h-8 w-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  No se encontraron gastos
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Intenta ajustar los filtros o registra un nuevo gasto para comenzar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  FECHA
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  TIPO
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  TÍTULO
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  DESCRIPCIÓN
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  TOTAL
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  MÉTODO DE PAGO
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  USUARIO
                </TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  ACCIONES
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow
                  key={expense.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {formatExpenseDate(expense.date)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0',
                        getExpenseTypeBadgeColor(expense.type)
                      )}
                    >
                      {expense.typeLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100 max-w-[200px]">
                    <div className="truncate" title={expense.title}>
                      {expense.title || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-md">
                    <div className="truncate" title={expense.description || ''}>
                      {expense.description || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                    {formatCurrency(expense.total)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {expense.paymentMethodLabel}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {expense.userName}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onSelect={() => onExpenseAction?.(expense.id, 'view')}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Ver detalle</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onExpenseAction?.(expense.id, 'delete')}
                          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};



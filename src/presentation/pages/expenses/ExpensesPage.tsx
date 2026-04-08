import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import { ConfirmDialog } from '@/presentation/components/ui/confirm-dialog';
import { ExpenseFilters } from '@/presentation/components/expenses/ExpenseFilters';
import { ExpenseTable } from '@/presentation/components/expenses/ExpenseTable';
import { Pagination } from '@/presentation/components/ui/pagination';
import { CreateExpenseDialog } from '@/presentation/components/expenses/CreateExpenseDialog';
import { useDialogState } from '@/presentation/hooks/useDialogState';
import { ExpenseService } from '@/application/services/expense.service';
import type { ExpenseTableFilters, CreateExpenseRequest } from '@/domain/types';
import { formatExpensesForTable } from '@/shared/utils';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50];
const expenseService = new ExpenseService();

const ExpensesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<ExpenseTableFilters>({
    search: '',
    type: undefined,
    paymentMethod: undefined,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingExpense, setIsCreatingExpense] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteDialog = useDialogState<{ id: string }>();

  const {
    data: listResult,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => expenseService.listExpensesWithPagination(filters),
    staleTime: 30000,
    retry: 1,
  });

  const expenses = listResult?.data ?? [];
  const pagination = listResult?.pagination ?? { page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0, totalPages: 0 };

  React.useEffect(() => {
    if (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al cargar gastos', error.message);
      } else {
        showErrorToast('Error al cargar gastos', 'No se pudieron obtener los gastos del servidor');
      }
    }
  }, [error]);

  const filteredExpenses = useMemo(() => {
    if (!filters.search) return expenses;
    const q = filters.search.toLowerCase();
    return expenses.filter(
      (e) => e.title?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q)
    );
  }, [expenses, filters.search]);

  const tableExpenses = useMemo(() => formatExpensesForTable(filteredExpenses), [filteredExpenses]);

  const paginationData = useMemo(() => ({
    currentPage: pagination.page,
    totalPages: Math.max(1, pagination.totalPages),
    totalItems: pagination.total,
    itemsPerPage: pagination.pageSize,
  }), [pagination]);

  const handleFiltersChange = useCallback((newFilters: ExpenseTableFilters) => {
    const paymentMethod = (() => {
      const v = newFilters.paymentMethod;
      if (v === undefined || v === 'all') return undefined;
      const n = typeof v === 'string' ? parseInt(v, 10) : v;
      return n === 1 || n === 2 || n === 3 ? (n as 1 | 2 | 3) : undefined;
    })();
    setFilters((prev) => ({
      ...newFilters,
      paymentMethod,
      page: 1,
      pageSize: prev.pageSize ?? DEFAULT_PAGE_SIZE,
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleExpenseAction = useCallback((expenseId: string, action: 'delete' | 'view') => {
    switch (action) {
      case 'view': {
        const expense = expenses.find((e) => e.id === expenseId);
        navigate(`/expenses/${expenseId}`, { state: expense ? { expense } : undefined });
        break;
      }
      case 'delete':
        deleteDialog.open({ id: expenseId });
        break;
    }
  }, [expenses, navigate, deleteDialog]);

  const handleConfirmDelete = async () => {
    if (!deleteDialog.data) return;
    setIsDeleting(true);
    try {
      await expenseService.deleteExpense(deleteDialog.data.id);
      showSuccessToast('Gasto eliminado', 'El gasto ha sido eliminado exitosamente');
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al eliminar gasto', error.message);
      } else {
        showErrorToast('Error al eliminar gasto', 'Ocurrió un error inesperado');
      }
    } finally {
      setIsDeleting(false);
      deleteDialog.close();
    }
  };

  const handleCreateExpense = async (expenseData: CreateExpenseRequest) => {
    setIsCreatingExpense(true);
    try {
      await expenseService.createExpense(expenseData);
      showSuccessToast('Gasto creado exitosamente', 'El nuevo gasto ha sido registrado');
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      await refetch();
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al crear gasto', error.message);
      } else {
        showErrorToast('Error al crear gasto', 'Ocurrió un error inesperado');
      }
      throw error;
    } finally {
      setIsCreatingExpense(false);
    }
  };

  return (
    <MainLayout>
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gastos</h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Gasto
          </Button>
        </div>

        <ExpenseFilters filters={filters} onFiltersChange={handleFiltersChange} />

        <ExpenseTable expenses={tableExpenses} isLoading={isLoading} onExpenseAction={handleExpenseAction} />

        {paginationData.totalItems > 0 && (
          <Pagination
            currentPage={paginationData.currentPage}
            totalPages={paginationData.totalPages}
            totalItems={paginationData.totalItems}
            itemsPerPage={paginationData.itemsPerPage}
            itemsLabel="gastos"
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        <CreateExpenseDialog
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={handleCreateExpense}
          isLoading={isCreatingExpense}
        />

        <ConfirmDialog
          open={deleteDialog.isOpen}
          onClose={deleteDialog.close}
          title="¿Eliminar gasto?"
          description="Esta acción no se puede deshacer. El gasto será eliminado permanentemente."
          confirmLabel="Eliminar"
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
        />
      </section>
    </MainLayout>
  );
};

export default ExpensesPage;

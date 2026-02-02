import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/presentation/components/ui/alert-dialog';
import { ExpenseFilters } from '@/presentation/components/expenses/ExpenseFilters';
import { ExpenseTable } from '@/presentation/components/expenses/ExpenseTable';
import { Pagination } from '@/presentation/components/ui/pagination';
import { CreateExpenseDialog } from '@/presentation/components/expenses/CreateExpenseDialog';
import { ExpenseService } from '@/application/services/expense.service';
import type { ExpenseTableFilters, CreateExpenseRequest } from '@/domain/types';

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50];
import { formatExpensesForTable } from '@/shared/utils';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

/**
 * Página de Gastos
 * Responsabilidad: Orquestar los componentes de la página de gastos
 * Cumple SRP: Solo maneja el estado y la lógica de la página
 */
const ExpensesPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ExpenseTableFilters>({
    search: '',
    type: undefined,
    paymentMethod: undefined,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingExpense, setIsCreatingExpense] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<{ id: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const expenseService = new ExpenseService();
  const queryClient = useQueryClient();

  // Query para obtener gastos de la API (con paginación)
  const {
    data: listResult,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['expenses', filters],
    queryFn: async () => {
      return await expenseService.listExpensesWithPagination(filters);
    },
    staleTime: 30000,
    retry: 1,
  });

  const expenses = listResult?.data ?? [];
  const pagination = listResult?.pagination ?? {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  };

  // Mostrar error si la carga falla
  React.useEffect(() => {
    if (error) {
      if (error instanceof AppError) {
        showErrorToast('Error al cargar gastos', error.message);
      } else {
        showErrorToast('Error al cargar gastos', 'No se pudieron obtener los gastos del servidor');
      }
    }
  }, [error]);

  /**
   * Filtra gastos en cliente solo por búsqueda (título/descripción); tipo, fechas y paginación van al API
   */
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (expense) =>
          expense.title?.toLowerCase().includes(searchLower) ||
          expense.description?.toLowerCase().includes(searchLower)
      );
    }
    return result;
  }, [expenses, filters.search]);

  const tableExpenses = useMemo(() => formatExpensesForTable(filteredExpenses), [filteredExpenses]);

  const paginationData = useMemo(
    () => ({
      currentPage: pagination.page,
      totalPages: Math.max(1, pagination.totalPages),
      totalItems: pagination.total,
      itemsPerPage: pagination.pageSize,
    }),
    [pagination]
  );

  const handleFiltersChange = (newFilters: ExpenseTableFilters) => {
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
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handler para acciones de gasto.
   * Ver detalle: navega a /expenses/:id con el gasto en state para mostrar al instante; la página de detalle obtiene datos completos (incl. ítems) desde API.
   */
  const handleExpenseAction = (expenseId: string, action: 'delete' | 'view') => {
    switch (action) {
      case 'view': {
        const expenseFromList = expenses.find((e) => e.id === expenseId);
        navigate(`/expenses/${expenseId}`, { state: expenseFromList ? { expense: expenseFromList } : undefined });
        break;
      }
      case 'delete':
        setExpenseToDelete({ id: expenseId });
        setIsDeleteDialogOpen(true);
        break;
    }
  };

  /**
   * Handler para confirmar eliminación
   */
  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;

    setIsDeleting(true);
    try {
      await expenseService.deleteExpense(expenseToDelete.id);
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
      setIsDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  /**
   * Handler para crear gasto
   */
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
      throw error; // Re-throw para que el dialog no se cierre
    } finally {
      setIsCreatingExpense(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Gastos
            </h1>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Gasto
          </Button>
        </div>

        {/* Filters */}
        <ExpenseFilters filters={filters} onFiltersChange={handleFiltersChange} />

        {/* Table */}
        <ExpenseTable
          expenses={tableExpenses}
          isLoading={isLoading}
          onExpenseAction={handleExpenseAction}
        />

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

        {/* Create Dialog */}
        <CreateExpenseDialog
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={handleCreateExpense}
          isLoading={isCreatingExpense}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar gasto?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El gasto será eliminado permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default ExpensesPage;

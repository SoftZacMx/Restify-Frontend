import React, { useState, useMemo } from 'react';
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
import { CreateExpenseDialog } from '@/presentation/components/expenses/CreateExpenseDialog';
import { ExpenseService } from '@/application/services/expense.service';
import type { ExpenseTableFilters, CreateExpenseRequest, Expense } from '@/domain/types';
import { formatExpensesForTable } from '@/shared/utils';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';

/**
 * Página de Gastos
 * Responsabilidad: Orquestar los componentes de la página de gastos
 * Cumple SRP: Solo maneja el estado y la lógica de la página
 */
const ExpensesPage: React.FC = () => {
  const [filters, setFilters] = useState<ExpenseTableFilters>({
    search: '',
    type: undefined,
    paymentMethod: undefined,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingExpense, setIsCreatingExpense] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<{ id: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const expenseService = new ExpenseService();
  const queryClient = useQueryClient();

  // Query para obtener gastos de la API
  const {
    data: expenses = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['expenses', filters],
    queryFn: async () => {
      return await expenseService.listExpenses(filters);
    },
    staleTime: 30000,
    retry: 1,
  });

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
   * Filtra gastos según los filtros aplicados
   */
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Filtro de búsqueda (descripción)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (expense) =>
          expense.description?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [expenses, filters]);

  /**
   * Convierte gastos a formato de tabla
   */
  const tableExpenses = useMemo(() => {
    return formatExpensesForTable(filteredExpenses);
  }, [filteredExpenses]);

  /**
   * Handler para cambios en filtros
   */
  const handleFiltersChange = (newFilters: ExpenseTableFilters) => {
    setFilters(newFilters);
  };

  /**
   * Handler para acciones de gasto
   */
  const handleExpenseAction = (expenseId: string, action: 'delete' | 'view') => {
    switch (action) {
      case 'delete':
        setExpenseToDelete({ id: expenseId });
        setIsDeleteDialogOpen(true);
        break;
      case 'view':
        // TODO: Implementar vista de detalle
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

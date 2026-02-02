import { ExpenseRepository } from '@/infrastructure/api/repositories/expense.repository';
import type {
  Expense,
  ExpenseListItem,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseTableFilters,
  ListExpensesResult,
} from '@/domain/types';
import { AppError } from '@/domain/errors';

/**
 * Servicio de gastos
 * Contiene la lógica de negocio para operaciones de gastos
 * Cumple SRP: Solo maneja lógica de negocio de gastos
 * Cumple DIP: Depende de la abstracción ExpenseRepository
 */
export class ExpenseService {
  private expenseRepository: ExpenseRepository;

  constructor(expenseRepository?: ExpenseRepository) {
    this.expenseRepository = expenseRepository ?? new ExpenseRepository();
  }

  /**
   * Crea un nuevo gasto
   */
  async createExpense(expenseData: CreateExpenseRequest): Promise<Expense> {
    this.validateCreateExpenseData(expenseData);

    try {
      const response = await this.expenseRepository.createExpense(expenseData);
      if (!response.success || !response.data) {
        throw new AppError('EXPENSE_CREATION_FAILED', 'No se pudo crear el gasto');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('EXPENSE_CREATION_FAILED', 'Error al crear el gasto');
    }
  }

  /**
   * Obtiene un gasto por ID
   */
  async getExpenseById(expenseId: string): Promise<Expense> {
    if (!expenseId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del gasto es requerido');
    }

    try {
      const response = await this.expenseRepository.getExpenseById(expenseId);
      if (!response.success || !response.data) {
        throw new AppError('EXPENSE_NOT_FOUND', 'Gasto no encontrado');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('EXPENSE_FETCH_FAILED', 'Error al obtener el gasto');
    }
  }

  /**
   * Lista gastos con filtros opcionales (devuelve el array de data)
   */
  async listExpenses(filters?: ExpenseTableFilters): Promise<ExpenseListItem[]> {
    try {
      const result = await this.expenseRepository.listExpenses(filters);
      return result.data ?? [];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('EXPENSE_LIST_FAILED', 'Error al listar gastos');
    }
  }

  /**
   * Lista gastos con filtros y paginación (devuelve data + pagination para la UI)
   */
  async listExpensesWithPagination(filters?: ExpenseTableFilters): Promise<ListExpensesResult> {
    try {
      const result = await this.expenseRepository.listExpenses(filters);
      return {
        data: result.data ?? [],
        pagination: result.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 0 },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('EXPENSE_LIST_FAILED', 'Error al listar gastos');
    }
  }

  /**
   * Actualiza un gasto (no se puede cambiar type ni items)
   */
  async updateExpense(expenseId: string, data: UpdateExpenseRequest): Promise<Expense> {
    if (!expenseId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del gasto es requerido');
    }
    try {
      const response = await this.expenseRepository.updateExpense(expenseId, data);
      if (!response.success || !response.data) {
        throw new AppError('EXPENSE_NOT_FOUND', 'Gasto no encontrado');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('EXPENSE_FETCH_FAILED', 'Error al actualizar el gasto');
    }
  }

  /**
   * Elimina un gasto
   */
  async deleteExpense(expenseId: string): Promise<void> {
    if (!expenseId) {
      throw new AppError('VALIDATION_ERROR', 'El ID del gasto es requerido');
    }

    try {
      const response = await this.expenseRepository.deleteExpense(expenseId);
      if (!response.success) {
        throw new AppError('EXPENSE_DELETE_FAILED', 'No se pudo eliminar el gasto');
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('EXPENSE_DELETE_FAILED', 'Error al eliminar el gasto');
    }
  }

  /**
   * Valida los datos para crear un gasto
   */
  private validateCreateExpenseData(expenseData: CreateExpenseRequest): void {
    const title = (expenseData as { title?: string }).title;
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new AppError('VALIDATION_ERROR', 'El título del gasto es requerido (mín. 1 carácter)');
    }
    if (title.length > 200) {
      throw new AppError('VALIDATION_ERROR', 'El título no puede superar 200 caracteres');
    }

    if (!expenseData.type) {
      throw new AppError('VALIDATION_ERROR', 'El tipo de gasto es requerido');
    }

    if (!expenseData.total || expenseData.total <= 0) {
      throw new AppError('VALIDATION_ERROR', 'El total debe ser mayor a 0');
    }

    if (!expenseData.subtotal || expenseData.subtotal <= 0) {
      throw new AppError('VALIDATION_ERROR', 'El subtotal debe ser mayor a 0');
    }

    if (expenseData.iva < 0) {
      throw new AppError('VALIDATION_ERROR', 'El IVA no puede ser negativo');
    }

    if (!expenseData.paymentMethod || ![1, 2, 3].includes(expenseData.paymentMethod)) {
      throw new AppError('VALIDATION_ERROR', 'El método de pago es requerido');
    }

    if (!expenseData.userId) {
      throw new AppError('VALIDATION_ERROR', 'El usuario es requerido');
    }

    // Validación específica para MERCHANDISE
    if (expenseData.type === 'MERCHANDISE') {
      if (!expenseData.items || expenseData.items.length === 0) {
        throw new AppError('VALIDATION_ERROR', 'Los items son requeridos para compra de mercancía');
      }

      // Validar que los totales coincidan
      const itemsSubtotal = expenseData.items.reduce((sum, item) => sum + item.subtotal, 0);
      const itemsTotal = expenseData.items.reduce((sum, item) => sum + item.total, 0);
      const calculatedIva = itemsTotal - itemsSubtotal;

      if (Math.abs(itemsSubtotal - expenseData.subtotal) > 0.01) {
        throw new AppError('VALIDATION_ERROR', 'El subtotal de los items no coincide con el subtotal del gasto');
      }

      if (Math.abs(calculatedIva - expenseData.iva) > 0.01) {
        throw new AppError('VALIDATION_ERROR', 'El IVA calculado no coincide con el IVA del gasto');
      }

      if (Math.abs(itemsTotal - expenseData.total) > 0.01) {
        throw new AppError('VALIDATION_ERROR', 'El total de los items no coincide con el total del gasto');
      }
    }
  }
}


import { ExpenseRepository } from '@/infrastructure/api/repositories/expense.repository';
import type {
  Expense,
  CreateExpenseRequest,
  ExpenseTableFilters,
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
   * Lista gastos con filtros opcionales
   */
  async listExpenses(filters?: ExpenseTableFilters): Promise<Expense[]> {
    try {
      const response = await this.expenseRepository.listExpenses(filters);
      if (!response.success) {
        return [];
      }
      // El backend devuelve { data: Expense[], pagination: {...} }
      // Necesitamos extraer solo el array de data
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      // Si viene en formato { data: [...], pagination: {...} }
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('EXPENSE_LIST_FAILED', 'Error al listar gastos');
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


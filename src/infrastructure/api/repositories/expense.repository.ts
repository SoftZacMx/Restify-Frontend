import apiClient from '../client';
import type { Expense, CreateExpenseRequest, ApiResponse, ExpenseTableFilters } from '@/domain/types';

/**
 * Repository para operaciones de gastos
 * Implementa el patrón Repository para abstraer el acceso a datos
 */
export class ExpenseRepository {
  /**
   * Crea un nuevo gasto
   */
  async createExpense(expenseData: CreateExpenseRequest): Promise<ApiResponse<Expense>> {
    try {
      const response = await apiClient.post('/api/expense', expenseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene un gasto por ID
   */
  async getExpenseById(expenseId: string): Promise<ApiResponse<Expense>> {
    try {
      const response = await apiClient.get(`/api/expense/${expenseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lista gastos con filtros opcionales
   */
  async listExpenses(filters?: ExpenseTableFilters): Promise<ApiResponse<Expense[]>> {
    try {
      const params: Record<string, string> = {};
      
      if (filters?.search) {
        params.search = filters.search;
      }
      
      if (filters?.type && filters.type !== 'all') {
        params.type = filters.type;
      }
      
      if (filters?.paymentMethod && filters.paymentMethod !== 'all') {
        params.paymentMethod = filters.paymentMethod.toString();
      }
      
      if (filters?.dateFrom) {
        params.dateFrom = filters.dateFrom;
      }
      
      if (filters?.dateTo) {
        params.dateTo = filters.dateTo;
      }

      const response = await apiClient.get('/api/expense', { params });
      // El backend devuelve { data: Expense[], pagination: {...} }
      // Necesitamos extraer solo el array de data
      if (response.data?.data) {
        return {
          ...response.data,
          data: response.data.data,
        };
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina un gasto
   */
  async deleteExpense(expenseId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/api/expense/${expenseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Exportar instancia singleton
export const expenseRepository = new ExpenseRepository();


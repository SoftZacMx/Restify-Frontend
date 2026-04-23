import apiClient from '../client';
import type {
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ApiResponse,
  ExpenseTableFilters,
  ListExpensesResult,
} from '@/domain/types';
import { getLocalDayBoundsUtc } from '@/shared/utils';

/** Base path: probar /api/expenses; si falla 404, usar /api/expense (singular) para el resto de la sesión */
const EXPENSE_BASE_PLURAL = '/api/expenses';
const EXPENSE_BASE_SINGULAR = '/api/expense';

/**
 * Repository para operaciones de gastos
 * Por defecto llama a /api/expenses. Si devuelve 404, prueba /api/expense y usa ese base a partir de entonces.
 */
export class ExpenseRepository {
  private _base = EXPENSE_BASE_PLURAL;

  private get base(): string {
    return this._base;
  }

  /**
   * Lista gastos: GET /api/expenses solo con query params (todos opcionales).
   * type, userId, paymentMethod (1|2|3), dateFrom, dateTo, page, pageSize.
   * Autenticación: header/cookie enviado por apiClient (withCredentials).
   */
  async listExpenses(filters?: ExpenseTableFilters): Promise<ListExpensesResult> {
    const params: Record<string, string | number> = {};
    if (filters?.type && filters.type !== 'all') params.type = filters.type;
    if (filters?.userId) params.userId = filters.userId;
    if (filters?.paymentMethod != null && filters.paymentMethod !== 'all') {
      params.paymentMethod = Number(filters.paymentMethod);
    }
    if (filters?.dateFrom) params.dateFrom = getLocalDayBoundsUtc(filters.dateFrom).dateFrom;
    if (filters?.dateTo) params.dateTo = getLocalDayBoundsUtc(filters.dateTo).dateTo;
    if (filters?.page != null) params.page = String(filters.page);
    if (filters?.pageSize != null) params.pageSize = String(filters.pageSize);

    const tryRequest = async (path: string) => {
      const response = await apiClient.get(path, { params });
      return response.data;
    };

    try {
      let body: unknown;
      try {
        body = await tryRequest(this._base);
      } catch (err: unknown) {
        const status =
          (err as { response?: { status?: number } })?.response?.status ??
          (err as { statusCode?: number })?.statusCode;
        if (status === 404 && this._base === EXPENSE_BASE_PLURAL) {
          this._base = EXPENSE_BASE_SINGULAR;
          body = await tryRequest(this._base);
        } else {
          throw err;
        }
      }

      // Respuesta puede ser: array directo | { data: Expense[], pagination } | { success, data: Expense[], pagination } | { success, data: { data, pagination } }
      if (Array.isArray(body)) {
        return { data: body, pagination: { page: 1, pageSize: body.length, total: body.length, totalPages: 1 } };
      }
      if (body && typeof body === 'object' && 'data' in body) {
        const b = body as Record<string, unknown>;
        const inner = b.data;
        let arr: unknown[] | null = null;
        let pagination = (b.pagination as ListExpensesResult['pagination']) ?? null;

        if (Array.isArray(inner)) {
          arr = inner;
          if (!pagination) {
            pagination = { page: 1, pageSize: inner.length, total: inner.length, totalPages: 1 };
          }
        } else if (inner && typeof inner === 'object' && 'data' in (inner as object)) {
          const nested = inner as { data?: unknown[]; pagination?: ListExpensesResult['pagination'] };
          if (Array.isArray(nested.data)) {
            arr = nested.data;
            pagination = nested.pagination ?? { page: 1, pageSize: nested.data.length, total: nested.data.length, totalPages: 1 };
          }
        }
        if (arr && arr.length >= 0) {
          return {
            data: arr as ListExpensesResult['data'],
            pagination: pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 0 },
          };
        }
      }
      return { data: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crea un nuevo gasto
   */
  async createExpense(expenseData: CreateExpenseRequest): Promise<ApiResponse<Expense>> {
    try {
      const response = await apiClient.post(this.base, expenseData);
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
      const response = await apiClient.get(`${this.base}/${expenseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza un gasto (no se puede cambiar type ni items)
   */
  async updateExpense(expenseId: string, data: UpdateExpenseRequest): Promise<ApiResponse<Expense>> {
    try {
      const response = await apiClient.put(`${this.base}/${expenseId}`, data);
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
      const response = await apiClient.delete(`${this.base}/${expenseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Exportar instancia singleton
export const expenseRepository = new ExpenseRepository();


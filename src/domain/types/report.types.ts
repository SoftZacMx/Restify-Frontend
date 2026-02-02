/**
 * Tipos para el módulo de reportes (GET /api/reports)
 */

export type ReportType = 'CASH_FLOW' | 'SALES_PERFORMANCE' | 'EXPENSE_ANALYSIS';

export interface ReportFilters {
  dateFrom?: string | null;
  dateTo?: string | null;
}

export interface BaseReportResponse<T = unknown> {
  type: ReportType;
  generatedAt: string; // ISO
  filters: ReportFilters;
  data: T;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// CASH_FLOW
export interface CashFlowReportData {
  incomes: {
    orders: Array<{ id: string; date: string; total: number; paymentMethod: number | null }>;
    totalIncomes: number;
    byPaymentMethod: { cash: number; transfer: number; card: number };
  };
  expenses: {
    businessServices: {
      items: Array<{ id: string; date: string; total: number; type: string; description: string | null }>;
      total: number;
    };
    merchandise: {
      items: Array<{ id: string; date: string; total: number; description: string | null }>;
      total: number;
    };
    employeeSalaries: { items: Array<{ id: string; date: string; amount: number }>; total: number };
    tips: { orders: Array<{ id: string; date: string; tip: number }>; total: number };
    totalExpenses: number;
  };
  cashFlow: { balance: number; status: 'POSITIVE' | 'NEGATIVE' | 'BREAK_EVEN' };
}

// SALES_PERFORMANCE
export interface SalesPerformanceReportData {
  sales: Array<{
    menuItemId: string;
    menuItemName: string;
    unitPrice: number;
    quantitySold: number;
    totalSold: number;
    percentageOfTotal: number;
  }>;
  totalSold: number;
  summary: {
    totalMenuItems: number;
    averagePrice: number;
    topSeller: { menuItemId: string; menuItemName: string; totalSold: number } | null;
  };
}

// EXPENSE_ANALYSIS
export interface ExpenseCategoryData {
  items: Array<{ id: string; date: string; total: number; description: string | null }>;
  total: number;
  percentage: number;
}

export interface ExpenseAnalysisReportData {
  expensesByCategory: {
    businessServices: ExpenseCategoryData;
    utilities: ExpenseCategoryData;
    rent: ExpenseCategoryData;
    merchandise: ExpenseCategoryData;
    other: ExpenseCategoryData;
  };
  employeeSalaries: {
    items: Array<{ id: string; date: string; amount: number }>;
    total: number;
    percentage: number;
  };
  summary: {
    totalExpenses: number;
    totalByPaymentMethod: { cash: number; transfer: number; card: number };
    largestExpenseCategory: string;
    averageExpense: number;
  };
}

// Respuesta envuelta por el backend
export interface ReportsApiResponse<T = unknown> {
  success: boolean;
  data: BaseReportResponse<T>;
}

export interface GenerateReportParams {
  type: ReportType;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

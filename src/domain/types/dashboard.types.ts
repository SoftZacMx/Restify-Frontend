/**
 * Tipos para el dashboard (GET /api/dashboard)
 */

export interface DashboardOrderSummary {
  id: string;
  total: number;
  date: string;
  origin: string;
  tableId: string | null;
  tableNumber?: number | null;
  status: boolean;
  delivered: boolean;
}

export interface DashboardSalesByDayItem {
  date: string;
  day: string;
  total: number;
}

export interface DashboardSalesLast7Days {
  total: number;
  byDay: DashboardSalesByDayItem[];
}

export interface DashboardActiveOrders {
  count: number;
  items: DashboardOrderSummary[];
}

export interface DashboardOccupiedTable {
  id: string;
  numberTable: number;
}

export interface DashboardOccupiedTables {
  count: number;
  items: DashboardOccupiedTable[];
}

export interface DashboardResponse {
  salesToday: number;
  salesLast7Days: DashboardSalesLast7Days;
  activeOrders: DashboardActiveOrders;
  occupiedTables: DashboardOccupiedTables;
  recentOrders: DashboardOrderSummary[];
  lastCompletedOrders: DashboardOrderSummary[];
}

export interface DashboardApiResponse {
  success: boolean;
  data?: DashboardResponse;
  timestamp?: string;
}

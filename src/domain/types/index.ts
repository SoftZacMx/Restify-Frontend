// Base types and interfaces

// User types
export type UserRole = 'ADMIN' | 'MANAGER' | 'WAITER' | 'CHEF';

export interface User {
  id: string;
  name: string;
  last_name: string;
  second_last_name: string | null;
  email: string;
  phone: string | null;
  status: boolean;
  rol: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    last_name: string;
    second_last_name: string | null;
    rol: string;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

// Re-export user table types
export type {
  UserStatusFilter,
  UserTableFilters,
  PaginationData,
  UserTableItem,
  UserTableProps,
  UserSearchBarProps,
  UserPaginationProps,
  CreateUserRequest,
  UpdateUserRequest,
  UserFormErrors,
} from './user.types';

// Re-export expense types
export type {
  ExpenseType,
  PaymentMethod,
  UnitOfMeasure,
  Expense,
  ExpenseItem,
  ExpenseTableFilters,
  ExpenseTableItem,
  ListExpensesQuery,
  ListExpensesResult,
  CreateExpenseRequest,
  CreateExpenseRequestNoItems,
  CreateExpenseRequestMerchandise,
  CreateExpenseItemRequest,
  UpdateExpenseRequest,
  ExpenseFormErrors,
  EmployeeUser,
  ExpenseListItem,
} from './expense.types';

// Re-export order types
export type {
  OrderType,
  OrderStatus,
  PosPaymentMethod,
  PosMode,
  Table,
  Category,
  ProductExtra,
  PosProduct,
  OrderItem,
  OrderPaymentMethod,
  Order,
  OrderItemExtraInput,
  OrderItemInput,
  CreateOrderRequest,
  UpdateOrderRequest,
  ListOrdersRequest,
  PayOrderRequest,
  PayOrderResult,
  OrderItemRequest,
  OrderItemExtraRequest,
  OrderItemExtraResponse,
  OrderItemResponse,
  OrderResponse,
  CreateOrderResponse,
  CartState,
  PaymentState,
  OrderFormErrors,
} from './order.types';

export { OrderOrigins } from './order.types';
export type { OrderOriginType } from './order.types';

// Re-export dashboard types
export type {
  DashboardOrderSummary,
  DashboardSalesByDayItem,
  DashboardSalesLast7Days,
  DashboardActiveOrders,
  DashboardOccupiedTable,
  DashboardOccupiedTables,
  DashboardResponse,
  DashboardApiResponse,
} from './dashboard.types';

// Re-export payment types
export type {
  PaymentMethodType,
  PaymentStatus,
  RefundStatus,
  PaymentGateway,
  PaymentMethodNumberType,
  PayOrderWithCashRequest,
  PayOrderWithTransferRequest,
  PayOrderWithCardPhysicalRequest,
  PayOrderWithCardStripeRequest,
  SplitPaymentPart,
  PayOrderWithSplitPaymentRequest,
  ConfirmStripePaymentRequest,
  ListPaymentsRequest,
  PaymentResponse,
  StripePaymentResponse,
  PaymentDifferentiation,
  SplitPaymentResponse,
  PaymentSessionResponse,
  CreateRefundRequest,
  ProcessStripeRefundRequest,
  ListRefundsRequest,
  RefundResponse,
  PaymentFormState,
  PaymentFormErrors,
} from './payment.types';

export {
  PaymentMethodNumber,
  PosPaymentMethodToBackend,
  PaymentMethodNumberToString,
  PaymentMethodStringToNumber,
} from './payment.types';

// Re-export product types (CRUD de productos)
export type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ListProductsRequest,
  ProductResponse,
  CreateProductResponse,
  GetProductResponse,
  UpdateProductResponse,
  ListProductsResponse,
  ProductTableFilters,
  ProductTableItem,
  ProductTableProps,
  ProductSearchBarProps,
  ProductPaginationProps,
  ProductFormErrors,
  ProductFormData,
  ProductEditFormData,
} from './product.types';

// Re-export menu item types (CRUD de platillos)
export type {
  MenuItem,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  ListMenuItemsRequest,
  MenuItemResponse,
  CreateMenuItemResponse,
  GetMenuItemResponse,
  UpdateMenuItemResponse,
  ListMenuItemsResponse,
  MenuItemTableFilters,
  MenuItemTableItem,
  MenuItemTableProps,
  MenuItemSearchBarProps,
  MenuItemPaginationProps,
  MenuItemFormErrors,
  MenuItemFormData,
  MenuItemEditFormData,
} from './menu-item.types';

// Re-export menu category types (CRUD de categorías)
export type {
  MenuCategory,
  CreateMenuCategoryRequest,
  UpdateMenuCategoryRequest,
  ListMenuCategoriesRequest,
  MenuCategoryResponse,
  CreateMenuCategoryResponse,
  GetMenuCategoryResponse,
  UpdateMenuCategoryResponse,
  ListMenuCategoriesResponse,
  MenuCategoryTableFilters,
  MenuCategoryTableItem,
  MenuCategoryTableProps,
  MenuCategorySearchBarProps,
  MenuCategoryPaginationProps,
  MenuCategoryFormErrors,
  MenuCategoryFormData,
  MenuCategoryEditFormData,
  CategorySelectOption,
} from './menu-category.types';

// Re-export table types (CRUD de mesas)
export type {
  CreateTableRequest,
  UpdateTableRequest,
  ListTablesRequest,
  TableResponse,
  CreateTableResponse,
  GetTableResponse,
  UpdateTableResponse,
  ListTablesResponse,
  TableFormData,
  TableEditFormData,
  AvailableTableOption,
  TableForOrder,
  TableStatusInfo,
  TableTableItem,
  TableFormErrors,
} from './table.types';

// Re-export WebSocket types (Notificaciones en tiempo real)
export type {
  WebSocketMessage,
  OrderNotificationData,
  OrderNotificationOrderData,
  PaymentNotificationData,
  WebSocketErrorData,
  ConnectionAckData,
  UseWebSocketOptions,
  UseWebSocketReturn,
  RegisterConnectionPayload,
} from './websocket.types';

export { WebSocketEventType } from './websocket.types';

// Re-export ticket types (impresión kitchen-ticket / sale-ticket)
export type {
  KitchenTicketExtraItem,
  KitchenTicketOrderItem,
  KitchenTicketResponse,
  SaleTicketExtraItem,
  SaleTicketOrderItem,
  SaleTicketResponse,
} from './ticket.types';

// Re-export report types (GET /api/reports)
export type {
  ReportType,
  ReportFilters,
  BaseReportResponse,
  CashFlowReportData,
  SalesPerformanceReportData,
  ExpenseCategoryData,
  ExpenseAnalysisReportData,
  ReportsApiResponse,
  GenerateReportParams,
} from './report.types';

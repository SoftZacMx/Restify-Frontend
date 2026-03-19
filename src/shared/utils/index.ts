import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utilidad para combinar clases de Tailwind
 * Evita conflictos de clases usando tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Export user utilities
export {
  getRoleLabel,
  getStatusLabel,
  getFullName,
  formatDate,
  formatUserForTable,
  formatUsersForTable,
} from './user.utils';

// Export toast utilities
export {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showLoadingToast,
} from './toast';

// Export product utilities
export {
  formatProductsForTable,
} from './product.utils';

// Export menu item utilities
export {
  formatMenuItemsForTable,
} from './menu-item.utils';

// Export expense utilities
export {
  getExpenseTypeLabel,
  getExpenseTypeBadgeColor,
  getPaymentMethodLabel,
  getUnitOfMeasureLabel,
  formatExpenseForTable,
  formatExpensesForTable,
  formatCurrency,
  formatExpenseDate,
} from './expense.utils';

// Export menu category utilities
export {
  formatCategoryForTable,
  formatCategoriesForTable,
} from './menu-category.utils';

// Export table utilities
export {
  formatTableForDisplay,
  formatTablesForDisplay,
  getTableStatusInfo,
  validateTableName,
  getStatusBadgeClasses,
  getAvailabilityBadgeClasses,
} from './table.utils';

// Export order utilities
export {
  getOrderStatusInfo,
  getPaymentMethodName,
  getPaymentMethodIcon,
  formatOrderNumber,
  formatOrderDate,
  formatOrderTime,
  formatOrderDateTime,
  formatOrderForDisplay,
  formatOrdersForDisplay,
  countOrderItems,
  getOrderLocationDisplay,
  defaultOrderFilters,
  convertViewFiltersToApiFilters,
  filterOrdersClient,
} from './order.utils';
export type { OrderStatusInfo, OrderTableItem, OrderViewFilters } from './order.utils';

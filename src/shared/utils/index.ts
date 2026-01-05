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

// Export expense utilities
export {
  getExpenseTypeLabel,
  getExpenseTypeBadgeColor,
  getPaymentMethodLabel,
  formatExpenseForTable,
  formatExpensesForTable,
  formatCurrency,
  formatExpenseDate,
} from './expense.utils';


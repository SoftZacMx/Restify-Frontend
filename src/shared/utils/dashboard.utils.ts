import type { DashboardOrderSummary } from '@/domain/types';

export function getInitials(name: string, lastName: string): string {
  return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function formatOrderTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

export function getOrderStatusLabel(order: DashboardOrderSummary): string {
  if (order.status && order.delivered) return 'Completado';
  if (order.status) return 'Pagado';
  return 'Pendiente';
}

export function getOrderStatusStyle(order: DashboardOrderSummary): string {
  if (order.status && order.delivered)
    return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
  if (order.status) return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
  return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
}

export function getTableDisplay(order: DashboardOrderSummary): string {
  if (order.tableName != null && order.tableName !== '') return `Mesa ${order.tableName}`;
  return order.origin === 'local' ? 'Local' : order.origin || 'Sin mesa';
}

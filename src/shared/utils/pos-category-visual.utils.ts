import type { Category } from '@/domain/types';

/** Paleta cíclica de tokens del sistema de diseño para diferenciar categorías visualmente (placeholders de producto). */
export const CATEGORY_COLORS = [
  { bg: 'bg-chart-1/15', text: 'text-chart-1' },
  { bg: 'bg-chart-2/15', text: 'text-chart-2' },
  { bg: 'bg-chart-3/15', text: 'text-chart-3' },
  { bg: 'bg-chart-4/15', text: 'text-chart-4' },
  { bg: 'bg-chart-5/15', text: 'text-chart-5' },
  { bg: 'bg-chart-6/15', text: 'text-chart-6' },
];

/** Color (bg/text) asignado a una categoría por su posición en la lista. */
export function getCategoryColor(categoryId: string | undefined, categories: Category[]) {
  const index = categories.findIndex((c) => c.id === categoryId);
  return CATEGORY_COLORS[index >= 0 ? index % CATEGORY_COLORS.length : 0];
}

/** Ícono (emoji) configurado para una categoría, si tiene uno asignado. */
export function getCategoryIcon(categoryId: string | undefined, categories: Category[]): string | undefined {
  return categories.find((c) => c.id === categoryId)?.icon;
}

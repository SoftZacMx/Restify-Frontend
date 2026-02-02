import type { MenuCategoryResponse, MenuCategoryTableItem } from '@/domain/types';

/**
 * Formatea una categoría para mostrar en la tabla
 */
export const formatCategoryForTable = (category: MenuCategoryResponse): MenuCategoryTableItem => {
  return {
    id: category.id,
    name: category.name,
    status: category.status,
    statusLabel: category.status ? 'Activa' : 'Inactiva',
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
};

/**
 * Formatea una lista de categorías para mostrar en la tabla
 */
export const formatCategoriesForTable = (categories: MenuCategoryResponse[]): MenuCategoryTableItem[] => {
  return categories.map(formatCategoryForTable);
};

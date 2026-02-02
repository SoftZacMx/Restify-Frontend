import type { MenuItemResponse, MenuItemTableItem } from '@/domain/types';

/**
 * Convierte platillos de la API al formato de tabla
 */
export const formatMenuItemsForTable = (menuItems: MenuItemResponse[]): MenuItemTableItem[] => {
  return menuItems.map((menuItem) => ({
    id: menuItem.id,
    name: menuItem.name,
    price: menuItem.price,
    status: menuItem.status,
    statusLabel: menuItem.status ? 'Activo' : 'Inactivo',
    isExtra: menuItem.isExtra,
    isExtraLabel: menuItem.isExtra ? 'Sí' : 'No',
    categoryId: menuItem.categoryId,
    createdAt: menuItem.createdAt,
    updatedAt: menuItem.updatedAt,
    userId: menuItem.userId,
  }));
};

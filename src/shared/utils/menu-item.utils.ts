import type {
  MenuItemResponse,
  MenuItemTableItem,
  MenuItemStockMode,
} from '@/domain/types';

/**
 * Deriva el modo de tracking de stock de un MenuItem.
 * - "direct" → vinculado a un producto único.
 * - "recipe" → tiene ingredientes cargados.
 * - "none"   → no descuenta stock al venderse.
 */
export const getMenuItemStockMode = (
  menuItem: Pick<MenuItemResponse, 'productId' | 'hasRecipe'>
): MenuItemStockMode => {
  if (menuItem.productId) return 'direct';
  if (menuItem.hasRecipe) return 'recipe';
  return 'none';
};

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
    stockMode: getMenuItemStockMode(menuItem),
  }));
};

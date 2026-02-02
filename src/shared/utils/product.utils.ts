import type { ProductResponse, ProductTableItem } from '@/domain/types';

/**
 * Convierte productos de la API al formato de tabla
 */
export const formatProductsForTable = (products: ProductResponse[]): ProductTableItem[] => {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    status: product.status,
    statusLabel: product.status ? 'Activo' : 'Inactivo',
    registrationDate: product.registrationDate,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    userId: product.userId,
  }));
};

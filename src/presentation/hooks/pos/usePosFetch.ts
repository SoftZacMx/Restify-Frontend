import { useState, useEffect, useMemo } from 'react';
import type {
  PosProduct,
  Table,
  Category,
  MenuCategoryResponse,
} from '@/domain/types';
import { menuItemService, tableService, menuCategoryService } from '@/application/services';
import { mapMenuItemToPosProduct, mapTableResponseToTable } from './pos.mappers';

interface UsePosFetchOptions {
  currentOrderId?: string;
}

/**
 * Hook para cargar datos del backend necesarios para el POS:
 * productos, mesas y categorías.
 */
export const usePosFetch = (options?: UsePosFetchOptions) => {
  const { currentOrderId } = options || {};

  // Productos
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Mesas
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [tablesError, setTablesError] = useState<string | null>(null);

  // Categorías
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      setProductsError(null);
      try {
        const menuItems = await menuItemService.listMenuItems();
        const posProducts = menuItems.map(mapMenuItemToPosProduct);
        setProducts(posProducts);
      } catch {
        setProductsError('No se pudieron cargar los productos');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      setCategoriesError(null);
      try {
        const menuCategories = await menuCategoryService.listMenuCategories({ status: true });
        const filteredCategories = menuCategories.filter(
          (cat: MenuCategoryResponse) => cat.name?.toLowerCase() !== 'extras'
        );
        const posCategories: Category[] = filteredCategories.map((cat: MenuCategoryResponse) => ({
          id: cat.id,
          name: cat.name,
          description: '',
          icon: undefined,
        }));
        setCategories(posCategories);
      } catch {
        setCategoriesError('No se pudieron cargar las categorías');
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadTables = async () => {
      setIsLoadingTables(true);
      setTablesError(null);
      try {
        const isEditingOrder = !!currentOrderId;
        const tablesResponse = isEditingOrder
          ? await tableService.listTables({ status: true })
          : await tableService.listTables({ status: true, availabilityStatus: true });
        const posTables = tablesResponse.map(mapTableResponseToTable);
        setTables(posTables);
      } catch {
        setTablesError('No se pudieron cargar las mesas');
      } finally {
        setIsLoadingTables(false);
      }
    };

    loadTables();
  }, [currentOrderId]);

  // Productos extras disponibles
  const availableExtras = useMemo(() => {
    return products.filter((product) => product.status && product.isExtra);
  }, [products]);

  return {
    products,
    isLoadingProducts,
    productsError,
    availableExtras,
    tables,
    isLoadingTables,
    tablesError,
    categories,
    isLoadingCategories,
    categoriesError,
  };
};

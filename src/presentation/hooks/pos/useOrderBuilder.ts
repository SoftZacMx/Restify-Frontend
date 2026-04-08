import { useState, useCallback, useMemo } from 'react';
import type {
  OrderType,
  OrderItem,
  PosProduct,
  CartState,
  PaymentState,
  Table,
  PosMode,
} from '@/domain/types';
import { orderService } from '@/application/services';

interface UseOrderBuilderOptions {
  posMode: PosMode;
  tables: Table[];
}

/**
 * Hook para gestionar la construcción de la orden:
 * tipo de orden, mesa, cliente, carrito, filtros y diálogo de extras.
 */
export const useOrderBuilder = ({ posMode, tables }: UseOrderBuilderOptions) => {
  // Tipo de orden
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>('');

  // Carrito
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);

  // Filtros de productos
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');

  // Diálogo de extras
  const [isExtrasDialogOpen, setIsExtrasDialogOpen] = useState(false);
  const [selectedProductForExtras, setSelectedProductForExtras] = useState<PosProduct | null>(null);

  // Estado del carrito calculado
  const cartState: CartState = useMemo(() => {
    return orderService.calculateCartState(cartItems);
  }, [cartItems]);

  // Mesa seleccionada
  const selectedTable: Table | undefined = useMemo(() => {
    if (!selectedTableId) return undefined;
    return tables.find((table) => table.id === selectedTableId);
  }, [selectedTableId, tables]);

  // Handlers de tipo de orden
  const handleOrderTypeChange = useCallback(
    (type: OrderType | null) => {
      if (posMode !== 'ORDER_BUILDING') return;
      setOrderType(type);
      if (type === 'DINE_IN') {
        setCustomerName('');
      } else if (type === 'TAKEOUT') {
        setSelectedTableId(null);
      }
    },
    [posMode]
  );

  const handleTableSelect = useCallback(
    (tableId: string | null) => {
      if (posMode !== 'ORDER_BUILDING') return;
      setSelectedTableId(tableId);
    },
    [posMode]
  );

  const handleCustomerNameChange = useCallback(
    (name: string) => {
      if (posMode !== 'ORDER_BUILDING') return;
      setCustomerName(name);
    },
    [posMode]
  );

  // Handlers de filtros
  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  }, []);

  // Productos filtrados
  const getFilteredProducts = useCallback(
    (products: PosProduct[]) => {
      const regularProducts = products.filter(
        (product) => product.status === true && product.isExtra !== true
      );
      const byCategory = selectedCategoryId
        ? regularProducts.filter((product) => product.categoryId === selectedCategoryId)
        : regularProducts;
      const query = productSearch.trim().toLowerCase();
      if (!query) return byCategory;
      return byCategory.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          (product.description ?? '').toLowerCase().includes(query)
      );
    },
    [selectedCategoryId, productSearch]
  );

  // Handlers de productos / carrito
  const handleProductSelect = useCallback(
    (product: PosProduct) => {
      if (posMode !== 'ORDER_BUILDING') return;
      setSelectedProductForExtras(product);
      setIsExtrasDialogOpen(true);
    },
    [posMode]
  );

  const handleAddProductToCart = useCallback(
    (product: PosProduct, quantity: number, selectedExtras: PosProduct[], note?: string | null) => {
      const newItems = orderService.addItemToCart(cartItems, product, quantity, selectedExtras, note);
      setCartItems(newItems);
      setIsExtrasDialogOpen(false);
      setSelectedProductForExtras(null);
    },
    [cartItems]
  );

  const handleUpdateItemQuantity = useCallback(
    (itemId: string, newQuantity: number) => {
      const updatedItems = orderService.updateItemQuantity(cartItems, itemId, newQuantity);
      setCartItems(updatedItems);
    },
    [cartItems]
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      const updatedItems = orderService.removeItemFromCart(cartItems, itemId);
      setCartItems(updatedItems);
    },
    [cartItems]
  );

  // Validar orden
  const validateOrder = useCallback(
    (paymentState: PaymentState) => {
      return orderService.validateOrder(
        orderType,
        selectedTableId,
        customerName,
        cartItems,
        paymentState,
        posMode
      );
    },
    [orderType, selectedTableId, customerName, cartItems, posMode]
  );

  // Poblar estado desde una orden existente
  const populateFromOrder = useCallback((order: {
    tableId?: string | null;
    client?: string | null;
    orderItems?: Array<unknown>;
    paymentMethod?: number | null;
  }, mappedCartItems: OrderItem[]) => {
    if (order.tableId) {
      setOrderType('DINE_IN');
      setSelectedTableId(order.tableId);
    } else {
      setOrderType('TAKEOUT');
      setSelectedTableId(null);
    }
    if (order.client) {
      setCustomerName(order.client);
    }
    setCartItems(mappedCartItems);
  }, []);

  // Reset
  const resetOrderBuilder = useCallback(() => {
    setOrderType(null);
    setSelectedTableId(null);
    setCustomerName('');
    setCartItems([]);
    setSelectedCategoryId(null);
    setProductSearch('');
    setIsExtrasDialogOpen(false);
    setSelectedProductForExtras(null);
  }, []);

  return {
    orderType,
    selectedTableId,
    selectedTable,
    customerName,
    cartItems,
    setCartItems,
    cartState,
    selectedCategoryId,
    productSearch,
    setProductSearch,
    isExtrasDialogOpen,
    setIsExtrasDialogOpen,
    selectedProductForExtras,
    getFilteredProducts,
    handleOrderTypeChange,
    handleTableSelect,
    handleCustomerNameChange,
    handleCategorySelect,
    handleProductSelect,
    handleAddProductToCart,
    handleUpdateItemQuantity,
    handleRemoveItem,
    validateOrder,
    populateFromOrder,
    resetOrderBuilder,
  };
};

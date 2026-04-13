import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicMenuRepository } from '@/infrastructure/api/repositories/public-menu.repository';
import type { PosProduct, Category, OrderItem } from '@/domain/types';

let nextCartItemId = 1;

export function usePublicMenu() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-menu'],
    queryFn: () => publicMenuRepository.getMenu(),
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<PosProduct | null>(null);
  const [isExtrasDialogOpen, setIsExtrasDialogOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Mapear datos del backend a tipos del POS
  const categories: Category[] = useMemo(() => {
    if (!data) return [];
    return data.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
    }));
  }, [data]);

  const allProducts: PosProduct[] = useMemo(() => {
    if (!data) return [];
    return data.categories.flatMap((cat) =>
      cat.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        categoryId: cat.id,
        description: null,
        status: true,
      }))
    );
  }, [data]);

  const availableExtras: PosProduct[] = useMemo(() => {
    if (!data) return [];
    return data.extras.map((extra) => ({
      id: extra.id,
      name: extra.name,
      price: extra.price,
      categoryId: '',
      description: null,
      status: true,
      isExtra: true,
    }));
  }, [data]);

  const filteredProducts = useMemo(() => {
    let products = allProducts;
    if (selectedCategoryId) {
      products = products.filter((p) => p.categoryId === selectedCategoryId);
    }
    if (productSearch.trim()) {
      const q = productSearch.trim().toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(q));
    }
    return products;
  }, [allProducts, selectedCategoryId, productSearch]);

  const handleProductSelect = useCallback((product: PosProduct) => {
    setSelectedProduct(product);
    setIsExtrasDialogOpen(true);
  }, []);

  const handleAddToCart = useCallback(
    (product: PosProduct, quantity: number, selectedExtras: PosProduct[], note?: string | null) => {
      const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
      const itemSubtotal = product.price * quantity;
      const itemTotal = (product.price + extrasTotal) * quantity;

      const newItem: OrderItem = {
        id: `cart-${nextCartItemId++}`,
        productId: product.id,
        product,
        quantity,
        basePrice: product.price,
        selectedExtras,
        extrasTotal,
        itemSubtotal,
        itemTotal,
        note: note || undefined,
      };

      setCartItems((prev) => [...prev, newItem]);
    },
    []
  );

  const handleRemoveItem = useCallback((itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const cartState = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.itemSubtotal, 0);
    const extrasTotal = cartItems.reduce((sum, item) => sum + item.extrasTotal * item.quantity, 0);
    const total = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);
    return { subtotal, tax: 0, total, extrasTotal };
  }, [cartItems]);

  return {
    // Data
    categories,
    filteredProducts,
    availableExtras,
    cartItems,
    cartState,
    isLoading,
    error: error ? (error as Error).message : null,
    // State
    selectedCategoryId,
    productSearch,
    selectedProduct,
    isExtrasDialogOpen,
    // Handlers
    setSelectedCategoryId,
    setProductSearch,
    handleProductSelect,
    handleAddToCart,
    handleRemoveItem,
    setIsExtrasDialogOpen,
  };
}

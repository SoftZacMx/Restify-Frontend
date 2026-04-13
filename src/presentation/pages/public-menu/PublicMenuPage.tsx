import { useState } from 'react';
import { ShoppingCart, X, Search } from 'lucide-react';
import { PublicLayout } from '@/presentation/components/layouts/PublicLayout';
import { CategoryFilter } from '@/presentation/components/pos/CategoryFilter';
import { ProductGrid } from '@/presentation/components/pos/ProductGrid';
import { ProductExtrasDialog } from '@/presentation/components/pos/ProductExtrasDialog';
import { Cart } from '@/presentation/components/pos/Cart';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { usePublicMenu } from '@/presentation/hooks/usePublicMenu';
import { useNavigate } from 'react-router-dom';

const PublicMenuPage = () => {
  const navigate = useNavigate();
  const {
    categories,
    filteredProducts,
    availableExtras,
    cartItems,
    cartState,
    isLoading,
    error,
    selectedCategoryId,
    productSearch,
    selectedProduct,
    isExtrasDialogOpen,
    setSelectedCategoryId,
    setProductSearch,
    handleProductSelect,
    handleAddToCart,
    handleRemoveItem,
    setIsExtrasDialogOpen,
  } = usePublicMenu();

  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);

  const handleCheckout = () => {
    navigate('/public/checkout', {
      state: { cartItems, cartTotal: cartState.total },
    });
  };

  return (
    <PublicLayout>
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            type="search"
            placeholder="Buscar en el menú..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="pl-10 h-11 bg-white dark:bg-slate-800"
          />
        </div>

        {/* Categories */}
        <CategoryFilter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={setSelectedCategoryId}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2">
            <ProductGrid
              products={filteredProducts}
              onProductSelect={handleProductSelect}
              isLoading={isLoading}
              error={error}
            />
          </div>

          {/* Cart — desktop only */}
          <div className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <Cart
                items={cartItems}
                onRemoveItem={handleRemoveItem}
              />
              {cartItems.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
                    <span className="text-xl font-bold text-primary">
                      ${cartState.total.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    className="w-full h-12 text-base font-semibold"
                    size="lg"
                  >
                    Continuar al pago
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating cart button — mobile */}
      {cartItems.length > 0 && (
        <button
          type="button"
          onClick={() => setIsCartSheetOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="font-semibold">{cartItems.length}</span>
          <span className="text-sm opacity-90">— ${cartState.total.toFixed(2)}</span>
        </button>
      )}

      {/* Cart bottom sheet — mobile */}
      {isCartSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsCartSheetOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  Carrito ({cartItems.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCartSheetOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <Cart
                items={cartItems}
                onRemoveItem={handleRemoveItem}
              />
              {cartItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
                    <span className="text-xl font-bold text-primary">
                      ${cartState.total.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      setIsCartSheetOpen(false);
                      handleCheckout();
                    }}
                    className="w-full h-12 text-base font-semibold"
                    size="lg"
                  >
                    Continuar al pago
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Extras dialog */}
      <ProductExtrasDialog
        open={isExtrasDialogOpen}
        onOpenChange={setIsExtrasDialogOpen}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        availableExtras={availableExtras}
        categories={categories}
      />
    </PublicLayout>
  );
};

export default PublicMenuPage;

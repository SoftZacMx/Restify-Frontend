import type {
  PosProduct,
  Table,
  OrderItem,
  MenuItemResponse,
  TableResponse,
  OrderItemResponse,
} from '@/domain/types';

/**
 * Convierte un MenuItemResponse del backend al formato PosProduct
 */
export const mapMenuItemToPosProduct = (menuItem: MenuItemResponse): PosProduct => ({
  id: menuItem.id,
  name: menuItem.name,
  description: '',
  price: menuItem.price,
  categoryId: menuItem.categoryId || '',
  status: menuItem.status,
  isExtra: menuItem.isExtra ?? false,
});

/**
 * Convierte un TableResponse del backend al formato Table del POS
 */
export const mapTableResponseToTable = (tableResponse: TableResponse): Table => ({
  id: tableResponse.id,
  name: tableResponse.name,
  capacity: 4,
  isAvailable: tableResponse.status && tableResponse.availabilityStatus,
  location: undefined,
});

/**
 * Convierte un OrderItemResponse del backend al formato OrderItem del carrito POS
 */
export const mapOrderItemResponseToOrderItem = (
  orderItemResponse: OrderItemResponse,
  products: PosProduct[]
): OrderItem | null => {
  const productId = orderItemResponse.menuItemId || orderItemResponse.productId;
  if (!productId) return null;

  let product = products.find(p => p.id === productId);

  if (!product) {
    if (orderItemResponse.menuItem) {
      product = mapMenuItemToPosProduct(orderItemResponse.menuItem);
    } else if (orderItemResponse.product) {
      product = {
        id: orderItemResponse.product.id,
        name: orderItemResponse.product.name,
        description: '',
        price: orderItemResponse.price,
        categoryId: '',
        status: true,
        isExtra: false,
      };
    } else {
      product = {
        id: productId,
        name: `Producto ${productId.substring(0, 8)}...`,
        description: '',
        price: orderItemResponse.price,
        categoryId: '',
        status: true,
        isExtra: false,
      };
    }
  }

  const selectedExtras: PosProduct[] = [];
  let extrasTotal = 0;

  if (orderItemResponse.extras && orderItemResponse.extras.length > 0) {
    orderItemResponse.extras.forEach(extra => {
      const extraProduct = products.find(p => p.id === extra.extraId);
      if (extraProduct) {
        for (let i = 0; i < extra.quantity; i++) {
          selectedExtras.push(extraProduct);
          extrasTotal += extra.price;
        }
      } else {
        const extraPlaceholder: PosProduct = {
          id: extra.extraId,
          name: extra.extra?.name || `Extra ${extra.extraId.substring(0, 8)}...`,
          description: '',
          price: extra.price,
          categoryId: '',
          status: true,
          isExtra: true,
        };
        for (let i = 0; i < extra.quantity; i++) {
          selectedExtras.push(extraPlaceholder);
          extrasTotal += extra.price;
        }
      }
    });
  }

  const basePrice = orderItemResponse.price;
  const quantity = orderItemResponse.quantity;
  const itemSubtotal = (basePrice + extrasTotal) * quantity;
  const itemTotal = itemSubtotal;

  return {
    id: orderItemResponse.id,
    productId: productId,
    menuItemId: orderItemResponse.menuItemId || undefined,
    product,
    quantity,
    basePrice,
    selectedExtras,
    extrasTotal,
    itemSubtotal,
    itemTotal,
    note: orderItemResponse.note || undefined,
  };
};

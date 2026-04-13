import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Loader2 } from 'lucide-react';
import { PublicLayout } from '@/presentation/components/layouts/PublicLayout';
import { Cart } from '@/presentation/components/pos/Cart';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { DeliveryMap } from '@/presentation/components/map/DeliveryMap';
import { publicOrderRepository } from '@/infrastructure/api/repositories/public-order.repository';
import type { OrderItem } from '@/domain/types';
import { showErrorToast } from '@/shared/utils/toast';

type OrderType = 'DELIVERY' | 'PICKUP';

const PublicCheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const cartItems: OrderItem[] = location.state?.cartItems || [];
  const cartTotal: number = location.state?.cartTotal || 0;

  // Si no hay items, volver al menú
  if (cartItems.length === 0) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            No hay items en el carrito
          </p>
          <Button onClick={() => navigate('/public/menu')}>
            Volver al menú
          </Button>
        </div>
      </PublicLayout>
    );
  }

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const isFormValid = () => {
    if (!customerName.trim() || !customerPhone.trim() || !orderType) return false;
    if (orderType === 'DELIVERY' && !deliveryAddress.trim()) return false;
    return true;
  };

  const handlePayWithMP = async () => {
    if (!isFormValid() || !orderType) return;

    setIsSubmitting(true);
    try {
      // 1. Crear la orden
      const items = cartItems.map((item) => ({
        menuItemId: item.productId,
        quantity: item.quantity,
        note: item.note || null,
        extras: item.selectedExtras.length > 0
          ? item.selectedExtras.map((extra) => ({ extraId: extra.id, quantity: 1 }))
          : undefined,
      }));

      const order = await publicOrderRepository.createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        orderType,
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress.trim() : null,
        latitude: orderType === 'DELIVERY' ? latitude : null,
        longitude: orderType === 'DELIVERY' ? longitude : null,
        scheduledAt: orderType === 'PICKUP' && scheduledAt ? new Date(scheduledAt).toISOString() : null,
        items,
      });

      // 2. Guardar trackingToken antes de cualquier redirect
      localStorage.setItem('publicOrderTrackingToken', order.trackingToken);

      // 3. Iniciar pago con MP
      const payment = await publicOrderRepository.payOrder(order.id);

      // 4. Redirigir a MP
      window.location.href = payment.initPoint;
    } catch (error) {
      console.error('Error al procesar pedido:', error);
      const message = error instanceof Error ? error.message : 'No se pudo procesar el pedido';
      showErrorToast('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="space-y-6">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate('/public/menu')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al menú
        </button>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Checkout
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="space-y-6">
            {/* Customer info */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Datos del cliente
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    placeholder="Tu nombre"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    maxLength={200}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ej: 5512345678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    maxLength={13}
                  />
                </div>
              </div>
            </div>

            {/* Order type */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Tipo de pedido *
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType('DELIVERY')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    orderType === 'DELIVERY'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <MapPin className="h-6 w-6" />
                  <span className="font-medium text-sm">Domicilio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('PICKUP')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    orderType === 'PICKUP'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Clock className="h-6 w-6" />
                  <span className="font-medium text-sm">Recoger en local</span>
                </button>
              </div>
            </div>

            {/* Delivery: map + address */}
            {orderType === 'DELIVERY' && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Dirección de entrega
                </h3>
                <DeliveryMap onLocationSelect={handleLocationSelect} />
                <div>
                  <Label htmlFor="address">Dirección / Referencia *</Label>
                  <Input
                    id="address"
                    placeholder="Ej: Av. Principal 123, Col. Centro"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    maxLength={500}
                  />
                </div>
                {latitude && longitude && (
                  <p className="text-xs text-slate-400">
                    Ubicación: {latitude.toFixed(5)}, {longitude.toFixed(5)}
                  </p>
                )}
              </div>
            )}

            {/* Pickup: scheduled time */}
            {orderType === 'PICKUP' && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Hora de recolección
                </h3>
                <div>
                  <Label htmlFor="scheduledAt">Fecha y hora (opcional)</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Si no seleccionas hora, el pedido será para lo antes posible.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order summary */}
          <div className="space-y-4">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Resumen del pedido
                </h3>
                <Cart items={cartItems} onRemoveItem={() => {}} readOnly />
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
                    <span className="text-xl font-bold text-primary">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePayWithMP}
                disabled={!isFormValid() || isSubmitting}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Pagar con Mercado Pago'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PublicCheckoutPage;

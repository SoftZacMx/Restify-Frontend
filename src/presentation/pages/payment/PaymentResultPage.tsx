import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { publicOrderRepository } from '@/infrastructure/api/repositories/public-order.repository';

type PaymentResultStatus = 'success' | 'failure' | 'pending';

const config: Record<PaymentResultStatus, { icon: React.ReactNode; title: string; description: string; bg: string }> = {
  success: {
    icon: <CheckCircle className="w-12 h-12 text-green-500" />,
    title: 'Pago Exitoso',
    description: 'Tu pago se ha procesado correctamente. Puedes cerrar esta ventana.',
    bg: 'bg-green-100 dark:bg-green-900/30',
  },
  failure: {
    icon: <XCircle className="w-12 h-12 text-red-500" />,
    title: 'Pago Fallido',
    description: 'No se pudo procesar tu pago. Intenta de nuevo o usa otro método de pago.',
    bg: 'bg-red-100 dark:bg-red-900/30',
  },
  pending: {
    icon: <Clock className="w-12 h-12 text-amber-500" />,
    title: 'Pago Pendiente',
    description: 'Tu pago está siendo procesado. Recibirás la confirmación en breve.',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
};

const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const statusParam = searchParams.get('status') as PaymentResultStatus | null;
  const status: PaymentResultStatus = statusParam && config[statusParam] ? statusParam : 'success';
  const { icon, title, description, bg } = config[status];

  // Redirigir al seguimiento del pedido público tras volver de Mercado Pago. El fallback
  // cubre el caso de que se pierda el localStorage (MP abre su webview con storage aparte).
  useEffect(() => {
    let cancelled = false;

    const trackingToken = localStorage.getItem('publicOrderTrackingToken');
    if (trackingToken) {
      localStorage.removeItem('publicOrderTrackingToken');
      navigate(`/public/pedido/${trackingToken}`, { replace: true });
      return;
    }

    // external_reference viene como "checkout:checkoutId:branchId" (flujo diferido) o
    // "orderId:branchId" / "orderId" (legacy).
    const parts = searchParams.get('external_reference')?.split(':') ?? [];
    const isCheckout = parts[0] === 'checkout';
    const id = isCheckout ? parts[1] : parts[0];
    if (!id) return;

    const lookup = isCheckout
      ? publicOrderRepository.getOrderStatusByCheckoutId(id)
      : publicOrderRepository.getOrderStatusByOrderId(id);

    lookup
      .then((order) => {
        if (!cancelled && order.trackingToken) {
          navigate(`/public/pedido/${order.trackingToken}`, { replace: true });
        }
      })
      .catch(() => {
        // Si no se puede resolver (orden no pública, no existe, etc.) se queda en esta
        // pantalla de resultado, que ya informa el estado del pago.
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-sm text-center">
        <div className={`w-24 h-24 rounded-full ${bg} flex items-center justify-center mx-auto mb-6`}>
          {icon}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          {description}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Restify
        </p>
      </div>
    </div>
  );
};

export default PaymentResultPage;

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

  // Redirigir al seguimiento del pedido público tras volver de Mercado Pago.
  // 1) Ruta rápida: trackingToken guardado en localStorage antes de ir a MP.
  // 2) Fallback: si el localStorage se perdió (MP abrió su webview con storage aparte),
  //    usar el orderId del external_reference ("orderId:branchId") que MP devuelve en la
  //    query y resolver el trackingToken vía backend.
  useEffect(() => {
    let cancelled = false;

    const trackingToken = localStorage.getItem('publicOrderTrackingToken');
    if (trackingToken) {
      localStorage.removeItem('publicOrderTrackingToken');
      navigate(`/public/pedido/${trackingToken}`, { replace: true });
      return;
    }

    // external_reference viene como:
    //  - "checkout:checkoutId:branchId" (flujo nuevo): la orden puede no existir aún y no
    //    hay forma de resolver el trackingToken por orderId → se queda en esta pantalla,
    //    que ya informa el estado del pago (el caso normal usa el trackingToken de arriba).
    //  - "orderId:branchId" o "orderId" (flujo legacy): se resuelve el trackingToken por orderId.
    const externalReference = searchParams.get('external_reference');
    const parts = externalReference?.split(':') ?? [];
    if (parts[0] === 'checkout') return;
    const orderId = parts[0];
    if (!orderId) return;

    publicOrderRepository
      .getOrderStatusByOrderId(orderId)
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
          BizFlow
        </p>
      </div>
    </div>
  );
};

export default PaymentResultPage;

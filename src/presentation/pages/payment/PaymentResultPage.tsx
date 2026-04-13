import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

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

  // Si hay un trackingToken de pedido público, redirigir a la página de seguimiento
  useEffect(() => {
    const trackingToken = localStorage.getItem('publicOrderTrackingToken');
    if (trackingToken) {
      localStorage.removeItem('publicOrderTrackingToken');
      navigate(`/public/pedido/${trackingToken}`, { replace: true });
    }
  }, [navigate]);

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

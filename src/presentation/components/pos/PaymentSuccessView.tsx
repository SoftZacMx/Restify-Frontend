import React, { useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { getPaymentMethodName } from '@/shared/utils/order.utils';

export interface PaymentSuccessData {
  orderId: string;
  date: string;
  total: number;
  paymentMethod: number | null;
  companyName?: string;
}

interface PaymentSuccessViewProps {
  data: PaymentSuccessData;
  onRedirect: () => void;
}

export const PaymentSuccessView: React.FC<PaymentSuccessViewProps> = ({
  data,
  onRedirect,
}) => {
  useEffect(() => {
    const timer = setTimeout(onRedirect, 3000);
    return () => clearTimeout(timer);
  }, [onRedirect]);

  const orderShortId = `#${data.orderId.slice(-8).toUpperCase()}`;
  const dateObj = new Date(data.date);
  const formattedDate = dateObj.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      {/* Success icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center ring-4 ring-green-50 dark:ring-green-900/20">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
        Pago Exitoso
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        La transacción se ha procesado correctamente.
      </p>

      {/* Receipt card */}
      <div className="w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 mb-8 shadow-sm">
        {/* Order ID & Date */}
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Orden
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {orderShortId}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Fecha y hora
            </p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {formattedDate} &bull; {formattedTime}
            </p>
          </div>
        </div>

        {/* Payment method & Merchant */}
        <div className="flex justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Metodo de pago
            </p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {getPaymentMethodName(data.paymentMethod)}
            </p>
          </div>
          {data.companyName && (
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Comercio
              </p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {data.companyName}
              </p>
            </div>
          )}
        </div>

        {/* Divider + Total */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex items-center justify-between">
          <span className="text-base font-bold text-slate-900 dark:text-white">
            Total Pagado
          </span>
          <span className="text-2xl font-bold text-primary">
            ${data.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Redirecting indicator */}
      <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Redirigiendo a órdenes...
      </div>
    </div>
  );
};

import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { paymentService } from '@/application/services/payment.service';
import type { PaymentStatus } from '@/domain/types/payment.types';

interface QrPaymentModalProps {
  orderId: string;
  userId: string;
  total: number;
  onSuccess: () => void;
  onClose: () => void;
}

type QrState = 'loading' | 'showing' | 'polling' | 'succeeded' | 'failed' | 'error';

export const QrPaymentModal = ({ orderId, userId, total, onSuccess, onClose }: QrPaymentModalProps) => {
  const [state, setState] = useState<QrState>('loading');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Crear preferencia de pago QR
  useEffect(() => {
    const createQrPayment = async () => {
      try {
        const result = await paymentService.payWithQrMp(orderId, userId);
        setQrUrl(result.initPoint);
        setState('showing');
      } catch (err: any) {
        setError(err.message || 'Error al generar el código QR');
        setState('error');
      }
    };

    createQrPayment();
  }, [orderId, userId]);

  // Polling del estado del pago
  const pollStatus = useCallback(async () => {
    try {
      const result = await paymentService.getQrMpPaymentStatus(orderId);
      if (result.status === 'SUCCEEDED') {
        setState('succeeded');
        setTimeout(onSuccess, 1500);
      } else if (result.status === 'FAILED' || result.status === 'CANCELED') {
        setState('failed');
      }
    } catch {
      // Ignorar errores de polling
    }
  }, [orderId, onSuccess]);

  useEffect(() => {
    if (state !== 'showing') return;

    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [state, pollStatus]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Pago con QR - Mercado Pago
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center">
          {/* Loading */}
          {state === 'loading' && (
            <div className="py-12 flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-slate-500 dark:text-slate-400">Generando código QR...</p>
            </div>
          )}

          {/* QR Code */}
          {state === 'showing' && qrUrl && (
            <>
              <div className="bg-white p-4 rounded-xl mb-4">
                <QRCodeSVG
                  value={qrUrl}
                  size={250}
                  level="M"
                  includeMargin
                />
              </div>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-2">
                Escanea el código QR con tu celular para pagar
              </p>
              <p className="text-center text-2xl font-bold text-slate-900 dark:text-white mb-4">
                ${total.toFixed(2)} MXN
              </p>
              <div className="flex items-center gap-2 text-sm text-blue-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Esperando pago...
              </div>
            </>
          )}

          {/* Success */}
          {state === 'succeeded' && (
            <div className="py-8 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Pago exitoso</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Procesando orden...</p>
            </div>
          )}

          {/* Failed */}
          {state === 'failed' && (
            <div className="py-8 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Pago fallido</p>
              <Button onClick={onClose} variant="outline" className="mt-2">
                Cerrar
              </Button>
            </div>
          )}

          {/* Error */}
          {state === 'error' && (
            <div className="py-8 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Error</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">{error}</p>
              <Button onClick={onClose} variant="outline" className="mt-2">
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

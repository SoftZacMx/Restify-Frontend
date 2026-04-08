import { useState, useRef, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/application/services/payment.service';
import { ticketService } from '@/application/services/ticket.service';
import { companyService } from '@/application/services/company.service';
import { showErrorToast } from '@/shared/utils/toast';
import { usePaymentSound } from '@/presentation/hooks/usePaymentSound';
import type { PaymentSuccessData } from '@/presentation/components/pos/PaymentSuccessView';

const QR_POLLING_INTERVAL_MS = 3000;

interface UseQrPaymentFlowOptions {
  /** ID de la orden (puede venir de savedOrder o loadedOrder) */
  orderId: string | undefined;
  /** ID del usuario autenticado */
  userId: string | undefined;
  /** Fecha de la orden (para el success view) */
  orderDate: string | undefined;
  /** Total del pago */
  paymentTotal: number;
}

/**
 * Hook para el flujo completo de pago con QR de MercadoPago:
 * creación del QR, impresión del ticket, polling del estado y resultado.
 */
export const useQrPaymentFlow = ({
  orderId,
  userId,
  orderDate,
  paymentTotal,
}: UseQrPaymentFlowOptions) => {
  const queryClient = useQueryClient();
  const { playSuccess } = usePaymentSound();

  const [isProcessingQr, setIsProcessingQr] = useState(false);
  const [isWaitingQrPayment, setIsWaitingQrPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<PaymentSuccessData | null>(null);
  const qrPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (qrPollingRef.current) clearInterval(qrPollingRef.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (qrPollingRef.current) {
      clearInterval(qrPollingRef.current);
      qrPollingRef.current = null;
    }
  }, []);

  const startQrPayment = useCallback(async () => {
    if (!orderId) {
      showErrorToast('Error', 'Debes guardar la orden antes de pagar con QR');
      return;
    }
    if (!userId) {
      showErrorToast('Error', 'No se pudo obtener el usuario');
      return;
    }

    setIsProcessingQr(true);

    try {
      // 1. Crear pago QR en MP
      const qrResult = await paymentService.payWithQrMp(orderId, userId);

      // 2. Imprimir ticket con QR
      try {
        await ticketService.printSaleTicketWithQr(orderId, qrResult.initPoint);
      } catch {
        showErrorToast('Ticket no impreso', 'El QR se generó pero no se pudo imprimir el ticket');
      }

      setIsProcessingQr(false);
      setIsWaitingQrPayment(true);

      // 3. Polling cada 3 segundos
      qrPollingRef.current = setInterval(async () => {
        try {
          const status = await paymentService.getQrMpPaymentStatus(orderId);

          if (status.status === 'SUCCEEDED') {
            stopPolling();
            setIsWaitingQrPayment(false);
            playSuccess();
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['tables'] });

            const company = await companyService.getCompany().catch(() => null);
            setPaymentSuccessData({
              orderId,
              date: orderDate || new Date().toISOString(),
              total: paymentTotal,
              paymentMethod: 4,
              companyName: company?.name,
            });
          } else if (status.status === 'FAILED' || status.status === 'CANCELED') {
            stopPolling();
            setIsWaitingQrPayment(false);
            showErrorToast('Pago fallido', 'El pago QR fue rechazado o cancelado');
          }
        } catch {
          // Ignorar errores de polling
        }
      }, QR_POLLING_INTERVAL_MS);
    } catch (error: unknown) {
      setIsProcessingQr(false);
      const message = error instanceof Error ? error.message : 'No se pudo crear el pago QR';
      showErrorToast('Error al generar QR', message);
    }
  }, [orderId, userId, orderDate, paymentTotal, playSuccess, queryClient, stopPolling]);

  const cancelQrPayment = useCallback(() => {
    stopPolling();
    setIsWaitingQrPayment(false);
    setIsProcessingQr(false);
  }, [stopPolling]);

  const resetQrPayment = useCallback(() => {
    stopPolling();
    setIsProcessingQr(false);
    setIsWaitingQrPayment(false);
    setPaymentSuccessData(null);
  }, [stopPolling]);

  return {
    isProcessingQr,
    isWaitingQrPayment,
    paymentSuccessData,
    setPaymentSuccessData,
    startQrPayment,
    cancelQrPayment,
    resetQrPayment,
  };
};

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { useSubscriptionStore } from '@/presentation/store/subscription.store';
import { subscriptionService } from '@/application/services/subscription.service';

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fetchStatus = useSubscriptionStore((s) => s.fetchStatus);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState(false);

  const sessionId = searchParams.get('session_id');

  // Verificar checkout con Stripe y actualizar BD
  useEffect(() => {
    const verify = async () => {
      setIsVerifying(true);
      setVerifyError(false);

      try {
        if (sessionId) {
          await subscriptionService.verifyCheckout(sessionId);
        }
        await fetchStatus();
        setIsVerifying(false);
        setCountdown(3);
      } catch {
        setIsVerifying(false);
        setVerifyError(true);
      }
    };

    verify();
  }, [sessionId, fetchStatus]);

  // Countdown para redirect
  useEffect(() => {
    if (countdown === null) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown, navigate]);

  const handleRetry = async () => {
    setIsVerifying(true);
    setVerifyError(false);
    try {
      if (sessionId) {
        await subscriptionService.verifyCheckout(sessionId);
      }
      await fetchStatus();
      setIsVerifying(false);
      setCountdown(3);
    } catch {
      setIsVerifying(false);
      setVerifyError(true);
    }
  };

  // Loading
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Verificando pago...
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Estamos confirmando tu suscripción con Stripe.
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (verifyError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-amber-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            No se pudo verificar el pago
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Tu pago fue procesado pero no pudimos confirmar la suscripción. Intenta de nuevo o contacta soporte.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700 text-white">
              Reintentar
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Ir al dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Pago exitoso
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Tu suscripción está activa. Redirigiendo en {countdown}...
        </p>

        <Button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Ir al dashboard
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;

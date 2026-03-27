import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { useSubscriptionStore } from '@/presentation/store/subscription.store';

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const fetchStatus = useSubscriptionStore((s) => s.fetchStatus);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

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

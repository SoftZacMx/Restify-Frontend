import { useNavigate } from 'react-router-dom';
import { XCircle, LogOut } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { useAuthStore } from '@/presentation/store/auth.store';
import { useSubscriptionStore } from '@/presentation/store/subscription.store';

const SubscriptionCancelPage = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const clear = useSubscriptionStore((s) => s.clear);

  const handleRetry = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    clear();
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-orange-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          No se realizó el pago
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Puedes intentar de nuevo cuando quieras
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Elegir un plan
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancelPage;

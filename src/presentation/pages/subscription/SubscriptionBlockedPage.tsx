import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Check, LogOut, MessageCircle } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { useAuthStore } from '@/presentation/store/auth.store';
import { useSubscriptionStore } from '@/presentation/store/subscription.store';
import { subscriptionService } from '@/application/services/subscription.service';
import { showErrorToast } from '@/shared/utils/toast';
// Note: user email/name not needed - backend gets them from Company + User token

interface PlanCard {
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
}

const plans: PlanCard[] = [
  {
    name: 'Basic',
    price: '$2,950',
    features: [
      'Gestión de 1 Local',
      'Hasta 5 Usuarios',
      'Soporte por Email',
    ],
  },
];

const SubscriptionBlockedPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const clear = useSubscriptionStore((s) => s.clear);
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const result = await subscriptionService.createCheckout();
      window.location.href = result.checkoutUrl;
    } catch (error: any) {
      showErrorToast('Error al crear checkout', error.message);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clear();
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Tu suscripción ha expirado
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Tu acceso a Restify se encuentra restringido actualmente. Necesitas renovar
          tu plan para continuar gestionando tu restaurante sin interrupciones.
        </p>
      </div>

      {/* Plan Card */}
      <div className="w-full max-w-sm mb-10">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="relative rounded-2xl border-2 border-blue-500 bg-white dark:bg-slate-800 p-8 shadow-xl"
          >
            {/* Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                Plan Mensual
              </span>
            </div>

            {/* Price */}
            <div className="text-center mb-6 mt-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {plan.name}
              </h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-slate-500 dark:text-slate-400">/mes</span>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
              size="lg"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Renovar Ahora'
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-6 text-sm">
        <button
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Hablar con soporte
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default SubscriptionBlockedPage;

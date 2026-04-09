import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Check, LogOut, MessageCircle, Crown } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { useAuthStore } from '@/presentation/store/auth.store';
import { useSubscriptionStore } from '@/presentation/store/subscription.store';
import { subscriptionService } from '@/application/services/subscription.service';
import { showErrorToast } from '@/shared/utils/toast';
import { formatCurrency } from '@/shared/utils/currency.utils';
import type { SubscriptionPlan } from '@/domain/types/subscription.types';

const FEATURES = [
  'Gestión de 1 Local',
  'Usuarios ilimitados',
  'Soporte por Email',
];

const SubscriptionBlockedPage = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const logout = useAuthStore((s) => s.logout);
  const clear = useSubscriptionStore((s) => s.clear);
  const navigate = useNavigate();

  useEffect(() => {
    subscriptionService
      .getPlans()
      .then((data) => {
        setPlans(data);
        if (data.length > 0) setSelectedPlanId(data[0].id);
      })
      .catch(() => showErrorToast('Error al cargar planes'))
      .finally(() => setIsLoadingPlans(false));
  }, []);

  const handleSubscribe = async () => {
    if (!selectedPlanId) return;
    setIsLoading(true);
    try {
      const result = await subscriptionService.createCheckout(selectedPlanId);
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

  const annualPlan = plans.find((p) => p.billingPeriod === 'ANNUAL');
  const monthlyPlan = plans.find((p) => p.billingPeriod === 'MONTHLY');
  const savingsPercent =
    annualPlan && monthlyPlan
      ? Math.round(100 - (annualPlan.price / (monthlyPlan.price * 12)) * 100)
      : null;

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
          Tu acceso a Restify se encuentra restringido actualmente. Elige un plan
          para continuar gestionando tu restaurante sin interrupciones.
        </p>
      </div>

      {/* Plan Cards */}
      {isLoadingPlans ? (
        <div className="flex items-center justify-center mb-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const isAnnual = plan.billingPeriod === 'ANNUAL';
            const priceDisplay = formatCurrency(plan.price / 100);
            const periodLabel = isAnnual ? '/año' : '/mes';

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={`relative rounded-2xl border-2 bg-white dark:bg-slate-800 p-8 shadow-lg text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {/* Best value badge */}
                {isAnnual && savingsPercent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Ahorra {savingsPercent}%
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <div className="text-center mb-6 mt-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      {priceDisplay}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {periodLabel}
                    </span>
                  </div>
                  {isAnnual && monthlyPlan && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      equivale a {formatCurrency(plan.price / 100 / 12)}/mes
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {FEATURES.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Selection indicator */}
                <div className="mt-6 flex justify-center">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* CTA Button */}
      <div className="w-full max-w-sm mb-10">
        <Button
          onClick={handleSubscribe}
          disabled={isLoading || !selectedPlanId || isLoadingPlans}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
          size="lg"
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            'Suscribirse Ahora'
          )}
        </Button>
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

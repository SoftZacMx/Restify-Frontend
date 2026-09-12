import { useEffect, useState } from "react";
import { useSubscriptionStore } from "@/presentation/store/subscription.store";
import { useConfigStore } from "@/presentation/store/config.store";
import SubscriptionBlockedPage from "@/presentation/pages/subscription/SubscriptionBlockedPage";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { status, error, fetchStatus } = useSubscriptionStore();
  const { config, fetchConfig } = useConfigStore();
  const [isReady, setIsReady] = useState(false);

  // Alineado con el backend (SubscriptionMiddleware): cuando el billing está
  // deshabilitado NO se valida la suscripción. Evita bloquear/redirigir a
  // checkout justo después del onboarding (la org nace con una suscripción
  // "Free Legacy" ACTIVE que no debe forzar el flujo de pago).
  const billingDisabled = config?.billingEnabled === false;

  useEffect(() => {
    let cancelled = false;
    setIsReady(false);

    (async () => {
      await fetchConfig();
      // Solo consultar el estado de suscripción si el billing está habilitado.
      if (useConfigStore.getState().config?.billingEnabled) {
        await fetchStatus();
      }
      if (!cancelled) setIsReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchStatus, fetchConfig]);

  // Mientras no termine el fetch, mostrar spinner (children NUNCA se monta antes)
  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Billing deshabilitado → acceso libre, sin validar suscripción.
  if (billingDisabled) {
    return <>{children}</>;
  }

  // Fail closed: si hay error, no hay status, o no está activa → bloquear
  if (error || !status || !status.isActive) {
    return <SubscriptionBlockedPage />;
  }

  return <>{children}</>;
};

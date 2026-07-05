import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useActiveBranch } from '@/presentation/hooks/useActiveBranch';
import { useBranchSwitch } from '@/presentation/hooks/useBranchSwitch';
import { useAuthStore } from '@/presentation/store/auth.store';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { ThemeToggle } from '@/presentation/components/ui/theme-toggle';
import { BranchSelectList } from '@/presentation/components/branch-selection/BranchSelectList';
import { getDefaultRouteForRole } from '@/shared/constants/roles.constants';

/**
 * Pantalla de selección de sucursal: se muestra al entrar cuando el usuario tiene
 * más de una sucursal. Bloquea la navegación hasta elegir (ver guard en App.tsx).
 */
export default function SelectBranchPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { branches } = useActiveBranch();
  const { switchBranch, isSwitching } = useBranchSwitch();
  const [pickedId, setPickedId] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!pickedId) return;
    const ok = await switchBranch(pickedId);
    if (ok) {
      const currentUser = useAuthStore.getState().user;
      navigate(getDefaultRouteForRole(currentUser?.rol));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle variant="icon" />
      </div>

      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="text-2xl font-serif font-bold tracking-wide text-slate-900 dark:text-white">
            RESTIFY
          </span>
        </div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Selecciona una sucursal</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Elige dónde quieres trabajar para comenzar.
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="space-y-5 pt-6">
          <BranchSelectList
            branches={branches}
            selectedId={pickedId}
            onSelect={setPickedId}
            disabled={isSwitching}
          />

          <Button
            type="button"
            className="w-full"
            onClick={handleContinue}
            disabled={!pickedId || isSwitching}
          >
            {isSwitching ? 'Entrando...' : 'Continuar'}
            {!isSwitching && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => logout()}
            disabled={isSwitching}
          >
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

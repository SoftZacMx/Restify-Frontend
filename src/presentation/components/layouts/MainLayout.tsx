import React from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useSidebar } from '@/presentation/contexts/sidebar.context';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { SubscriptionBanner } from '@/presentation/components/subscription/SubscriptionBanner';
import { EmailVerificationBanner } from '@/presentation/components/auth/EmailVerificationBanner';

/**
 * Props del componente MainLayout
 */
interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Componente MainLayout
 * Responsabilidad única: Componer la estructura general (Sidebar + contenido)
 * Cumple SRP: Solo se encarga de la estructura, no del contenido específico
 *
 * Este layout se usa en todas las páginas protegidas para mantener
 * el sidebar visible mientras cambia el contenido
 */
export const MainLayout = ({ children }: MainLayoutProps) => {
  const { isMobile, isMobileOpen, isCollapsed, toggleMobile, toggleSidebar } = useSidebar();

  const handleToggle = () => {
    if (isMobile) {
      toggleMobile();
    } else {
      toggleSidebar();
    }
  };

  // Calcular el margen izquierdo del contenido
  const getMainMargin = () => {
    if (isMobile) {
      return 'ml-0'; // En móvil no hay margen (sidebar es overlay)
    }
    return isCollapsed ? 'ml-16' : 'ml-72'; // Debe coincidir con sidebarWidth en Sidebar.tsx
  };

  return (
    // Fondo de página desde el token --background: las cards blancas se despegan del fondo.
    <div className="flex h-screen bg-background font-sans text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area - Contenido específico de cada página */}
      <main
        className={cn(
          'flex-1 p-1 overflow-y-auto min-h-screen transition-all duration-300',
          getMainMargin()
        )}
      >
        {/* Botón de toggle - Solo visible en móvil.
            Va en el flujo (no fixed) para no solaparse con el título de cada
            página. Se oculta con el menú abierto: el panel y el backdrop ya
            cubren la pantalla y la banda solo taparía el logo del sidebar.
            Con el menú abierto se cierra tocando fuera (backdrop) o al
            navegar a una opción. */}
        {isMobile && !isMobileOpen && (
          <div className="flex items-center py-3">
            <Button
              onClick={handleToggle}
              variant="outline"
              size="icon"
              className="bg-card shadow-md"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}
        <SubscriptionBanner />
        <EmailVerificationBanner />
        {children}
      </main>
    </div>
  );
};

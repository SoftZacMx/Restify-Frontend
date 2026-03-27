import React from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useSidebar } from '@/presentation/contexts/sidebar.context';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { SubscriptionBanner } from '@/presentation/components/subscription/SubscriptionBanner';

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
    return isCollapsed ? 'ml-16' : 'ml-64'; // Desktop: 16 cuando colapsada, 64 cuando expandida
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area - Contenido específico de cada página */}
      <main
        className={cn(
          'flex-1 p-8 overflow-y-auto min-h-screen transition-all duration-300',
          getMainMargin()
        )}
      >
        {/* Botón de toggle - Solo visible en móvil */}
        {isMobile && (
          <Button
            onClick={handleToggle}
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-50 bg-white dark:bg-slate-800 shadow-md"
            aria-label="Toggle sidebar"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        )}
        <SubscriptionBanner />
        {children}
      </main>
    </div>
  );
};


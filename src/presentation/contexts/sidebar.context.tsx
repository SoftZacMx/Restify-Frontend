import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

/**
 * Contexto de la sidebar
 */
interface SidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  toggleMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

/**
 * Hook para usar el contexto de la sidebar
 */
export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

/**
 * Props del provider
 */
interface SidebarProviderProps {
  children: ReactNode;
}

/**
 * Provider del contexto de la sidebar
 * Maneja el estado de colapso y apertura en móvil
 */
export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint de Tailwind
      setIsMobile(mobile);
      
      // En móvil, cerrar sidebar por defecto
      if (mobile) {
        setIsMobileOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /**
   * Toggle del estado colapsado (desktop)
   */
  const toggleSidebar = () => {
    if (!isMobile) {
      setIsCollapsed((prev) => !prev);
    }
  };

  /**
   * Cerrar sidebar (móvil)
   */
  const closeSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  /**
   * Abrir sidebar (móvil)
   */
  const openSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(true);
    }
  };

  /**
   * Toggle del estado móvil
   */
  const toggleMobile = () => {
    if (isMobile) {
      setIsMobileOpen((prev) => !prev);
    }
  };

  const value: SidebarContextType = {
    isCollapsed,
    isMobileOpen,
    isMobile,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    toggleMobile,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};


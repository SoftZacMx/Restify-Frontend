import { useLocation, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ClipboardList,
  Map,
  BookOpen,
  BarChart3,
  Users,
  Settings,
  Receipt,
} from 'lucide-react';

/**
 * Tipo para un item de navegación
 * Usa LucideIcon en lugar de ReactNode para evitar problemas con erasableSyntaxOnly
 */
export interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

/**
 * Tipo de retorno del hook useSidebarNavigation
 */
export interface UseSidebarNavigationReturn {
  mainNavItems: NavItem[];
  bottomNavItems: NavItem[];
  currentPath: string;
  isActive: (path: string) => boolean;
  handleNavigate: (path: string) => void;
}

/**
 * Hook personalizado para manejar la navegación del sidebar
 * Responsabilidad única: Proporcionar lógica y datos de navegación
 * Cumple SRP: Solo maneja la lógica de navegación, no renderiza
 */
export const useSidebarNavigation = (): UseSidebarNavigationReturn => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Items de navegación principal
   * Usamos referencias a componentes en lugar de JSX para evitar problemas con erasableSyntaxOnly
   */
  const mainNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ClipboardList, label: 'Órdenes', path: '/orders' },
    { icon: Map, label: 'Mapa de Mesas', path: '/tables' },
    { icon: BookOpen, label: 'Menú', path: '/menu' },
    { icon: Receipt, label: 'Gastos', path: '/expenses' },
    { icon: BarChart3, label: 'Reportes', path: '/reports' },
    { icon: Users, label: 'Usuarios', path: '/users' },
  ];

  /**
   * Items de navegación secundaria (parte inferior)
   */
  const bottomNavItems: NavItem[] = [
    { icon: Settings, label: 'Ajustes', path: '/settings' },
  ];

  /**
   * Verifica si una ruta está activa
   */
  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  /**
   * Navega a una ruta específica
   */
  const handleNavigate = (path: string): void => {
    navigate(path);
  };

  return {
    mainNavItems,
    bottomNavItems,
    currentPath: location.pathname,
    isActive,
    handleNavigate,
  };
};


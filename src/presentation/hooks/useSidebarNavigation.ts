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
  Package,
  Boxes,
  Utensils,
  FolderTree,
} from 'lucide-react';
import { useAuthStore } from '@/presentation/store/auth.store';
import { hasFullAccess } from '@/shared/constants/roles.constants';
import type { UserRole } from '@/domain/types';

/**
 * Tipo para un item de navegación hijo (submenú)
 */
export interface NavSubItem {
  icon: LucideIcon;
  label: string;
  path: string;
  /** Si se define, solo estos roles ven el item. Si es undefined, hereda visibilidad del padre. */
  allowedRoles?: UserRole[];
}

/**
 * Tipo para un item de navegación
 * Usa LucideIcon en lugar de ReactNode para evitar problemas con erasableSyntaxOnly
 */
export interface NavItem {
  icon: LucideIcon;
  label: string;
  path?: string; // Opcional si tiene submenú
  subItems?: NavSubItem[]; // Items hijos para menú desplegable
  /** Si se define, solo estos roles ven el item. Si es undefined, visible a quien pueda ver el menú principal. */
  allowedRoles?: UserRole[];
}

/**
 * Tipo de retorno del hook useSidebarNavigation
 */
export interface UseSidebarNavigationReturn {
  mainNavItems: NavItem[];
  bottomNavItems: NavItem[];
  currentPath: string;
  isActive: (path: string) => boolean;
  isSubItemActive: (path: string) => boolean;
  handleNavigate: (path: string) => void;
}

/**
 * Hook personalizado para manejar la navegación del sidebar
 * Responsabilidad única: Proporcionar lógica y datos de navegación
 * Cumple SRP: Solo maneja la lógica de navegación, no renderiza
 */
const FULL_NAV_MAIN: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: ClipboardList, label: 'Órdenes', path: '/orders' },
  { icon: Receipt, label: 'Punto De Venta', path: '/pos' },
  { icon: Map, label: 'Mapa de Mesas', path: '/tables' },
  {
    icon: BookOpen,
    label: 'Menú del Restaurante',
    subItems: [
      { icon: Utensils, label: 'Platillos', path: '/menu/items' },
      { icon: FolderTree, label: 'Categorías', path: '/menu/categories' },
    ],
  },
  { icon: Package, label: 'Productos', path: '/products' },
  { icon: Boxes, label: 'Stock', path: '/stock', allowedRoles: ['ADMIN', 'MANAGER'] },
  { icon: Receipt, label: 'Gastos', path: '/expenses' },
  { icon: BarChart3, label: 'Reportes', path: '/reports' },
  { icon: Users, label: 'Usuarios', path: '/users' },
];

const WAITER_NAV_MAIN: NavItem[] = [
  { icon: ClipboardList, label: 'Órdenes', path: '/orders' },
  { icon: Receipt, label: 'Punto De Venta', path: '/pos' },
];

const FULL_NAV_BOTTOM: NavItem[] = [
  { icon: Settings, label: 'Ajustes', path: '/settings' },
];

/**
 * Aplica el filtro de `allowedRoles` recursivamente a items y subItems.
 * Si un item tiene `allowedRoles` y el rol del usuario no está, se omite.
 * Si no hay rol (no logueado), nada con allowedRoles se ve.
 */
const filterByRole = (items: NavItem[], role: UserRole | null | undefined): NavItem[] => {
  return items
    .filter((item) => !item.allowedRoles || (role != null && item.allowedRoles.includes(role)))
    .map((item) =>
      item.subItems
        ? {
            ...item,
            subItems: item.subItems.filter(
              (sub) => !sub.allowedRoles || (role != null && sub.allowedRoles.includes(role))
            ),
          }
        : item
    );
};

export const useSidebarNavigation = (): UseSidebarNavigationReturn => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const canAccessFullApp = hasFullAccess(user?.rol ?? null);
  const role = user?.rol ?? null;

  const mainNavItems: NavItem[] = filterByRole(
    canAccessFullApp ? FULL_NAV_MAIN : WAITER_NAV_MAIN,
    role
  );
  const bottomNavItems: NavItem[] = filterByRole(canAccessFullApp ? FULL_NAV_BOTTOM : [], role);

  /**
   * Verifica si una ruta está activa
   */
  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  /**
   * Verifica si algún subitem está activo
   */
  const isSubItemActive = (path: string): boolean => {
    return location.pathname.startsWith(path);
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
    isSubItemActive,
    handleNavigate,
  };
};


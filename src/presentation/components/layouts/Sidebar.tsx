import React, { useState } from 'react';
import { LogOut, UtensilsCrossed, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useSidebarNavigation, type NavItem } from '@/presentation/hooks/useSidebarNavigation';
import { useSidebar } from '@/presentation/contexts/sidebar.context';
import { Tooltip } from '@/presentation/components/ui/tooltip';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/shared/lib/utils';

/**
 * Componente Sidebar
 * Responsabilidad única: Renderizar la navegación lateral
 * Cumple SRP: Solo se encarga de mostrar la UI, la lógica está en el hook
 */
export const Sidebar = () => {
  const { logout } = useAuth();
  const { mainNavItems, bottomNavItems, isActive, isSubItemActive, handleNavigate, currentPath } = useSidebarNavigation();
  const { isCollapsed, isMobile, isMobileOpen, toggleSidebar, closeSidebar } = useSidebar();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleLogout = async () => {
    await logout();
    // La redirección se maneja en el interceptor de Axios (401)
  };

  const handleNavClick = (path: string) => {
    handleNavigate(path);
    // Cerrar sidebar en móvil después de navegar
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleToggleSubmenu = (label: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  // Auto-expandir submenús si algún hijo está activo (solo cuando cambia la ruta)
  React.useEffect(() => {
    const currentPath = window.location.pathname;
    const itemsToExpand = new Set<string>();
    
    mainNavItems.forEach((item) => {
      if (item.subItems) {
        const hasActiveChild = item.subItems.some((subItem) => 
          currentPath === subItem.path || currentPath.startsWith(subItem.path + '/')
        );
        if (hasActiveChild) {
          itemsToExpand.add(item.label);
        }
      }
    });
    
    // Solo actualizar si hay cambios y no está ya expandido
    if (itemsToExpand.size > 0) {
      setExpandedItems((prev) => {
        let hasChanges = false;
        const newSet = new Set(prev);
        itemsToExpand.forEach((label) => {
          if (!newSet.has(label)) {
            newSet.add(label);
            hasChanges = true;
          }
        });
        return hasChanges ? newSet : prev;
      });
    }
  }, [currentPath]); // Solo depende de currentPath del hook

  // Determinar si la sidebar debe estar visible
  const isVisible = !isMobile || isMobileOpen;
  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';

  return (
    <>
      {/* Backdrop para móvil */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col fixed h-full z-50 transition-all duration-300',
          sidebarWidth,
          isMobile && !isMobileOpen && '-translate-x-full',
          isMobile && isMobileOpen && 'translate-x-0'
        )}
      >
        {/* Logo y botón de toggle */}
        <div className={cn('p-6 flex items-center gap-2', isCollapsed && 'justify-center px-2')}>
          <UtensilsCrossed className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
              Restify
            </span>
          )}
          {/* Botón de toggle para desktop */}
          {!isMobile && (
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="icon"
              className="ml-auto h-8 w-8"
              aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className={cn('flex-1 space-y-1 mt-4 overflow-y-auto', isCollapsed ? 'px-2' : 'px-4')}>
          {mainNavItems.map((item: NavItem) => {
            const IconComponent = item.icon;
            
            // Si tiene submenú, renderizar como item desplegable
            if (item.subItems && item.subItems.length > 0) {
              const isExpanded = expandedItems.has(item.label);
              const hasActiveChild = item.subItems.some((subItem) => isActive(subItem.path));
              
              return (
                <NavItemWithSubmenu
                  key={item.label}
                  icon={<IconComponent size={20} />}
                  label={item.label}
                  subItems={item.subItems}
                  isExpanded={isExpanded}
                  hasActiveChild={hasActiveChild}
                  isCollapsed={isCollapsed}
                  isActive={isActive}
                  onToggle={() => handleToggleSubmenu(item.label)}
                  onNavigate={handleNavClick}
                />
              );
            }
            
            // Item normal sin submenú
            return (
              <NavItemComponent
                key={item.path || item.label}
                icon={<IconComponent size={20} />}
                label={item.label}
                path={item.path || ''}
                isActive={item.path ? isActive(item.path) : false}
                isCollapsed={isCollapsed}
                onClick={() => item.path && handleNavClick(item.path)}
              />
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className={cn('border-t border-slate-100 dark:border-slate-700 space-y-1', isCollapsed ? 'p-2' : 'p-4')}>
          {bottomNavItems.map((item: NavItem) => {
            const IconComponent = item.icon;
            return (
              <NavItemComponent
                key={item.path}
                icon={<IconComponent size={20} />}
                label={item.label}
                path={item.path}
                isActive={isActive(item.path)}
                isCollapsed={isCollapsed}
                onClick={() => handleNavClick(item.path)}
              />
            );
          })}
          {(() => {
            const logoutButton = (
              <button
                onClick={handleLogout}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <LogOut size={20} />
                {!isCollapsed && <span>Cerrar Sesión</span>}
              </button>
            );

            if (isCollapsed) {
              return <Tooltip content="Cerrar Sesión">{logoutButton}</Tooltip>;
            }

            return logoutButton;
          })()}
        </div>
      </aside>
    </>
  );
};

/**
 * Componente NavItemComponent
 * Responsabilidad única: Renderizar un item de navegación
 * Recibe isActive como prop para evitar cálculos dentro del componente
 */
interface NavItemComponentProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const NavItemComponent = ({ icon, label, isActive, onClick, isCollapsed }: NavItemComponentProps) => {
  const buttonContent = (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        isCollapsed && 'justify-center px-2',
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );

  // Mostrar tooltip cuando está colapsada
  if (isCollapsed) {
    return <Tooltip content={label}>{buttonContent}</Tooltip>;
  }

  return buttonContent;
};

/**
 * Componente NavItemWithSubmenu
 * Responsabilidad única: Renderizar un item de navegación con submenú desplegable
 */
interface NavItemWithSubmenuProps {
  icon: React.ReactNode;
  label: string;
  subItems: Array<{ icon: LucideIcon; label: string; path: string }>;
  isExpanded: boolean;
  hasActiveChild: boolean;
  isCollapsed: boolean;
  isActive: (path: string) => boolean;
  onToggle: () => void;
  onNavigate: (path: string) => void;
}

const NavItemWithSubmenu = ({
  icon,
  label,
  subItems,
  isExpanded,
  hasActiveChild,
  isCollapsed,
  isActive,
  onToggle,
  onNavigate,
}: NavItemWithSubmenuProps) => {
  const ChevronIcon = isExpanded ? ChevronUp : ChevronDown;

  const parentButton = (
    <button
      onClick={onToggle}
      className={cn(
        'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        isCollapsed && 'justify-center px-2',
        hasActiveChild
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="flex-shrink-0">{icon}</span>
        {!isCollapsed && <span className="whitespace-nowrap truncate">{label}</span>}
      </div>
      {!isCollapsed && (
        <ChevronIcon className="h-4 w-4 flex-shrink-0 transition-transform" />
      )}
    </button>
  );

  const content = (
    <div className="space-y-1">
      {isCollapsed ? (
        <Tooltip content={label}>{parentButton}</Tooltip>
      ) : (
        <>
          {parentButton}
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-2">
              {subItems.map((subItem) => {
                const SubIconComponent = subItem.icon;
                const isSubActive = isActive(subItem.path);
                return (
                  <button
                    key={subItem.path}
                    onClick={() => onNavigate(subItem.path)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isSubActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                    )}
                  >
                    <SubIconComponent size={18} className="flex-shrink-0" />
                    <span className="whitespace-nowrap truncate">{subItem.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );

  return content;
};

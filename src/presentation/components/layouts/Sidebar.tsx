import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { LogOut, UtensilsCrossed, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Store, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { branchService } from '@/application/services';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useActiveBranch } from '@/presentation/hooks/useActiveBranch';
import { useAuthStore } from '@/presentation/store/auth.store';
import { useSidebarNavigation, type NavItem } from '@/presentation/hooks/useSidebarNavigation';
import { useSidebar } from '@/presentation/contexts/sidebar.context';
import { useTheme } from '@/presentation/contexts/theme.context';
import { Tooltip } from '@/presentation/components/ui/tooltip';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/shared/lib/utils';

/** Fila del bloque inferior (tema, cerrar sesión): mismo look que un NavItem inactivo. */
const bottomRowClass =
  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-card hover:text-slate-900 dark:hover:text-foreground';

/**
 * Componente Sidebar
 * Responsabilidad única: Renderizar la navegación lateral
 * Cumple SRP: Solo se encarga de mostrar la UI, la lógica está en el hook
 */
export const Sidebar = () => {
  const { logout } = useAuth();
  const { mainNavItems, bottomNavItems, isActive, handleNavigate, currentPath } = useSidebarNavigation();
  const { isCollapsed, isMobile, isMobileOpen, toggleSidebar, closeSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const isDark = theme === 'dark';
  const themeLabel = isDark ? 'Modo Claro' : 'Modo Oscuro';

  const { selectedBranch, selectedBranchId, hasMultipleBranches } = useActiveBranch();
  const clearSelectedBranch = useAuthStore((s) => s.clearSelectedBranch);
  const navigate = useNavigate();
  const businessName = selectedBranch?.name ?? 'Restify';
  const [logoFailed, setLogoFailed] = useState(false);

  const { data: branchDetail } = useQuery({
    queryKey: ['branches', selectedBranchId, 'detail'],
    queryFn: () => branchService.getBranch(selectedBranchId as string),
    enabled: !!selectedBranchId,
  });

  const logoUrl = !logoFailed ? branchDetail?.logoUrl ?? null : null;

  const handleChangeBranch = () => {
    clearSelectedBranch();
    navigate('/select-branch');
    if (isMobile) closeSidebar();
  };

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

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-72';

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
          'bg-white dark:bg-card border-r border-slate-200 dark:border-border flex flex-col fixed h-full z-50 transition-all duration-300',
          sidebarWidth,
          isMobile && !isMobileOpen && '-translate-x-full',
          isMobile && isMobileOpen && 'translate-x-0'
        )}
      >
        {/* Marca de la sucursal (logo, nombre y ciudad) + botón de toggle.
            Expandida: bloque a ancho completo pegado al tope, con el fondo desvaneciéndose
            hacia abajo para que el corte con la navegación no se note.
            Colapsada: sin fondo, solo el logo. */}
        <div
          className={cn(
            'relative flex flex-col items-center gap-3',
            isCollapsed
              ? 'px-2 pt-4 pb-3'
              : 'bg-slate-200/30 px-4 pt-6 pb-6 dark:bg-background/30'
          )}
        >
          {!isCollapsed && (
            <>
              {/* Últimos píxeles del fondo diluyéndose hacia el color del sidebar. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-b from-transparent to-white dark:to-card"
              />
              {/* Línea del límite: marca dónde termina la sección y se apaga en los costados. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-card"
              />
            </>
          )}

          {logoUrl ? (
            <img
              src={logoUrl}
              alt={businessName}
              onError={() => setLogoFailed(true)}
              className={cn(
                'shrink-0 rounded-full object-cover ring-1 ring-border',
                isCollapsed ? 'h-10 w-10' : 'h-20 w-20'
              )}
            />
          ) : (
            <div
              className={cn(
                'flex shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20',
                isCollapsed ? 'h-10 w-10' : 'h-16 w-16'
              )}
            >
              <UtensilsCrossed
                className={cn('text-primary', isCollapsed ? 'h-5 w-5' : 'h-7 w-7')}
              />
            </div>
          )}

          {!isCollapsed && (
            <div className="w-full text-center">
              <p
                className="text-base font-semibold leading-snug text-slate-900 dark:text-foreground line-clamp-2"
                title={businessName}
              >
                {businessName}
              </p>
              {branchDetail?.city && (
                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-muted-foreground">
                  {branchDetail.city}
                </p>
              )}
            </div>
          )}

          {!isMobile && (
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', !isCollapsed && 'absolute right-2 top-2')}
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

        {/* Cambiar de sucursal (solo si el usuario tiene más de una) */}
        {hasMultipleBranches && !isCollapsed && (
          <button
            type="button"
            onClick={handleChangeBranch}
            className="mx-4 mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-card hover:text-slate-900 dark:hover:text-foreground transition-colors"
          >
            <Store className="h-4 w-4 shrink-0" />
            Cambiar de sucursal
          </button>
        )}

        {/* Main Navigation */}
        <nav className={cn('flex-1 space-y-1 mt-8 overflow-y-auto', isCollapsed ? 'px-2' : 'px-4')}>
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
        <div className={cn('border-t border-slate-100 dark:border-border space-y-1', isCollapsed ? 'p-2' : 'p-4')}>
          {bottomNavItems.map((item: NavItem) => {
            const IconComponent = item.icon;
            const path = item.path ?? '';
            return (
              <NavItemComponent
                key={path || item.label}
                icon={<IconComponent size={20} />}
                label={item.label}
                path={path}
                isActive={isActive(path)}
                isCollapsed={isCollapsed}
                onClick={() => handleNavClick(path)}
              />
            );
          })}
          {(() => {
            const themeButton = (
              <button
                onClick={toggleTheme}
                className={cn(bottomRowClass, isCollapsed && 'justify-center px-2')}
                aria-label={themeLabel}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                {!isCollapsed && <span>{themeLabel}</span>}
              </button>
            );

            if (isCollapsed) {
              return <Tooltip content={themeLabel}>{themeButton}</Tooltip>;
            }

            return themeButton;
          })()}
          {(() => {
            const logoutButton = (
              <button
                onClick={handleLogout}
                className={cn(bottomRowClass, isCollapsed && 'justify-center px-2')}
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
          ? 'bg-primary/10 text-primary'
          : 'text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-card hover:text-slate-900 dark:hover:text-foreground'
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
          ? 'bg-primary/10 text-primary'
          : 'text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-card hover:text-slate-900 dark:hover:text-foreground'
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
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-border pl-2">
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
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-card hover:text-slate-900 dark:hover:text-foreground'
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

import React from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Edit, Trash2, ChefHat, Package, AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { Badge } from '@/presentation/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import { Tooltip } from '@/presentation/components/ui/tooltip';
import type { MenuItemTableItem, MenuItemStockMode } from '@/domain/types';
import { cn } from '@/shared/lib/utils';
import { APP_TIMEZONE } from '@/shared/constants';

const STOCK_MODE_META: Record<
  MenuItemStockMode,
  { label: string; tooltip: string; className: string; Icon: typeof ChefHat }
> = {
  recipe: {
    label: 'Receta',
    tooltip: 'Tiene ingredientes cargados — descuenta stock al venderse',
    className: 'bg-fresco-suave text-fresco-texto',
    Icon: ChefHat,
  },
  direct: {
    label: 'Directo',
    tooltip: 'Vinculado a un producto único — descuenta 1 unidad al venderse',
    className: 'bg-primary/10 dark:bg-primary/20 text-primary',
    Icon: Package,
  },
  none: {
    label: 'Sin receta',
    tooltip: 'No descuenta stock al venderse — falta cargar receta o vincular un producto',
    className: 'bg-apoyo-suave text-apoyo-texto',
    Icon: AlertTriangle,
  },
};

interface MenuItemTableProps {
  menuItems: MenuItemTableItem[];
  isLoading?: boolean;
  onMenuItemAction?: (menuItemId: string, action: 'edit' | 'delete' | 'toggle-status') => void;
}

/**
 * Componente MenuItemTable
 * Responsabilidad única: Renderizar tabla de productos
 * Cumple SRP: Solo maneja la presentación de datos en tabla
 */
export const MenuItemTable: React.FC<MenuItemTableProps> = ({
  menuItems,
  isLoading = false,
  onMenuItemAction,
}) => {
  if (isLoading) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-8 text-center text-muted-foreground">
            Cargando productos...
          </div>
        </div>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-8 text-center text-muted-foreground">
            No se encontraron productos
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Nombre
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Precio
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estado
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Es Extra
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Stock
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fecha de creación
                </TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((menuItem) => (
                <TableRow
                  key={menuItem.id}
                  className="hover:bg-muted dark:hover:bg-card/50 transition-colors"
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/menu/items/${menuItem.id}`}
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      {menuItem.name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    ${menuItem.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0',
                        menuItem.statusLabel === 'Activo'
                          ? 'bg-fresco-suave text-fresco-texto'
                          : 'bg-muted text-foreground'
                      )}
                    >
                      {menuItem.statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0',
                        menuItem.isExtra
                          ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                          : 'bg-muted text-foreground'
                      )}
                    >
                      {menuItem.isExtraLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const meta = STOCK_MODE_META[menuItem.stockMode];
                      const StockIcon = meta.Icon;
                      return (
                        <Tooltip content={meta.tooltip}>
                          <Badge
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0',
                              meta.className
                            )}
                          >
                            <StockIcon className="h-3 w-3" />
                            {meta.label}
                          </Badge>
                        </Tooltip>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(menuItem.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      timeZone: APP_TIMEZONE,
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="p-2 rounded-full text-muted-foreground hover:bg-secondary dark:hover:bg-card hover:text-foreground dark:hover:text-foreground transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onSelect={() => onMenuItemAction?.(menuItem.id, 'edit')}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onMenuItemAction?.(menuItem.id, 'delete')}
                          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive-suave"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onMenuItemAction?.(menuItem.id, 'toggle-status')}
                          className="cursor-pointer"
                        >
                          <span>
                            {menuItem.status ? 'Desactivar' : 'Activar'}
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

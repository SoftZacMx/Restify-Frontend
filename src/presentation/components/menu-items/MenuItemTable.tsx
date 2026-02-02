import React from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
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
import type { MenuItemTableItem } from '@/domain/types';
import { cn } from '@/shared/lib/utils';

interface MenuItemTableProps {
  menuItems: MenuItemTableItem[];
  isLoading?: boolean;
  onMenuItemAction?: (menuItemId: string, action: 'edit' | 'delete' | 'toggle-status') => void;
}

/**
 * Componente MenuItemTable
 * Responsabilidad única: Renderizar tabla de platillos
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
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Cargando platillos...
          </div>
        </div>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No se encontraron platillos
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Nombre
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Precio
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Estado
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Es Extra
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Fecha de creación
                </TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((menuItem) => (
                <TableRow
                  key={menuItem.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/menu/items/${menuItem.id}`}
                      className="text-slate-900 dark:text-white hover:text-primary transition-colors"
                    >
                      {menuItem.name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    ${menuItem.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0',
                        menuItem.statusLabel === 'Activo'
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
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
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
                      )}
                    >
                      {menuItem.isExtraLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {new Date(menuItem.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
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
                          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
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

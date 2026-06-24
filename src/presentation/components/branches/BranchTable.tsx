import React from 'react';
import { MoreVertical, Eye, Edit, Ban, CheckCircle2 } from 'lucide-react';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import type { BranchListItem } from '@/domain/types';
import { cn } from '@/shared/lib/utils';
import { APP_TIMEZONE } from '@/shared/constants';

export type BranchAction = 'view' | 'edit' | 'disable' | 'enable';

interface BranchTableProps {
  branches: BranchListItem[];
  isLoading?: boolean;
  /** Si true, muestra acciones de escritura (Editar). Solo OWNER/ADMIN. */
  canWrite?: boolean;
  onBranchAction?: (branchId: string, action: BranchAction) => void;
}

const formatLastOrder = (lastOrderAt: string | null): string => {
  if (!lastOrderAt) return '—';
  return new Date(lastOrderAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: APP_TIMEZONE,
  });
};

/**
 * Tabla del listado de sucursales.
 * Columnas: Sucursal, Ubicación, Usuarios, Último pedido, Estado, Acciones.
 * En Fase 4/5 se agregarán acciones de escritura (Editar / Deshabilitar / Habilitar).
 */
export const BranchTable: React.FC<BranchTableProps> = ({
  branches,
  isLoading = false,
  canWrite = false,
  onBranchAction,
}) => {
  if (isLoading) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Cargando sucursales...
          </div>
        </div>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No se encontraron sucursales
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
                  Sucursal
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Ubicación
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Usuarios
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Último pedido
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Estado
                </TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow
                  key={branch.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                    {branch.name}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col">
                      <span className="text-slate-900 dark:text-slate-200">{branch.city}</span>
                      <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {branch.state}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {branch.assignedUsersCount}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {formatLastOrder(branch.lastOrderAt)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0',
                        branch.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                      )}
                    >
                      {branch.status === 'active' ? 'Activa' : 'Deshabilitada'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onSelect={() => onBranchAction?.(branch.id, 'view')}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Ver detalle</span>
                        </DropdownMenuItem>
                        {canWrite && (
                          <DropdownMenuItem
                            onSelect={() => onBranchAction?.(branch.id, 'edit')}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                        )}
                        {canWrite && branch.status === 'active' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => onBranchAction?.(branch.id, 'disable')}
                              className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              <span>Deshabilitar</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        {canWrite && branch.status === 'disabled' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => onBranchAction?.(branch.id, 'enable')}
                              className="cursor-pointer text-green-700 dark:text-green-400 focus:text-green-700 dark:focus:text-green-400 focus:bg-green-50 dark:focus:bg-green-900/20"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              <span>Habilitar</span>
                            </DropdownMenuItem>
                          </>
                        )}
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

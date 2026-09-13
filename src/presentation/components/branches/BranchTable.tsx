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
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-8 text-center text-muted-foreground">
            Cargando sucursales...
          </div>
        </div>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-8 text-center text-muted-foreground">
            No se encontraron sucursales
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
              <TableRow className="bg-muted/50">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Sucursal
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ubicación
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Usuarios
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Último pedido
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estado
                </TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow
                  key={branch.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {branch.name}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col">
                      <span className="text-foreground">{branch.city}</span>
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">
                        {branch.state}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {branch.assignedUsersCount}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {formatLastOrder(branch.lastOrderAt)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0',
                        branch.status === 'active'
                          ? 'bg-fresco-suave text-fresco-texto'
                          : 'bg-destructive-suave text-destructive-texto'
                      )}
                    >
                      {branch.status === 'active' ? 'Activa' : 'Deshabilitada'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
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
                              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive-suave"
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
                              className="cursor-pointer text-fresco-texto focus:text-fresco-texto focus:bg-fresco-suave"
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

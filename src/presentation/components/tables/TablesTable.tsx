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
import type { TableTableItem } from '@/domain/types';
import { cn } from '@/shared/lib/utils';

interface TablesTableProps {
  tables: TableTableItem[];
  isLoading?: boolean;
  onTableAction?: (tableId: string, action: 'edit' | 'delete' | 'toggle-status' | 'toggle-availability') => void;
}

/**
 * Componente TablesTable
 * Responsabilidad única: Renderizar tabla de mesas
 * Cumple SRP: Solo maneja la presentación de datos en tabla
 */
export const TablesTable: React.FC<TablesTableProps> = ({
  tables,
  isLoading = false,
  onTableAction,
}) => {
  if (isLoading) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Cargando mesas...
          </div>
        </div>
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="px-4 py-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No se encontraron mesas
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
                  Mesa
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Estado
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Disponibilidad
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
              {tables.map((table) => (
                <TableRow
                  key={table.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/tables/${table.id}`}
                      className="text-slate-900 dark:text-white hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <span className="inline-flex items-center justify-center min-w-8 h-8 px-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs max-w-[120px] truncate">
                        {table.name}
                      </span>
                      <span className="truncate max-w-[180px]">Mesa {table.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0',
                        table.statusLabel === 'Activa'
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
                      )}
                    >
                      {table.statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-5 border-0',
                        table.availabilityLabel === 'Libre'
                          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                          : 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block w-2 h-2 rounded-full mr-2',
                          table.availabilityLabel === 'Libre'
                            ? 'bg-emerald-500'
                            : 'bg-orange-500'
                        )}
                      />
                      {table.availabilityLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {table.createdAt}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onSelect={() => onTableAction?.(table.id, 'edit')}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onTableAction?.(table.id, 'toggle-availability')}
                          className="cursor-pointer"
                        >
                          <span>
                            {table.availabilityStatus ? 'Marcar como Ocupada' : 'Marcar como Libre'}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onTableAction?.(table.id, 'toggle-status')}
                          className="cursor-pointer"
                        >
                          <span>
                            {table.status ? 'Desactivar' : 'Activar'}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onTableAction?.(table.id, 'delete')}
                          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Eliminar</span>
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

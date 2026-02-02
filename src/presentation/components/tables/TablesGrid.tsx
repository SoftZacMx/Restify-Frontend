import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Square, MoreVertical, Edit, Trash2, Power, ToggleLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import type { TableResponse } from '@/domain/types';
import { cn } from '@/shared/lib/utils';

interface TablesGridProps {
  tables: TableResponse[];
  isLoading?: boolean;
  onTableAction?: (tableId: string, action: 'edit' | 'delete' | 'toggle-status' | 'toggle-availability') => void;
}

/**
 * Componente TablesGrid
 * Muestra las mesas en formato de grid visual similar al POS
 * con acciones de CRUD disponibles
 */
export const TablesGrid: React.FC<TablesGridProps> = ({
  tables,
  isLoading = false,
  onTableAction,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="px-4 py-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <Square className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No hay mesas
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Crea tu primera mesa para comenzar
          </p>
        </div>
      </div>
    );
  }

  /**
   * Obtiene el color de fondo según el estado de la mesa
   */
  const getTableColor = (table: TableResponse) => {
    if (!table.status) {
      return 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300';
    }
    if (table.availabilityStatus) {
      return 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-200 dark:shadow-emerald-900/30';
    }
    return 'bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-rose-200 dark:shadow-rose-900/30';
  };

  /**
   * Obtiene el texto del estado
   */
  const getStatusText = (table: TableResponse) => {
    if (!table.status) return 'Deshabilitada';
    if (table.availabilityStatus) return 'Libre';
    return 'Ocupada';
  };

  /**
   * Obtiene el color del indicador
   */
  const getIndicatorColor = (table: TableResponse) => {
    if (!table.status) return 'bg-slate-400';
    if (table.availabilityStatus) return 'bg-emerald-300 animate-pulse';
    return 'bg-rose-300';
  };

  return (
    <div className="px-4 py-6">
      {/* Leyenda de estados */}
      <div className="flex flex-wrap items-center gap-6 mb-6 px-2">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-emerald-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Libre</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-rose-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Ocupada</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Deshabilitada</span>
        </div>
      </div>

      {/* Grid de mesas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className={cn(
              'relative rounded-xl p-4 h-32 flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer shadow-lg',
              getTableColor(table)
            )}
            onClick={() => navigate(`/tables/${table.id}`)}
          >
            {/* Indicador de estado en esquina */}
            <div
              className={cn(
                'absolute top-3 left-3 w-3 h-3 rounded-full ring-2 ring-white/30',
                getIndicatorColor(table)
              )}
              title={getStatusText(table)}
            />

            {/* Menú de acciones */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  'absolute top-2 right-2 p-1.5 rounded-lg transition-colors',
                  table.status
                    ? 'hover:bg-white/20 text-white/80 hover:text-white'
                    : 'hover:bg-slate-400/20 text-slate-500 hover:text-slate-600 dark:text-slate-400'
                )}
                onClick={(e) => e.stopPropagation()}
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => table.status && onTableAction?.(table.id, 'toggle-availability')}
                  className={cn('cursor-pointer', !table.status && 'opacity-50 pointer-events-none')}
                >
                  <ToggleLeft className="mr-2 h-4 w-4" />
                  <span>
                    {table.availabilityStatus ? 'Marcar Ocupada' : 'Marcar Libre'}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onTableAction?.(table.id, 'toggle-status')}
                  className="cursor-pointer"
                >
                  <Power className="mr-2 h-4 w-4" />
                  <span>
                    {table.status ? 'Deshabilitar' : 'Habilitar'}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => onTableAction?.(table.id, 'delete')}
                  className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Eliminar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Icono de mesa */}
            <div className="mb-2">
              <Square className={cn(
                'h-8 w-8',
                table.status ? 'opacity-90' : 'opacity-50'
              )} />
            </div>

            {/* Número de mesa */}
            <div className="text-center">
              <span className={cn(
                'text-2xl font-bold',
                table.status ? 'opacity-100' : 'opacity-60'
              )}>
                {table.numberTable}
              </span>
              <p className={cn(
                'text-xs mt-1 font-medium',
                table.status ? 'opacity-80' : 'opacity-50'
              )}>
                {getStatusText(table)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen de mesas */}
      <div className="mt-8 px-2">
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <span>
            <strong className="text-slate-700 dark:text-slate-300">{tables.length}</strong> mesas en total
          </span>
          <span>•</span>
          <span>
            <strong className="text-emerald-600">{tables.filter(t => t.status && t.availabilityStatus).length}</strong> libres
          </span>
          <span>•</span>
          <span>
            <strong className="text-rose-600">{tables.filter(t => t.status && !t.availabilityStatus).length}</strong> ocupadas
          </span>
          <span>•</span>
          <span>
            <strong className="text-slate-500">{tables.filter(t => !t.status).length}</strong> deshabilitadas
          </span>
        </div>
      </div>
    </div>
  );
};

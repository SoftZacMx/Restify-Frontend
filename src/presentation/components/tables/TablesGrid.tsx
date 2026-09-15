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
 * Muestra las ubicaciones en formato de grid visual similar al POS
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
              className="h-32 rounded-xl bg-secondary animate-pulse"
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Square className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No hay ubicaciones
          </h3>
          <p className="text-muted-foreground">
            Crea tu primera ubicación para comenzar
          </p>
        </div>
      </div>
    );
  }

  /**
   * Obtiene el color de fondo según el estado de la ubicación
   */
  const getTableColor = (table: TableResponse) => {
    if (!table.status) {
      return 'bg-secondary text-muted-foreground';
    }
    if (table.availabilityStatus) {
      return 'bg-gradient-to-br from-fresco to-fresco text-white shadow-fresco';
    }
    return 'bg-gradient-to-br from-destructive to-destructive text-white shadow-destructive';
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
    if (!table.status) return 'bg-muted-foreground';
    if (table.availabilityStatus) return 'bg-fresco-suave animate-pulse';
    return 'bg-destructive-suave';
  };

  return (
    <div className="px-4 py-6">
      {/* Leyenda de estados */}
      <div className="flex flex-wrap items-center gap-6 mb-6 px-2">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-fresco" />
          <span className="text-sm text-muted-foreground">Libre</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-destructive" />
          <span className="text-sm text-muted-foreground">Ocupada</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-muted-foreground" />
          <span className="text-sm text-muted-foreground">Deshabilitada</span>
        </div>
      </div>

      {/* Grid de ubicaciones */}
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
                    ? 'hover:bg-card/20 text-white/80 hover:text-white'
                    : 'hover:bg-muted-foreground/20 text-muted-foreground hover:text-muted-foreground'
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
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive-suave"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Eliminar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Icono de ubicación */}
            <div className="mb-2">
              <Square className={cn(
                'h-8 w-8',
                table.status ? 'opacity-90' : 'opacity-50'
              )} />
            </div>

            {/* Nombre de ubicación */}
            <div className="text-center">
              <span className={cn(
                'text-h3 px-1 break-words',
                table.status ? 'opacity-100' : 'opacity-60'
              )}>
                {table.name}
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

      {/* Resumen de ubicaciones */}
      <div className="mt-8 px-2">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">{tables.length}</strong> ubicaciones en total
          </span>
          <span>•</span>
          <span>
            <strong className="text-fresco">{tables.filter(t => t.status && t.availabilityStatus).length}</strong> libres
          </span>
          <span>•</span>
          <span>
            <strong className="text-destructive">{tables.filter(t => t.status && !t.availabilityStatus).length}</strong> ocupadas
          </span>
          <span>•</span>
          <span>
            <strong className="text-muted-foreground">{tables.filter(t => !t.status).length}</strong> deshabilitadas
          </span>
        </div>
      </div>
    </div>
  );
};

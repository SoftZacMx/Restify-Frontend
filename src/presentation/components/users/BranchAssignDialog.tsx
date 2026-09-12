import React, { useMemo, useState } from 'react';
import { Search, Check, Store, MapPin } from 'lucide-react';
import { FormDialog } from '@/presentation/components/ui/form-dialog';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { BranchListItem } from '@/domain/types';

interface BranchAssignDialogProps {
  open: boolean;
  onClose: () => void;
  /** Sucursales de la organización (solo activas: no se asigna a deshabilitadas). */
  branches: BranchListItem[];
  isLoading?: boolean;
  /** IDs ya asignados al abrir; el diálogo trabaja sobre un borrador local. */
  selectedIds: string[];
  /** Se dispara solo al pulsar "Aplicar", con el borrador confirmado. */
  onApply: (branchIds: string[]) => void;
}

/**
 * Diálogo para asignar sucursales a un usuario (roles operativos). Muestra la lista de la
 * organización con búsqueda por nombre/ciudad y un indicador de selección por fila. Los
 * cambios son un borrador local: solo se aplican al form padre al pulsar "Aplicar".
 */
export const BranchAssignDialog: React.FC<BranchAssignDialogProps> = ({
  open,
  onClose,
  branches,
  isLoading = false,
  selectedIds,
  onApply,
}) => {
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<Set<string>>(new Set(selectedIds));

  // Re-sincroniza el borrador al abrir el diálogo (patrón "reset on prop change" en render,
  // sin useEffect): al pasar de cerrado a abierto se recarga la selección entrante.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDraft(new Set(selectedIds));
      setSearch('');
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter(
      (b) => b.name.toLowerCase().includes(q) || b.city.toLowerCase().includes(q)
    );
  }, [branches, search]);

  const toggle = (id: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="Asignar sucursales"
      description="Elige las sucursales a las que este usuario tendrá acceso."
      contentClassName="md:max-w-2xl"
    >
      <div className="space-y-4">
        {/* Búsqueda */}
        <label className="flex h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-lg bg-slate-100 dark:bg-card">
            <div className="flex items-center justify-center pl-4 text-slate-500 dark:text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o ciudad"
              className="border-none bg-transparent h-full focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </label>

        {/* Lista */}
        <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-border">
          {isLoading && (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-muted-foreground">
              Cargando sucursales...
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-muted-foreground">
              No se encontraron sucursales
            </div>
          )}
          {!isLoading &&
            filtered.map((branch) => {
              const isSelected = draft.has(branch.id);
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => toggle(branch.id)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors border-b border-slate-100 dark:border-border last:border-b-0',
                    isSelected
                      ? 'bg-primary/5 dark:bg-primary/10'
                      : 'hover:bg-slate-50 dark:hover:bg-card/40'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-slate-300 dark:border-border'
                    )}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-card">
                    <Store className="h-4 w-4 text-slate-400 dark:text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-foreground">
                      {branch.name}
                    </p>
                    <p className="flex items-center gap-1 truncate text-xs text-slate-500 dark:text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {branch.city}, {branch.state}
                    </p>
                  </div>
                </button>
              );
            })}
        </div>

        {/* Resumen + acciones */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            {draft.size} {draft.size === 1 ? 'sucursal seleccionada' : 'sucursales seleccionadas'}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => onApply([...draft])}>
              Aplicar
            </Button>
          </div>
        </div>
      </div>
    </FormDialog>
  );
};

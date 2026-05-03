import React, { useMemo, useState } from 'react';
import { Boxes } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Switch } from '@/presentation/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { UNIT_OPTIONS, getUnitName } from '@/shared/utils/stock.utils';
import type { UnitOfMeasure, UpdateStockConfigRequest } from '@/domain/types';

interface StockConfigSectionProps {
  /** Valores actuales (vienen del backend después de GET /api/products/:id). */
  initialTrackStock: boolean;
  initialUnitOfMeasure: UnitOfMeasure | null;
  initialMinStockAlert: number | null;
  /** Llamado al hacer click en "Guardar configuración". El padre conecta con el service. */
  onSave: (config: UpdateStockConfigRequest) => Promise<void>;
  /** Indica que se está guardando (deshabilita el botón). */
  isSaving?: boolean;
}

/**
 * Sección de configuración de inventario en la edición de un producto.
 * Permite activar trackStock, definir unidad y mínimo de alerta.
 *
 * Reglas:
 * - Si trackStock=false, los inputs dependientes están ocultos (pero los valores
 *   guardados se preservan al reactivar — no los reseteamos en cliente).
 * - Si trackStock=true, la unidad es requerida (validación inline).
 * - El botón solo se habilita cuando hubo cambios respecto al estado inicial.
 *
 * NOTA: este componente NO sincroniza props → state vía useEffect (evita el
 * anti-patrón de cascading renders). El padre debe pasar un `key` que cambie
 * cuando los datos del producto se refrescan (ej. `product.updatedAt`), forzando
 * el remount y reinicializando los useState con los nuevos valores.
 */
export const StockConfigSection: React.FC<StockConfigSectionProps> = ({
  initialTrackStock,
  initialUnitOfMeasure,
  initialMinStockAlert,
  onSave,
  isSaving = false,
}) => {
  const [trackStock, setTrackStock] = useState(initialTrackStock);
  const [unitOfMeasure, setUnitOfMeasure] = useState<UnitOfMeasure | null>(initialUnitOfMeasure);
  // Lo manejamos como string para soportar el input vacío sin convertirlo a 0.
  const [minStockAlertInput, setMinStockAlertInput] = useState<string>(
    initialMinStockAlert != null ? String(initialMinStockAlert) : ''
  );
  const [unitError, setUnitError] = useState<string | null>(null);

  const parsedMinAlert = useMemo<number | null>(() => {
    const trimmed = minStockAlertInput.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    if (Number.isNaN(n) || n < 0) return null;
    return n;
  }, [minStockAlertInput]);

  const hasChanges = useMemo(() => {
    if (trackStock !== initialTrackStock) return true;
    if (unitOfMeasure !== initialUnitOfMeasure) return true;
    if (parsedMinAlert !== initialMinStockAlert) return true;
    return false;
  }, [trackStock, unitOfMeasure, parsedMinAlert, initialTrackStock, initialUnitOfMeasure, initialMinStockAlert]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnitError(null);

    if (trackStock && !unitOfMeasure) {
      setUnitError('Seleccioná una unidad de medida para activar el tracking.');
      return;
    }

    const payload: UpdateStockConfigRequest = {
      trackStock,
      unitOfMeasure: trackStock ? unitOfMeasure : null,
      minStockAlert: trackStock ? parsedMinAlert : null,
    };

    await onSave(payload);
  };

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark p-6">
      <header className="flex items-center gap-3 mb-4">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Boxes className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Inventario</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Activá el tracking para que las compras sumen stock y las ventas lo descuenten automáticamente.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Toggle trackStock */}
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="min-w-0">
            <Label htmlFor="trackStock" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Trackear stock
            </Label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Si está activo, el producto aparece en la pantalla de Stock y participa de movimientos.
            </p>
          </div>
          <Switch
            id="trackStock"
            checked={trackStock}
            onCheckedChange={setTrackStock}
          />
        </div>

        {/* Campos dependientes */}
        {trackStock && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <Label htmlFor="unitOfMeasure" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Unidad de medida <span className="text-destructive">*</span>
              </Label>
              <Select
                value={unitOfMeasure ?? undefined}
                onValueChange={(value) => {
                  setUnitOfMeasure(value as UnitOfMeasure);
                  setUnitError(null);
                }}
              >
                <SelectTrigger id="unitOfMeasure" className="mt-1">
                  <SelectValue placeholder="Elegí una unidad">
                    {unitOfMeasure ? getUnitName(unitOfMeasure) : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {unitError && (
                <p className="text-sm text-destructive mt-1">{unitError}</p>
              )}
            </div>

            <div>
              <Label htmlFor="minStockAlert" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Stock mínimo de alerta
              </Label>
              <Input
                id="minStockAlert"
                type="number"
                min="0"
                step="0.001"
                placeholder="Ej. 5"
                value={minStockAlertInput}
                onChange={(e) => setMinStockAlertInput(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Dejalo vacío si no querés alertas. Cuando el stock cae a este valor o menos, aparece en alertas.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={!hasChanges || isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar configuración'}
          </Button>
        </div>
      </form>
    </section>
  );
};

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, AlertTriangle, ShieldAlert, HelpCircle, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Textarea } from '@/presentation/components/ui/textarea';
import { SelectProductDialog } from '@/presentation/components/expenses/SelectProductDialog';
import { cn } from '@/shared/lib/utils';
import { formatUnit, getMovementReasonDescription } from '@/shared/utils/stock.utils';
import type {
  RecordWasteRequest,
  StockTableItem,
  WasteReason,
} from '@/domain/types';

const wasteReasonEnum = z.enum(['EXPIRED', 'BROKEN', 'THEFT', 'OTHER']);

const wasteSchema = z.object({
  productId: z.string().uuid('Seleccioná un producto'),
  quantity: z.number().positive('La cantidad debe ser mayor a 0'),
  reason: wasteReasonEnum,
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

type WasteFormValues = z.infer<typeof wasteSchema>;

// Cada motivo trae el label centralizado en stock.utils (MOVEMENT_REASON_OPTIONS) +
// el ícono que solo aplica acá (decoración del dialog).
const WASTE_REASON_ICONS: Record<WasteReason, typeof Trash2> = {
  EXPIRED: AlertTriangle,
  BROKEN: Trash2,
  THEFT: ShieldAlert,
  OTHER: HelpCircle,
};

const WASTE_REASONS: WasteReason[] = ['EXPIRED', 'BROKEN', 'THEFT', 'OTHER'];

interface RegisterWasteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Lista de productos trackeados (de GET /api/products/stock). El padre la pasa pre-cargada. */
  trackedProducts: StockTableItem[];
  /** Si se preselecciona un producto al abrir (ej. desde una fila de la tabla). */
  initialProductId?: string | null;
  /** El padre se conecta con stockService.recordWaste y muestra toasts. */
  onSubmit: (body: RecordWasteRequest) => Promise<void>;
  isSubmitting?: boolean;
}

export const RegisterWasteDialog: React.FC<RegisterWasteDialogProps> = ({
  open,
  onOpenChange,
  trackedProducts,
  initialProductId,
  onSubmit,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<WasteFormValues>({
    resolver: zodResolver(wasteSchema),
    defaultValues: {
      productId: initialProductId ?? '',
      quantity: undefined as unknown as number,
      reason: undefined as unknown as WasteReason,
      notes: '',
    },
  });

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Reset en cada transición de `open`:
  //  - Al abrir: deja el form limpio (con el productId inicial si vino).
  //  - Al cerrar: borra cualquier residuo del intento anterior (cancel, submit error, ESC, click fuera).
  // Sin esto, si el owner abre, escribe, cancela y vuelve a abrir, vería el draft viejo
  // por un instante antes del próximo reset.
  React.useEffect(() => {
    reset({
      productId: open ? (initialProductId ?? '') : '',
      quantity: undefined as unknown as number,
      reason: undefined as unknown as WasteReason,
      notes: '',
    });
    if (!open) {
      setIsPickerOpen(false);
    }
  }, [open, initialProductId, reset]);

  const selectedProductId = watch('productId');
  const selectedProduct = trackedProducts.find((p) => p.productId === selectedProductId);
  const reasonValue = watch('reason');

  // Mapear los items de stock al formato del dialog reusable.
  const productOptions = trackedProducts.map((p) => ({
    id: p.productId,
    name: p.name,
    status: p.trackStock,
    trackStock: p.trackStock,
  }));

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      productId: values.productId,
      quantity: Number(values.quantity),
      reason: values.reason,
      notes: values.notes?.trim() || null,
    });
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full md:w-[42vw] max-h-[90vh] overflow-y-auto">
          <DialogClose />
          <DialogHeader>
            <DialogTitle>Registrar merma</DialogTitle>
          </DialogHeader>

          <form onSubmit={submit} className="flex flex-col gap-5 mt-2">
            {/* Producto — botón que abre el dialog */}
            <div>
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Producto <span className="text-destructive">*</span>
              </Label>
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className={cn(
                  'mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium text-left transition-colors',
                  'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800',
                  !selectedProduct && 'text-slate-400 dark:text-slate-500'
                )}
              >
                <Package className="h-4 w-4 flex-shrink-0 text-slate-500 dark:text-slate-400" />
                <span className="truncate flex-1">
                  {selectedProduct
                    ? `${selectedProduct.name}${selectedProduct.unitOfMeasure ? ` (${formatUnit(selectedProduct.unitOfMeasure)})` : ''}`
                    : 'Elegir producto...'}
                </span>
              </button>
              {/* Hidden controller para mantener el campo en RHF */}
              <Controller name="productId" control={control} render={() => <></>} />
              {errors.productId && (
                <p className="text-sm text-destructive mt-1">{errors.productId.message}</p>
              )}
            </div>

            {/* Cantidad */}
            <div>
              <Label htmlFor="quantity" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Cantidad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.001"
                placeholder={selectedProduct?.unitOfMeasure ? `Ej. 0.5 ${formatUnit(selectedProduct.unitOfMeasure)}` : 'Ej. 0.5'}
                className="mt-1"
                {...register('quantity', { valueAsNumber: true })}
              />
              {selectedProduct?.unitOfMeasure && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Unidad del producto: <strong>{formatUnit(selectedProduct.unitOfMeasure)}</strong>
                </p>
              )}
              {errors.quantity && (
                <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>
              )}
            </div>

            {/* Motivo */}
            <div>
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Motivo <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <div role="radiogroup" className="grid grid-cols-2 gap-2 mt-1">
                    {WASTE_REASONS.map((value) => {
                      const checked = field.value === value;
                      const Icon = WASTE_REASON_ICONS[value];
                      const label = getMovementReasonDescription(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={checked}
                          onClick={() => field.onChange(value)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                            checked
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          )}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              {errors.reason && (
                <p className="text-sm text-destructive mt-1">{errors.reason.message ?? 'Seleccioná un motivo'}</p>
              )}
              {!errors.reason && !reasonValue && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Seleccioná uno antes de registrar.
                </p>
              )}
            </div>

            {/* Notas */}
            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Notas (opcional)
              </Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Detalle adicional para auditoría..."
                className="mt-1"
                {...register('notes')}
              />
              {errors.notes && (
                <p className="text-sm text-destructive mt-1">{errors.notes.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : 'Registrar merma'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Picker de producto reusado del módulo de gastos */}
      <SelectProductDialog
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        products={productOptions}
        onlyTracked
        onSelect={(product) => {
          setValue('productId', product.id, { shouldValidate: true });
          setIsPickerOpen(false);
        }}
      />
    </>
  );
};

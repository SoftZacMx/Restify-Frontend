import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowDown, ArrowUp, Minus, Package, AlertTriangle } from 'lucide-react';
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
import { formatStockQuantity, formatUnit } from '@/shared/utils/stock.utils';
import type { RecordAdjustmentRequest, StockTableItem } from '@/domain/types';

const adjustSchema = z.object({
  productId: z.string().uuid('Seleccioná un producto'),
  newStock: z.number().min(0, 'El nuevo stock no puede ser negativo'),
  reason: z.string().min(1, 'El motivo es obligatorio').max(120, 'Máximo 120 caracteres'),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

type AdjustFormValues = z.infer<typeof adjustSchema>;

interface AdjustStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trackedProducts: StockTableItem[];
  initialProductId?: string | null;
  onSubmit: (body: RecordAdjustmentRequest) => Promise<void>;
  isSubmitting?: boolean;
}

export const AdjustStockDialog: React.FC<AdjustStockDialogProps> = ({
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
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AdjustFormValues>({
    resolver: zodResolver(adjustSchema),
    defaultValues: {
      productId: initialProductId ?? '',
      newStock: undefined as unknown as number,
      reason: '',
      notes: '',
    },
  });

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  React.useEffect(() => {
    if (open) {
      reset({
        productId: initialProductId ?? '',
        newStock: undefined as unknown as number,
        reason: '',
        notes: '',
      });
    }
  }, [open, initialProductId, reset]);

  const selectedProductId = watch('productId');
  const newStockValue = watch('newStock');
  const selectedProduct = trackedProducts.find((p) => p.productId === selectedProductId);

  const productOptions = trackedProducts.map((p) => ({
    id: p.productId,
    name: p.name,
    status: p.trackStock,
    trackStock: p.trackStock,
  }));

  // Preview de la diferencia.
  const diff =
    selectedProduct && typeof newStockValue === 'number' && !Number.isNaN(newStockValue)
      ? newStockValue - selectedProduct.stockActual
      : null;

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      productId: values.productId,
      newStock: Number(values.newStock),
      reason: values.reason.trim(),
      notes: values.notes?.trim() || null,
    });
  });

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full md:w-[42vw] max-h-[90vh] overflow-y-auto">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>Ajustar stock (conteo físico)</DialogTitle>
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
                  : 'Elegir producto trackeado...'}
              </span>
            </button>
            {errors.productId && (
              <p className="text-sm text-destructive mt-1">{errors.productId.message}</p>
            )}
          </div>

          {/* Stock actual (readonly) */}
          {selectedProduct && (
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 dark:text-slate-400">Stock actual</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-white mt-0.5">
                {formatStockQuantity(selectedProduct.stockActual, selectedProduct.unitOfMeasure)}
              </div>
            </div>
          )}

          {/* Nuevo stock */}
          <div>
            <Label htmlFor="newStock" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nuevo stock <span className="text-destructive">*</span>
            </Label>
            <Input
              id="newStock"
              type="number"
              min="0"
              step="0.001"
              placeholder="Stock contado físicamente"
              className="mt-1"
              {...register('newStock', { valueAsNumber: true })}
            />
            {errors.newStock && (
              <p className="text-sm text-destructive mt-1">{errors.newStock.message}</p>
            )}

            {/* Preview de la diferencia */}
            {diff != null && selectedProduct && (
              <div
                className={cn(
                  'mt-2 flex items-center gap-2 text-sm rounded-md px-3 py-2 border',
                  diff > 0 && 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
                  diff < 0 && 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
                  diff === 0 && 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                )}
              >
                {diff > 0 && <ArrowUp className="h-4 w-4 flex-shrink-0" />}
                {diff < 0 && <ArrowDown className="h-4 w-4 flex-shrink-0" />}
                {diff === 0 && <Minus className="h-4 w-4 flex-shrink-0" />}
                <span>
                  Stock pasará de{' '}
                  <strong>{formatStockQuantity(selectedProduct.stockActual, selectedProduct.unitOfMeasure)}</strong>{' '}
                  a <strong>{formatStockQuantity(newStockValue, selectedProduct.unitOfMeasure)}</strong>{' '}
                  (diferencia:{' '}
                  <strong>
                    {diff > 0 ? '+' : ''}
                    {formatStockQuantity(diff, selectedProduct.unitOfMeasure)}
                  </strong>
                  )
                </span>
              </div>
            )}

            {/* Warning para ajustes positivos: deberían venir por compra de mercadería. */}
            {diff != null && diff > 0 && selectedProduct && (
              <div className="mt-2 flex items-start gap-2 text-sm rounded-md px-3 py-2 border bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Estás sumando producto al stock sin una compra asociada.</p>
                  <p className="mt-1 text-xs">
                    Si recibiste mercadería, registralo como{' '}
                    <strong>gasto de mercancía</strong> para mantener trazabilidad contable.
                    Solo usá ajuste positivo para inventario inicial o correcciones.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Motivo */}
          <div>
            <Label htmlFor="reason" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Motivo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reason"
              type="text"
              placeholder="Ej. Conteo físico — viernes 03/05"
              className="mt-1"
              maxLength={120}
              {...register('reason')}
            />
            {errors.reason && (
              <p className="text-sm text-destructive mt-1">{errors.reason.message}</p>
            )}
          </div>

          {/* Notas */}
          <div>
            <Label htmlFor="adj-notes" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Notas (opcional)
            </Label>
            <Textarea
              id="adj-notes"
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
              {isSubmitting ? 'Guardando...' : 'Guardar ajuste'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    {/* Picker reusado del módulo de gastos */}
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

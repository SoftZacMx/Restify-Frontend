import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Boxes } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';
import { Switch } from '@/presentation/components/ui/switch';
import { Textarea } from '@/presentation/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { productFormSchema, type ProductFormValues } from '@/shared/schemas/product.schema';
import { UNIT_OPTIONS, getUnitName } from '@/shared/utils/stock.utils';
import type {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  UnitOfMeasure,
} from '@/domain/types';
import { cn } from '@/shared/lib/utils';

interface ProductFormProps {
  initialData?: ProductResponse | null;
  onSubmit: (productData: CreateProductRequest | UpdateProductRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      status: initialData?.status ?? true,
      // En creación, trackStock arranca en true (caso por defecto del owner).
      trackStock: initialData?.trackStock ?? !isEditMode,
      unitOfMeasure: initialData?.unitOfMeasure ?? null,
      minStockAlert: initialData?.minStockAlert ?? null,
    },
  });

  const name = watch('name');
  const description = watch('description');
  const status = watch('status');
  const trackStock = watch('trackStock');
  const unitOfMeasure = watch('unitOfMeasure');

  // El input numérico se maneja como string para soportar el caso vacío sin coerce a 0.
  const [minStockInput, setMinStockInput] = useState<string>(
    initialData?.minStockAlert != null ? String(initialData.minStockAlert) : ''
  );
  const [unitError, setUnitError] = useState<string | null>(null);

  const handleMinStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setMinStockInput(raw);
    if (!raw.trim()) {
      setValue('minStockAlert', null, { shouldDirty: true });
      return;
    }
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0) {
      setValue('minStockAlert', n, { shouldDirty: true, shouldValidate: true });
    }
  };

  const onFormSubmit = async (data: ProductFormValues) => {
    setUnitError(null);
    // Si trackStock=true (solo en creación), requerimos unidad.
    if (!isEditMode && data.trackStock && !data.unitOfMeasure) {
      setUnitError('Seleccioná una unidad de medida para activar el tracking.');
      return;
    }

    if (isEditMode) {
      const updateData: UpdateProductRequest = {};
      if (data.name !== initialData!.name) updateData.name = data.name;
      const initialDesc = initialData!.description ?? '';
      if ((data.description ?? '') !== initialDesc) updateData.description = data.description?.trim() || null;
      if (data.status !== initialData!.status) updateData.status = data.status;
      // Stock config en edición: se maneja en StockConfigSection del detalle, no aquí.
      await onSubmit(updateData);
    } else {
      // En creación enviamos también la stock config.
      const createData: CreateProductRequest = {
        name: data.name,
        description: data.description || null,
        status: data.status,
        userId: '', // se setea en el padre con el user logueado
        trackStock: data.trackStock,
        unitOfMeasure: data.trackStock ? data.unitOfMeasure ?? null : null,
        minStockAlert: data.trackStock ? data.minStockAlert ?? null : null,
      };
      await onSubmit(createData);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Nombre <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          {...register('name')}
          placeholder="Ej: Coca Cola 500ml"
          className={cn(errors.name && 'border-destructive')}
          maxLength={200}
          disabled={isLoading}
          aria-required
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        <p className="text-xs text-slate-500 dark:text-slate-400">{name.length}/200 caracteres</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">Descripción</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Descripción del producto (opcional)"
          className={cn('min-h-[100px] resize-y', errors.description && 'border-destructive')}
          maxLength={1000}
          disabled={isLoading}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
        <p className="text-xs text-slate-500 dark:text-slate-400">{(description || '').length}/1000 caracteres</p>
      </div>

      <div className="flex items-center justify-between space-x-2 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="space-y-0.5">
          <Label htmlFor="status" className="text-sm font-medium">Estado</Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {status ? 'Producto activo' : 'Producto inactivo'}
          </p>
        </div>
        <Switch
          id="status"
          checked={status}
          onCheckedChange={(checked) => setValue('status', checked)}
          disabled={isLoading}
        />
      </div>

      {/* Stock config — solo visible en creación (edición se hace desde StockConfigSection del detalle). */}
      {!isEditMode && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary mt-0.5">
              <Boxes className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Label htmlFor="trackStock" className="text-sm font-medium cursor-pointer">
                    Trackear stock
                  </Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Activado por defecto. Si lo desactivás, el producto se crea sin tracking
                    y no podrá usarse en recetas hasta que lo actives.
                  </p>
                </div>
                <Switch
                  id="trackStock"
                  checked={trackStock}
                  onCheckedChange={(checked) => setValue('trackStock', checked, { shouldDirty: true })}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {trackStock && (
            <div className="pl-11 space-y-3">
              <div>
                <Label htmlFor="unitOfMeasure" className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Unidad de medida <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={unitOfMeasure ?? undefined}
                  onValueChange={(value) => {
                    setValue('unitOfMeasure', value as UnitOfMeasure, { shouldDirty: true, shouldValidate: true });
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
                {unitError && <p className="text-sm text-destructive mt-1">{unitError}</p>}
              </div>

              <div>
                <Label htmlFor="minStockAlert" className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Stock mínimo de alerta
                </Label>
                <Input
                  id="minStockAlert"
                  type="number"
                  min="0"
                  step="0.001"
                  placeholder="Ej. 5"
                  className="mt-1"
                  value={minStockInput}
                  onChange={handleMinStockChange}
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Dejalo vacío si no querés alertas automáticas.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};

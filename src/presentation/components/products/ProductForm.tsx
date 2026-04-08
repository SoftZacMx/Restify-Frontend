import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';
import { Switch } from '@/presentation/components/ui/switch';
import { Textarea } from '@/presentation/components/ui/textarea';
import { productFormSchema, type ProductFormValues } from '@/shared/schemas/product.schema';
import type {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
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
    },
  });

  const name = watch('name');
  const description = watch('description');
  const status = watch('status');

  const onFormSubmit = async (data: ProductFormValues) => {
    if (isEditMode) {
      const updateData: UpdateProductRequest = {};
      if (data.name !== initialData!.name) updateData.name = data.name;
      const initialDesc = initialData!.description ?? '';
      if ((data.description ?? '') !== initialDesc) updateData.description = data.description?.trim() || null;
      if (data.status !== initialData!.status) updateData.status = data.status;
      await onSubmit(updateData);
    } else {
      await onSubmit(data as CreateProductRequest);
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

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};

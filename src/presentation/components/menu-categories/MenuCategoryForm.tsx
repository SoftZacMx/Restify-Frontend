import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';
import { Switch } from '@/presentation/components/ui/switch';
import { menuCategoryFormSchema, type MenuCategoryFormValues } from '@/shared/schemas/menu-category.schema';
import type {
  MenuCategoryResponse,
  CreateMenuCategoryRequest,
  UpdateMenuCategoryRequest,
} from '@/domain/types';
import { cn } from '@/shared/lib/utils';

interface MenuCategoryFormProps {
  initialData?: MenuCategoryResponse | null;
  onSubmit: (categoryData: CreateMenuCategoryRequest | UpdateMenuCategoryRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const MenuCategoryForm: React.FC<MenuCategoryFormProps> = ({
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
  } = useForm<MenuCategoryFormValues>({
    resolver: zodResolver(menuCategoryFormSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      status: initialData?.status ?? true,
    },
  });

  const name = watch('name');
  const status = watch('status');

  const onFormSubmit = async (data: MenuCategoryFormValues) => {
    if (isEditMode) {
      const updateData: UpdateMenuCategoryRequest = {};
      if (data.name !== initialData!.name) updateData.name = data.name;
      if (data.status !== initialData!.status) updateData.status = data.status;
      await onSubmit(updateData);
    } else {
      await onSubmit(data);
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
          placeholder="Ej: Bebidas, Postres, Platos Fuertes"
          className={cn(errors.name && 'border-destructive')}
          maxLength={200}
          disabled={isLoading}
          aria-required
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        <p className="text-xs text-slate-500 dark:text-slate-400">{name.length}/200 caracteres</p>
      </div>

      <div className="flex items-center justify-between space-x-2 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="space-y-0.5">
          <Label htmlFor="status" className="text-sm font-medium">Estado</Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {status ? 'Categoría activa' : 'Categoría inactiva'}
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

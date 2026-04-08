import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, FolderOpen } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';
import { Switch } from '@/presentation/components/ui/switch';
import { menuItemFormSchema, type MenuItemFormValues } from '@/shared/schemas/menu-item.schema';
import type {
  MenuItemResponse,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  MenuCategoryResponse,
} from '@/domain/types';
import { cn } from '@/shared/lib/utils';
import { menuCategoryService } from '@/application/services';
import { SelectCategoryDialog } from './SelectCategoryDialog';

interface MenuItemFormProps {
  initialData?: MenuItemResponse | null;
  onSubmit: (menuItemData: CreateMenuItemRequest | UpdateMenuItemRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
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
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      price: initialData?.price ?? 0,
      status: initialData?.status ?? true,
      isExtra: initialData?.isExtra ?? false,
      categoryId: initialData?.categoryId ?? undefined,
    },
  });

  const name = watch('name');
  const price = watch('price');
  const status = watch('status');
  const isExtra = watch('isExtra');
  const categoryId = watch('categoryId');

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categories, setCategories] = useState<MenuCategoryResponse[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const activeCategories = await menuCategoryService.listMenuCategories({ status: true });
        const withoutExtras = activeCategories.filter(
          (cat) => cat.name?.toLowerCase() !== 'extras'
        );
        setCategories(withoutExtras);
      } catch {
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handlePriceChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    const numValue = numericValue === '' ? 0 : parseFloat(numericValue);
    setValue('price', isNaN(numValue) ? 0 : numValue, { shouldValidate: true });
  };

  const onFormSubmit = async (data: MenuItemFormValues) => {
    if (isEditMode) {
      const updateData: UpdateMenuItemRequest = {};
      if (data.name !== initialData!.name) updateData.name = data.name;
      if (data.price !== initialData!.price) updateData.price = data.price;
      if (data.status !== initialData!.status) updateData.status = data.status;
      if (data.isExtra !== initialData!.isExtra) updateData.isExtra = data.isExtra;
      if (data.categoryId !== initialData!.categoryId) updateData.categoryId = data.categoryId || undefined;
      await onSubmit(updateData);
    } else {
      const createData = {
        name: data.name,
        price: data.price,
        status: data.status,
        isExtra: data.isExtra,
        ...(data.categoryId && { categoryId: data.categoryId }),
      } as Omit<CreateMenuItemRequest, 'userId'>;
      await onSubmit(createData as CreateMenuItemRequest);
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
          placeholder="Ej: Hamburguesa Clásica"
          className={cn(errors.name && 'border-destructive')}
          maxLength={200}
          disabled={isLoading}
          aria-required
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        <p className="text-xs text-slate-500 dark:text-slate-400">{name.length}/200 caracteres</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="price" className="text-sm font-medium">
          Precio <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">$</span>
          <Input
            id="price"
            type="text"
            value={price === 0 ? '' : price.toString()}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="0.00"
            className={cn('pl-8', errors.price && 'border-destructive')}
            disabled={isLoading}
            aria-required
          />
        </div>
        {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
        <p className="text-xs text-slate-500 dark:text-slate-400">Máximo 2 decimales (ej: 15.50)</p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Categoría</Label>
        {isLoadingCategories ? (
          <div className="flex items-center gap-2 h-10 px-3 text-sm text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando categorías...</span>
          </div>
        ) : categoryId ? (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 dark:text-white">
                {categories.find((c) => c.id === categoryId)?.name ?? 'Categoría'}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setCategoryDialogOpen(true)} disabled={isLoading}>
              Cambiar
            </Button>
          </div>
        ) : (
          <Button
            type="button" variant="outline"
            className={cn('w-full justify-start text-slate-500', errors.categoryId && 'border-destructive')}
            onClick={() => setCategoryDialogOpen(true)} disabled={isLoading}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Seleccionar categoría
          </Button>
        )}
        <SelectCategoryDialog
          open={categoryDialogOpen}
          onOpenChange={setCategoryDialogOpen}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          onSelect={(category) => setValue('categoryId', category?.id ?? undefined)}
        />
        {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
        <p className="text-xs text-slate-500 dark:text-slate-400">Selecciona la categoría del menú a la que pertenece el platillo</p>
      </div>

      <div className="flex items-center justify-between space-x-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
        <div className="space-y-0.5">
          <Label htmlFor="isExtra" className="text-sm font-medium">Es un Extra</Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isExtra ? 'Este platillo es un extra que se puede agregar a otros platillos' : 'Este es un platillo normal del menú'}
          </p>
        </div>
        <Switch id="isExtra" checked={isExtra} onCheckedChange={(checked) => setValue('isExtra', checked)} disabled={isLoading} />
      </div>

      <div className="flex items-center justify-between space-x-2 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="space-y-0.5">
          <Label htmlFor="status" className="text-sm font-medium">Estado</Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {status ? 'Platillo activo' : 'Platillo inactivo'}
          </p>
        </div>
        <Switch id="status" checked={status} onCheckedChange={(checked) => setValue('status', checked)} disabled={isLoading} />
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

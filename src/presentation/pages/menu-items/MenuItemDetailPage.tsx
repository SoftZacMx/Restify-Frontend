import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FolderOpen,
  MoreVertical,
  Save,
  Trash2,
} from 'lucide-react';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Badge } from '@/presentation/components/ui/badge';
import { Card } from '@/presentation/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/presentation/components/ui/confirm-dialog';
import { SelectCategoryDialog } from '@/presentation/components/menu-items/SelectCategoryDialog';
import { RecipeEditor } from '@/presentation/components/menu-items/RecipeEditor';
import { menuItemService, menuCategoryService } from '@/application/services';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';
import { menuItemFormSchema, type MenuItemFormValues } from '@/shared/schemas/menu-item.schema';
import type { MenuItemResponse, MenuCategoryResponse } from '@/domain/types';
import { cn } from '@/shared/lib/utils';
import { APP_TIMEZONE } from '@/shared/constants';

const MenuItemDetailPage: React.FC = () => {
  const { menuItemId } = useParams<{ menuItemId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // MenuItem viene de state al navegar desde la lista (instantáneo) y se refresca contra la API.
  const menuItemFromState = (location.state as { menuItem?: MenuItemResponse } | null)?.menuItem;

  const { data: menuItem, error, refetch } = useQuery({
    queryKey: ['menuItem', menuItemId],
    queryFn: async () => {
      if (!menuItemId) throw new Error('Menu item ID is required');
      return await menuItemService.getMenuItemById(menuItemId);
    },
    enabled: !!menuItemId,
    placeholderData: menuItemFromState ?? undefined,
  });

  const { data: categories = [] } = useQuery<MenuCategoryResponse[]>({
    queryKey: ['menu-categories'],
    queryFn: () => menuCategoryService.listMenuCategories(),
    staleTime: 5 * 60_000,
  });

  // Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: menuItem?.name ?? '',
      price: menuItem?.price ?? 0,
      status: menuItem?.status ?? true,
      isExtra: menuItem?.isExtra ?? false,
      categoryId: menuItem?.categoryId ?? undefined,
    },
  });

  const categoryId = watch('categoryId');
  const [priceInput, setPriceInput] = useState('');

  // Sincronizar form cuando llega data del backend.
  useEffect(() => {
    if (!menuItem) return;
    reset({
      name: menuItem.name,
      price: menuItem.price,
      status: menuItem.status,
      isExtra: menuItem.isExtra,
      categoryId: menuItem.categoryId ?? undefined,
    });
    setPriceInput(menuItem.price ? menuItem.price.toString() : '');
  }, [menuItem, reset]);

  React.useEffect(() => {
    if (error) {
      const msg = error instanceof AppError ? error.message : 'No se pudo obtener el platillo';
      showErrorToast('Error al cargar platillo', msg);
    }
  }, [error]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? null,
    [categories, categoryId]
  );

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setPriceInput(raw);
    const parsed = parseFloat(raw);
    setValue('price', Number.isFinite(parsed) ? parsed : 0, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSave = handleSubmit(async (values) => {
    if (!menuItemId) return;
    setIsSaving(true);
    try {
      await menuItemService.updateMenuItem(menuItemId, {
        name: values.name,
        price: values.price,
        status: values.status,
        isExtra: values.isExtra,
        categoryId: values.categoryId,
      });
      showSuccessToast('Platillo actualizado', 'Los cambios se guardaron correctamente');
      await queryClient.invalidateQueries({ queryKey: ['menuItem', menuItemId] });
      await queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      await refetch();
    } catch (err) {
      const msg = err instanceof AppError ? err.message : 'Ocurrió un error inesperado';
      showErrorToast('Error al guardar', msg);
    } finally {
      setIsSaving(false);
    }
  });

  const handleToggleStatus = async () => {
    if (!menuItemId || !menuItem) return;
    try {
      await menuItemService.updateMenuItem(menuItemId, { status: !menuItem.status });
      showSuccessToast(
        'Estado actualizado',
        menuItem.status ? 'Platillo desactivado' : 'Platillo activado'
      );
      await queryClient.invalidateQueries({ queryKey: ['menuItem', menuItemId] });
      await queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      await refetch();
    } catch (err) {
      const msg = err instanceof AppError ? err.message : 'Ocurrió un error inesperado';
      showErrorToast('Error al cambiar estado', msg);
    }
  };

  const handleDelete = async () => {
    if (!menuItemId) return;
    setIsDeleting(true);
    try {
      await menuItemService.deleteMenuItem(menuItemId);
      showSuccessToast('Platillo eliminado', 'Se quitó del menú correctamente');
      await queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      navigate('/menu/items');
    } catch (err) {
      const msg = err instanceof AppError ? err.message : 'Ocurrió un error inesperado';
      showErrorToast('Error al eliminar', msg);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  if (!menuItem) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-slate-500 dark:text-slate-400 text-lg">Cargando platillo...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 mb-4 text-sm">
          <Link
            to="/menu/items"
            className="text-slate-500 dark:text-slate-400 font-medium hover:text-primary transition-colors"
          >
            Platillos
          </Link>
          <span className="text-slate-500 dark:text-slate-400">/</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium">{menuItem.name}</span>
        </div>

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/menu/items')}
              aria-label="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                Editando platillo
              </p>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {menuItem.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={handleToggleStatus} className="cursor-pointer">
                  {menuItem.status ? 'Desactivar platillo' : 'Activar platillo'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setIsDeleteOpen(true)}
                  className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={onSave} disabled={!isDirty || isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </header>

        {/* Grid 2-col */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información general (col-span 2) */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Información general
              </h2>
              <Badge
                className={cn(
                  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border-0',
                  menuItem.status
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                )}
              >
                {menuItem.status ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>

            <form onSubmit={onSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold"
                  >
                    Nombre del platillo
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ej. Hotcakes"
                    className="mt-1"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="price"
                    className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold"
                  >
                    Precio (MXN)
                  </Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
                      $
                    </span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="60.00"
                      className="pl-7"
                      value={priceInput}
                      onChange={handlePriceChange}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Categoría
                </Label>
                <button
                  type="button"
                  onClick={() => setCategoryDialogOpen(true)}
                  className={cn(
                    'mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium text-left transition-colors h-10',
                    'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800',
                    !selectedCategory && 'text-slate-400 dark:text-slate-500'
                  )}
                >
                  <FolderOpen className="h-4 w-4 flex-shrink-0 text-slate-500 dark:text-slate-400" />
                  <span className="truncate flex-1">
                    {selectedCategory?.name ?? 'Sin categoría'}
                  </span>
                </button>
                {errors.categoryId && (
                  <p className="text-sm text-destructive mt-1">{errors.categoryId.message}</p>
                )}
              </div>
            </form>
          </Card>

          {/* Cronología */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-5">
              Cronología
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                    Fecha de creación
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                    {new Date(menuItem.createdAt).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      timeZone: APP_TIMEZONE,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                    Última actualización
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                    {new Date(menuItem.updatedAt).toLocaleString('es-MX', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: APP_TIMEZONE,
                    })}
                  </p>
                </div>
              </div>

              {menuItem.isExtra && (
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Este platillo es un <strong>extra</strong> — solo se vende como complemento.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Receta */}
        {menuItemId && !menuItem.isExtra && (
          <div className="mt-6">
            <RecipeEditor menuItemId={menuItemId} />
          </div>
        )}
      </div>

      {/* Dialog de selección de categoría */}
      <SelectCategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        onSelect={(category) => {
          setValue('categoryId', category?.id, { shouldDirty: true, shouldValidate: true });
          setCategoryDialogOpen(false);
        }}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="¿Eliminar platillo?"
        description={
          <>
            Estás a punto de eliminar el platillo{' '}
            <strong className="text-slate-900 dark:text-white">{menuItem.name}</strong>.
            <br />
            <br />
            Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </MainLayout>
  );
};

export default MenuItemDetailPage;

import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ChefHat, Package } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { ConfirmDialog } from '@/presentation/components/ui/confirm-dialog';
import { SelectProductDialog } from '@/presentation/components/expenses/SelectProductDialog';
import { recipeService, productService } from '@/application/services';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { AppError } from '@/domain/errors';
import { getCompatibleUnits, getUnitName, UNIT_OPTIONS } from '@/shared/utils/stock.utils';
import { cn } from '@/shared/lib/utils';
import type {
  GetRecipeResponse,
  ProductResponse,
  RecipeIngredientDraft,
  RecipeIngredientResponse,
  UnitOfMeasure,
} from '@/domain/types';

interface RecipeEditorProps {
  menuItemId: string;
  /**
   * Indica si el MenuItem es un extra. Cambia el copy contextual: la receta del extra
   * se descuenta cuando el extra se vende junto con un platillo principal.
   */
  isExtra?: boolean;
}

function generateRowId(): string {
  return `row-${Math.random().toString(36).slice(2, 10)}`;
}

function toDraft(
  ing: RecipeIngredientResponse
): RecipeIngredientDraft {
  return {
    rowId: ing.productId,
    productId: ing.productId,
    productName: ing.productName,
    quantity: ing.quantity,
    unit: ing.unit ?? null,
    productUnit: ing.productUnitOfMeasure ?? null,
  };
}

export const RecipeEditor: React.FC<RecipeEditorProps> = ({ menuItemId, isExtra = false }) => {
  const queryClient = useQueryClient();

  // Receta actual
  const {
    data: recipe,
    isLoading: isLoadingRecipe,
    error: recipeError,
  } = useQuery<GetRecipeResponse>({
    queryKey: ['recipe', menuItemId],
    queryFn: () => recipeService.getRecipe(menuItemId),
    enabled: !!menuItemId,
  });

  // Productos disponibles para el dialog
  const {
    data: products = [],
    isLoading: isLoadingProducts,
  } = useQuery<ProductResponse[]>({
    queryKey: ['products', { status: true }],
    queryFn: () => productService.listProducts({ status: true }),
    staleTime: 60_000,
  });

  // Estado local: drafts editables
  const [drafts, setDrafts] = useState<RecipeIngredientDraft[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Para abrir el SelectProductDialog asociado a una fila particular.
  const [pickerRowId, setPickerRowId] = useState<string | null>(null);

  // Sync drafts cuando entra la receta del backend.
  const initialDraftsKey = useMemo(
    () => recipe?.ingredients.map((i) => `${i.productId}:${i.quantity}:${i.unit ?? ''}`).join('|') ?? '',
    [recipe]
  );
  const [lastSyncedKey, setLastSyncedKey] = useState<string | null>(null);
  React.useEffect(() => {
    if (recipe && initialDraftsKey !== lastSyncedKey) {
      setDrafts(recipe.ingredients.map(toDraft));
      setLastSyncedKey(initialDraftsKey);
    }
  }, [recipe, initialDraftsKey, lastSyncedKey]);

  // Validación cliente
  const validation = useMemo(() => {
    if (drafts.length === 0) {
      return { valid: false, message: null as string | null };
    }
    const seen = new Set<string>();
    for (const d of drafts) {
      if (!d.productId) return { valid: false, message: 'Hay una fila sin producto seleccionado' };
      if (seen.has(d.productId))
        return { valid: false, message: 'No podés repetir el mismo producto' };
      seen.add(d.productId);
      const n = Number(d.quantity);
      if (!Number.isFinite(n) || n <= 0)
        return { valid: false, message: 'Las cantidades deben ser mayores a 0' };
    }
    return { valid: true, message: null };
  }, [drafts]);

  const hasChanges = useMemo(() => {
    if (!recipe) return false;
    if (drafts.length !== recipe.ingredients.length) return true;
    const recipeMap = new Map(
      recipe.ingredients.map((i) => [i.productId, { qty: i.quantity, unit: i.unit ?? null }])
    );
    return drafts.some((d) => {
      const orig = recipeMap.get(d.productId);
      if (!orig) return true;
      if (String(orig.qty) !== String(d.quantity)) return true;
      if (orig.unit !== d.unit) return true;
      return false;
    });
  }, [drafts, recipe]);

  // Handlers
  const updateRow = (rowId: string, patch: Partial<RecipeIngredientDraft>) => {
    setDrafts((prev) => prev.map((d) => (d.rowId === rowId ? { ...d, ...patch } : d)));
  };

  const removeRow = (rowId: string) => {
    setDrafts((prev) => prev.filter((d) => d.rowId !== rowId));
  };

  const addRow = () => {
    const newRow: RecipeIngredientDraft = {
      rowId: generateRowId(),
      productId: '',
      productName: '',
      quantity: '',
      unit: null,
      productUnit: null,
    };
    setDrafts((prev) => [...prev, newRow]);
    // Abrir el picker automáticamente para la fila nueva.
    setPickerRowId(newRow.rowId);
  };

  // Productos filtrados para el dialog (excluye los ya elegidos en otras filas).
  const availableProductsForRow = (rowId: string) => {
    const usedIds = new Set(
      drafts.filter((d) => d.rowId !== rowId && d.productId).map((d) => d.productId)
    );
    return products.filter((p) => !usedIds.has(p.id));
  };

  const handleProductPicked = (rowId: string, product: { id: string; name: string }) => {
    const fullProduct = products.find((p) => p.id === product.id);
    const productUnit = fullProduct?.unitOfMeasure ?? null;
    updateRow(rowId, {
      productId: product.id,
      productName: product.name,
      productUnit,
      // Por defecto, la unidad del ingrediente arranca igual a la del producto.
      unit: productUnit,
    });
  };

  const handleSave = async () => {
    if (!validation.valid) {
      showErrorToast('No se puede guardar', validation.message ?? 'Revisá los datos');
      return;
    }
    setIsSaving(true);
    try {
      await recipeService.replaceRecipe(menuItemId, {
        ingredients: drafts.map((d) => ({
          productId: d.productId,
          quantity: Number(d.quantity),
          unit: d.unit ?? null,
        })),
      });
      showSuccessToast('Receta guardada', 'Los ingredientes se actualizaron correctamente');
      await queryClient.invalidateQueries({ queryKey: ['recipe', menuItemId] });
    } catch (err) {
      const msg = err instanceof AppError ? err.message : 'Ocurrió un error inesperado';
      showErrorToast('Error al guardar receta', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!recipe || recipe.ingredients.length === 0) return;
    setIsDeleting(true);
    try {
      for (const ing of recipe.ingredients) {
        await recipeService.removeIngredient(menuItemId, ing.productId);
      }
      showSuccessToast('Receta borrada', 'El platillo ya no tiene ingredientes asignados');
      await queryClient.invalidateQueries({ queryKey: ['recipe', menuItemId] });
      setIsDeleteOpen(false);
    } catch (err) {
      const msg = err instanceof AppError ? err.message : 'Ocurrió un error inesperado';
      showErrorToast('Error al borrar receta', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const isDirectItem =
    recipeError instanceof AppError && recipeError.code === 'RECIPE_NOT_ALLOWED_ON_DIRECT_ITEM';

  if (isDirectItem) {
    return (
      <section className="rounded-xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-6">
        <div className="flex items-start gap-3">
          <ChefHat className="h-5 w-5 text-yellow-700 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-semibold text-yellow-900 dark:text-yellow-200">
              Este platillo es un ítem directo
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
              No puede tener receta porque ya está vinculado a un producto único.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Productos disponibles para el dialog que está abierto.
  // Pasamos `trackStock` para que el dialog pueda filtrar con `onlyTracked`.
  const pickerAvailableProducts = pickerRowId
    ? availableProductsForRow(pickerRowId).map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        trackStock: p.trackStock ?? false,
      }))
    : [];

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark p-6">
      <header className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Receta</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isExtra
                ? 'Ingredientes que se descuentan del stock cuando este extra se vende junto con un platillo.'
                : 'Ingredientes que se descuentan del stock al vender este platillo.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {recipe && recipe.ingredients.length > 0 && (
            <Button variant="outline" onClick={() => setIsDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2 text-destructive" />
              Borrar receta
            </Button>
          )}
          <Button type="button" variant="outline" onClick={addRow}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar ingrediente
          </Button>
        </div>
      </header>

      {isLoadingRecipe || isLoadingProducts ? (
        <div className="text-center text-slate-500 dark:text-slate-400 py-6">
          Cargando receta...
        </div>
      ) : (
        <>
          {drafts.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-8 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
              Este platillo no tiene receta. Agregá ingredientes para empezar a trackear.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <div className="px-2">
                {/* Cabecera de tabla */}
                <div className="grid grid-cols-12 gap-3 px-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="col-span-12 md:col-span-6 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Ingrediente
                  </div>
                  <div className="col-span-4 md:col-span-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Cantidad
                  </div>
                  <div className="col-span-4 md:col-span-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Unidad
                  </div>
                  <div className="col-span-4 md:col-span-1 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                    Acciones
                  </div>
                </div>

                {/* Filas */}
                <div>
                  {drafts.map((draft) => {
                    const compatibleUnits = getCompatibleUnits(draft.productUnit);
                    return (
                      <div
                        key={draft.rowId}
                        className="grid grid-cols-12 gap-3 px-3 py-3 items-center border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Ingrediente con avatar */}
                        <div className="col-span-12 md:col-span-6">
                          <button
                            type="button"
                            onClick={() => setPickerRowId(draft.rowId)}
                            className={cn(
                              'w-full flex items-center gap-3 text-left rounded-lg p-1 transition-colors',
                              'hover:bg-slate-100 dark:hover:bg-slate-700/50'
                            )}
                          >
                            <div
                              className={cn(
                                'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center',
                                'bg-primary/10 text-primary'
                              )}
                            >
                              <Package className="h-4 w-4" />
                            </div>
                            <span
                              className={cn(
                                'truncate text-sm font-medium',
                                draft.productName
                                  ? 'text-slate-900 dark:text-white'
                                  : 'text-slate-400 dark:text-slate-500'
                              )}
                            >
                              {draft.productName || 'Elegir producto...'}
                            </span>
                          </button>
                        </div>

                        {/* Cantidad */}
                        <div className="col-span-4 md:col-span-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.001"
                            value={draft.quantity}
                            onChange={(e) => updateRow(draft.rowId, { quantity: e.target.value })}
                            placeholder="50"
                            className="h-10"
                          />
                        </div>

                        {/* Unidad */}
                        <div className="col-span-4 md:col-span-3">
                          {compatibleUnits.length > 1 ? (
                            <Select
                              value={draft.unit ?? undefined}
                              onValueChange={(value) =>
                                updateRow(draft.rowId, { unit: value as UnitOfMeasure })
                              }
                            >
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="—">
                                  {draft.unit ? getUnitName(draft.unit) : null}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {UNIT_OPTIONS.filter((opt) =>
                                  compatibleUnits.includes(opt.value)
                                ).map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="h-10 flex items-center px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-600 dark:text-slate-300">
                              {draft.unit
                                ? getUnitName(draft.unit)
                                : draft.productUnit
                                  ? getUnitName(draft.productUnit)
                                  : '—'}
                            </div>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="col-span-4 md:col-span-1 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRow(draft.rowId)}
                            aria-label="Quitar ingrediente"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Footer con guardar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            {!validation.valid && validation.message ? (
              <span className="text-sm text-destructive">{validation.message}</span>
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {drafts.length} {drafts.length === 1 ? 'ingrediente' : 'ingredientes'}
              </span>
            )}
            <Button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || !validation.valid || isSaving}
            >
              {isSaving ? 'Guardando...' : 'Guardar receta'}
            </Button>
          </div>
        </>
      )}

      {/* Dialog de selección de producto (reusado del módulo de gastos).
          onlyTracked: la receta solo puede usar productos con tracking activado, sino al
          venderse el platillo el ingrediente no descontaría stock (sería una receta decorativa). */}
      <SelectProductDialog
        open={pickerRowId !== null}
        onOpenChange={(open) => {
          if (!open) setPickerRowId(null);
        }}
        products={pickerAvailableProducts}
        onlyTracked
        emptyMessage="No hay productos con tracking activado. Activá tracking en la edición del producto para poder usarlo en una receta."
        onSelect={(product) => {
          if (pickerRowId) handleProductPicked(pickerRowId, product);
          setPickerRowId(null);
        }}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="¿Borrar la receta completa?"
        description="El platillo dejará de descontar ingredientes al venderse. Podés recrear la receta cuando quieras."
        confirmLabel="Borrar receta"
        isLoading={isDeleting}
        onConfirm={handleDeleteAll}
      />
    </section>
  );
};

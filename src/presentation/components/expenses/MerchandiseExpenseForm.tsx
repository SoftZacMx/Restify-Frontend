import React, { useState } from 'react';
import { Plus, Trash2, LayoutGrid } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/presentation/components/ui/select';
import { SelectProductDialog } from './SelectProductDialog';
import { UNIT_OPTIONS } from '@/shared/utils/stock.utils';
import { cn } from '@/shared/lib/utils';
import type { Product, CreateExpenseItemRequest, UnitOfMeasure } from '@/domain/types';

/** Índice de fila o 'add' para abrir el diálogo añadiendo un ítem nuevo */
type ProductDialogTarget = 'add' | number | null;

interface MerchandiseExpenseFormProps {
  products: Product[];
  onItemsChange: (items: CreateExpenseItemRequest[]) => void;
}

interface ExpenseItemForm {
  productId: string;
  amount: string;
  unitOfMeasure: UnitOfMeasure | '';
  unitPrice: string;
  subtotal: string;
  total: string;
}

/**
 * Componente MerchandiseExpenseForm
 * Responsabilidad única: Manejar items de compra de mercancía
 * Cumple SRP: Solo maneja la lógica de items de mercancía
 */
export const MerchandiseExpenseForm: React.FC<MerchandiseExpenseFormProps> = ({
  products,
  onItemsChange,
}) => {
  const [items, setItems] = useState<ExpenseItemForm[]>([
    {
      productId: '',
      amount: '',
      unitOfMeasure: '',
      unitPrice: '',
      subtotal: '',
      total: '',
    },
  ]);
  const [productDialogTarget, setProductDialogTarget] = useState<ProductDialogTarget>(null);

  // Unidades desde la lista canónica del sistema (incluye Litros/Mililitros),
  // para no desincronizarse del catálogo de productos.
  const unitOfMeasureOptions: { value: UnitOfMeasure; label: string }[] = UNIT_OPTIONS.map(
    (u) => ({ value: u.value, label: u.name })
  );

  const calculateItemTotals = (item: ExpenseItemForm): ExpenseItemForm => {
    const amount = parseFloat(item.amount) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const subtotal = amount * unitPrice;
    const total = subtotal; // Sin IVA por item, se calcula al final

    return {
      ...item,
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const updateItem = (index: number, updates: Partial<ExpenseItemForm>) => {
    setItems((currentItems) => {
      const newItems = [...currentItems];
      newItems[index] = { ...newItems[index], ...updates };
      if (updates.amount !== undefined || updates.unitPrice !== undefined) {
        newItems[index] = calculateItemTotals(newItems[index]);
      }
      notifyItemsChange(newItems);
      return newItems;
    });
  };

  const notifyItemsChange = (currentItems: ExpenseItemForm[]) => {
    const validItems: CreateExpenseItemRequest[] = currentItems
      .filter((item) => item.productId && item.amount && item.unitPrice)
      .map((item) => ({
        productId: item.productId,
        amount: parseFloat(item.amount) || 0,
        subtotal: parseFloat(item.subtotal) || 0,
        total: parseFloat(item.total) || 0,
        unitOfMeasure: (item.unitOfMeasure as UnitOfMeasure) || undefined,
      }));

    onItemsChange(validItems);
  };

  const removeItem = (index: number) => {
    setItems((currentItems) => {
      const newItems = currentItems.filter((_, i) => i !== index);
      notifyItemsChange(newItems);
      return newItems;
    });
  };

  const handleProductSelect = (product: { id: string; name: string; status: boolean }) => {
    if (productDialogTarget === 'add') {
      setItems((prev) => [
        ...prev,
        {
          productId: product.id,
          amount: '',
          unitOfMeasure: '',
          unitPrice: '',
          subtotal: '',
          total: '',
        },
      ]);
    } else if (typeof productDialogTarget === 'number') {
      updateItem(productDialogTarget, { productId: product.id });
    }
    setProductDialogTarget(null);
  };

  const productListForDialog: { id: string; name: string; status: boolean }[] = products.map(
    (p) => ({ id: p.id, name: p.name, status: p.status })
  );

  // Devuelve la unidad del producto si la elegida en la fila no coincide
  // (mismo chequeo que el backend aplica con INCOMPATIBLE_UNIT), o null si es válida.
  const getUnitMismatch = (item: ExpenseItemForm): UnitOfMeasure | null => {
    if (!item.productId || !item.unitOfMeasure) return null;
    const product = products.find((p) => p.id === item.productId);
    if (!product?.trackStock || !product.unitOfMeasure) return null;
    return item.unitOfMeasure !== product.unitOfMeasure ? product.unitOfMeasure : null;
  };

  const unitLabel = (unit: UnitOfMeasure): string =>
    unitOfMeasureOptions.find((u) => u.value === unit)?.label ?? unit;

  return (
    <section className="space-y-4 border-t border-border pt-6 dark:border-border">
      <SelectProductDialog
        open={productDialogTarget !== null}
        onOpenChange={(open) => !open && setProductDialogTarget(null)}
        products={productListForDialog}
        onSelect={handleProductSelect}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Detalle de la Compra
          </h3>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setProductDialogTarget('add')}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Ítem
        </Button>
      </div>

      {/* Tabla de ítems */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <div className="min-w-[640px]">
          {/* Encabezados */}
          <div className="grid grid-cols-12 gap-2 border-b border-border bg-muted px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground dark:border-border dark:bg-card/50 dark:text-muted-foreground">
            <div className="col-span-3">Item / Producto</div>
            <div className="col-span-2">Cant.</div>
            <div className="col-span-2">Unidad</div>
            <div className="col-span-2">Precio unit.</div>
            <div className="col-span-3">Subtotal</div>
          </div>
          {/* Filas */}
          {items.map((item, index) => {
            const unitMismatch = getUnitMismatch(item);
            return (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 border-b border-border px-4 py-3 last:border-b-0 dark:border-border/50"
            >
              <div className="col-span-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 w-full justify-start font-normal"
                  onClick={() => setProductDialogTarget(index)}
                >
                  {item.productId
                    ? products.find((p) => p.id === item.productId)?.name
                    : 'Seleccionar producto'}
                </Button>
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.amount}
                  onChange={(e) => updateItem(index, { amount: e.target.value })}
                  placeholder="0"
                  className="h-9"
                />
              </div>
              <div className="col-span-2">
                <Select
                  value={item.unitOfMeasure || ''}
                  onValueChange={(value) =>
                    updateItem(index, { unitOfMeasure: (value || '') as UnitOfMeasure | '' })
                  }
                >
                  <SelectTrigger
                    className={cn('h-9', unitMismatch && 'border-destructive focus-visible:ring-destructive')}
                  >
                    {item.unitOfMeasure
                      ? unitOfMeasureOptions.find((u) => u.value === item.unitOfMeasure)?.label ?? item.unitOfMeasure
                      : '—'}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ninguna</SelectItem>
                    {unitOfMeasureOptions.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {unitMismatch && (
                  <p className="mt-1 text-xs text-destructive">
                    No coincide con la unidad del producto ({unitLabel(unitMismatch)})
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, { unitPrice: e.target.value })}
                  placeholder="$ 0"
                  className="h-9"
                />
              </div>
              <div className="col-span-3 flex items-center justify-between gap-2">
                <span className="font-semibold text-foreground">
                  ${(item.subtotal || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};



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

  const unitOfMeasureOptions: { value: UnitOfMeasure; label: string }[] = [
    { value: 'KG', label: 'Kilogramos' },
    { value: 'G', label: 'Gramos' },
    { value: 'PCS', label: 'Piezas' },
    { value: 'OTHER', label: 'Otros' },
  ];

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

  return (
    <section className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-700">
      <SelectProductDialog
        open={productDialogTarget !== null}
        onOpenChange={(open) => !open && setProductDialogTarget(null)}
        products={productListForDialog}
        onSelect={handleProductSelect}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Detalle de la Compra
          </h3>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setProductDialogTarget('add')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Ítem
        </Button>
      </div>

      {/* Tabla de ítems */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="min-w-[640px]">
          {/* Encabezados */}
          <div className="grid grid-cols-12 gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            <div className="col-span-3">Item / Producto</div>
            <div className="col-span-2">Cant.</div>
            <div className="col-span-2">Unidad</div>
            <div className="col-span-2">Precio unit.</div>
            <div className="col-span-3">Subtotal</div>
          </div>
          {/* Filas */}
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 border-b border-slate-100 px-4 py-3 last:border-b-0 dark:border-slate-700/50"
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
                  <SelectTrigger className="h-9">
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
                <span className="font-semibold text-slate-900 dark:text-white">
                  ${(item.subtotal || '0.00').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="h-8 w-8 shrink-0 p-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};



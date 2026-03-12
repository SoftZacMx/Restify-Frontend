import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
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
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    
    // Recalcular si cambió amount o unitPrice
    if (updates.amount !== undefined || updates.unitPrice !== undefined) {
      newItems[index] = calculateItemTotals(newItems[index]);
    }

    setItems(newItems);
    notifyItemsChange(newItems);
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
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    notifyItemsChange(newItems);
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
    <div className="space-y-4 border-t pt-4">
      <SelectProductDialog
        open={productDialogTarget !== null}
        onOpenChange={(open) => !open && setProductDialogTarget(null)}
        products={productListForDialog}
        onSelect={handleProductSelect}
      />

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Detalles de la Compra</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setProductDialogTarget('add')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Ítem
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-12 gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
          >
            <div className="col-span-12 md:col-span-3 space-y-2">
              <Label>Ítem</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start font-normal h-11"
                onClick={() => setProductDialogTarget(index)}
              >
                {item.productId
                  ? products.find((p) => p.id === item.productId)?.name
                  : 'Seleccionar producto'}
              </Button>
            </div>

            <div className="col-span-6 md:col-span-2 space-y-2">
              <Label>Cantidad</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={item.amount}
                onChange={(e) => updateItem(index, { amount: e.target.value })}
                placeholder="10"
              />
            </div>

            <div className="col-span-6 md:col-span-2 space-y-2">
              <Label>Unidad (opcional)</Label>
              <Select
                value={item.unitOfMeasure || ''}
                onValueChange={(value) =>
                  updateItem(index, { unitOfMeasure: (value || '') as UnitOfMeasure | '' })
                }
              >
                <SelectTrigger>
                  {item.unitOfMeasure
                    ? unitOfMeasureOptions.find((u) => u.value === item.unitOfMeasure)?.label ?? item.unitOfMeasure
                    : 'Seleccionar'}
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

            <div className="col-span-6 md:col-span-2 space-y-2">
              <Label>Precio Unitario</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={item.unitPrice}
                onChange={(e) => updateItem(index, { unitPrice: e.target.value })}
                placeholder="$2.50"
              />
            </div>

            <div className="col-span-6 md:col-span-2 space-y-2 min-w-[7rem]">
              <Label>Subtotal</Label>
              <Input
                type="text"
                value={`$${item.subtotal || '0.00'}`}
                readOnly
                className="bg-slate-100 dark:bg-slate-800"
              />
            </div>

            <div className="col-span-12 md:col-span-1 flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};



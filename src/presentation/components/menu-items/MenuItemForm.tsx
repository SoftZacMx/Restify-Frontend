import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';
import { Switch } from '@/presentation/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/presentation/components/ui/select';
import type {
  MenuItemResponse,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  MenuItemFormErrors,
  MenuCategoryResponse,
} from '@/domain/types';
import { cn } from '@/shared/lib/utils';
import { menuCategoryService } from '@/application/services';

interface MenuItemFormProps {
  initialData?: MenuItemResponse | null; // Si se proporciona, es modo edición
  onSubmit: (menuItemData: CreateMenuItemRequest | UpdateMenuItemRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Componente MenuItemForm reutilizable
 * Puede usarse tanto para crear como para editar platillos
 * Responsabilidad única: Renderizar y manejar el formulario de platillo
 */
export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState<Omit<CreateMenuItemRequest, 'userId'>>({
    name: '',
    price: 0,
    status: true,
    isExtra: false,
    categoryId: undefined,
  });
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('none');
  const [errors, setErrors] = useState<MenuItemFormErrors>({});
  
  // Estado para categorías cargadas desde el backend
  const [categories, setCategories] = useState<MenuCategoryResponse[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Cargar categorías activas desde el backend
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const activeCategories = await menuCategoryService.listMenuCategories({ status: true });
        setCategories(activeCategories);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Cargar datos iniciales si estamos en modo edición
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        price: initialData.price,
        status: initialData.status,
        // Asegurar que isExtra siempre sea booleano (el backend puede no devolverlo)
        isExtra: initialData.isExtra ?? false,
        categoryId: initialData.categoryId,
      });
      setSelectedCategoryId(initialData.categoryId || 'none');
    }
  }, [initialData]);

  /**
   * Valida el formulario
   */
  const validateForm = (): boolean => {
    const newErrors: MenuItemFormErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length > 200) {
      newErrors.name = 'El nombre no puede exceder 200 caracteres';
    }

    // Validar precio
    if (formData.price === undefined || formData.price === null) {
      newErrors.price = 'El precio es requerido';
    } else if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    } else {
      // Validar máximo 2 decimales
      const decimalPlaces = (formData.price.toString().split('.')[1] || '').length;
      if (decimalPlaces > 2) {
        newErrors.price = 'El precio debe tener máximo 2 decimales';
      }
    }

    // Validar categoryId (opcional, pero si se proporciona debe ser válido)
    if (formData.categoryId) {
      // Validar formato UUID básico
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(formData.categoryId)) {
        newErrors.categoryId = 'El ID de categoría debe ser un UUID válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handler para cambios en los campos
   */
  const handleChange = (
    field: keyof Omit<CreateMenuItemRequest, 'userId'>,
    value: string | number | boolean | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as keyof MenuItemFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  /**
   * Handler para cambios en el precio (validar formato)
   */
  const handlePriceChange = (value: string) => {
    // Permitir solo números y un punto decimal
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Validar que solo haya un punto decimal
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return; // No permitir múltiples puntos
    }

    // Si hay parte decimal, limitar a 2 decimales
    if (parts[1] && parts[1].length > 2) {
      return; // No permitir más de 2 decimales
    }

    const numValue = numericValue === '' ? 0 : parseFloat(numericValue);
    handleChange('price', isNaN(numValue) ? 0 : numValue);
  };

  /**
   * Handler para submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode) {
        // En modo edición, solo enviar campos que han cambiado
        const updateData: UpdateMenuItemRequest = {};
        if (formData.name !== initialData!.name) {
          updateData.name = formData.name;
        }
        if (formData.price !== initialData!.price) {
          updateData.price = formData.price;
        }
        if (formData.status !== initialData!.status) {
          updateData.status = formData.status;
        }
        if (formData.isExtra !== initialData!.isExtra) {
          updateData.isExtra = formData.isExtra;
        }
        if (formData.categoryId !== initialData!.categoryId) {
          updateData.categoryId = formData.categoryId || undefined;
        }
        await onSubmit(updateData);
      } else {
        // En modo creación, enviar todos los campos requeridos
        // userId se agrega en el componente padre (MenuItemsPage)
        // Si categoryId está null/undefined, no se incluye en el request
        const createData = {
          name: formData.name,
          price: formData.price,
          status: formData.status,
          isExtra: formData.isExtra,
          ...(formData.categoryId && { categoryId: formData.categoryId }),
        } as Omit<CreateMenuItemRequest, 'userId'>;
        await onSubmit(createData as CreateMenuItemRequest);
      }
    } catch (error) {
      // El error se maneja en el componente padre
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Nombre <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ej: Hamburguesa Clásica"
          className={cn(errors.name && 'border-destructive')}
          maxLength={200}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {formData.name.length}/200 caracteres
        </p>
      </div>

      {/* Precio */}
      <div className="space-y-2">
        <Label htmlFor="price" className="text-sm font-medium">
          Precio <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
            $
          </span>
          <Input
            id="price"
            type="text"
            value={formData.price === 0 ? '' : formData.price.toString()}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="0.00"
            className={cn(
              'pl-8',
              errors.price && 'border-destructive'
            )}
            disabled={isLoading}
          />
        </div>
        {errors.price && (
          <p className="text-sm text-destructive">{errors.price}</p>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Máximo 2 decimales (ej: 15.50)
        </p>
      </div>

      {/* Categoría */}
      <div className="space-y-2">
        <Label htmlFor="categoryId" className="text-sm font-medium">
          Categoría
        </Label>
        {isLoadingCategories ? (
          <div className="flex items-center gap-2 h-10 px-3 text-sm text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando categorías...</span>
          </div>
        ) : (
          <Select
            value={selectedCategoryId}
            onValueChange={(value) => {
              setSelectedCategoryId(value);
              const categoryId = value === 'none' ? null : value;
              handleChange('categoryId', categoryId);
            }}
          >
            <SelectTrigger
              id="categoryId"
              className={cn(errors.categoryId && 'border-destructive')}
              disabled={isLoading}
            >
              {selectedCategoryId === 'none' || !selectedCategoryId
                ? 'Sin categoría (opcional)'
                : categories.find((cat) => cat.id === selectedCategoryId)?.name || 'Sin categoría (opcional)'}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin categoría</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.categoryId && (
          <p className="text-sm text-destructive">{errors.categoryId}</p>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Selecciona la categoría del menú a la que pertenece el platillo
        </p>
      </div>

      {/* Es Extra */}
      <div className="flex items-center justify-between space-x-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
        <div className="space-y-0.5">
          <Label htmlFor="isExtra" className="text-sm font-medium">
            Es un Extra
          </Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formData.isExtra 
              ? 'Este platillo es un extra que se puede agregar a otros platillos' 
              : 'Este es un platillo normal del menú'}
          </p>
        </div>
        <Switch
          id="isExtra"
          checked={formData.isExtra}
          onCheckedChange={(checked) => handleChange('isExtra', checked)}
          disabled={isLoading}
        />
      </div>

      {/* Estado */}
      <div className="flex items-center justify-between space-x-2 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="space-y-0.5">
          <Label htmlFor="status" className="text-sm font-medium">
            Estado
          </Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formData.status ? 'Platillo activo' : 'Platillo inactivo'}
          </p>
        </div>
        <Switch
          id="status"
          checked={formData.status}
          onCheckedChange={(checked) => handleChange('status', checked)}
          disabled={isLoading}
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};

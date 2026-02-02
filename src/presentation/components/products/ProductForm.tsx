import React, { useState, useEffect } from 'react';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';
import { Switch } from '@/presentation/components/ui/switch';
import { Textarea } from '@/presentation/components/ui/textarea';
import type {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductFormErrors,
} from '@/domain/types';
import { cn } from '@/shared/lib/utils';

interface ProductFormProps {
  initialData?: ProductResponse | null; // Si se proporciona, es modo edición
  onSubmit: (productData: CreateProductRequest | UpdateProductRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Componente ProductForm reutilizable
 * Puede usarse tanto para crear como para editar productos
 * Responsabilidad única: Renderizar y manejar el formulario de producto
 */
export const ProductForm: React.FC<ProductFormProps> = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState<Omit<CreateProductRequest, 'userId'>>({
    name: '',
    description: '',
    status: true,
  });

  const [errors, setErrors] = useState<ProductFormErrors>({});

  // Cargar datos iniciales si estamos en modo edición
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        status: initialData.status,
      });
    }
  }, [initialData]);

  /**
   * Valida el formulario
   */
  const validateForm = (): boolean => {
    const newErrors: ProductFormErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length > 200) {
      newErrors.name = 'El nombre no puede exceder 200 caracteres';
    }

    // Validar descripción
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'La descripción no puede exceder 1000 caracteres';
    }

    // userId se obtiene del store de autenticación, no se valida aquí

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handler para cambios en los campos
   */
  const handleChange = (
    field: keyof Omit<CreateProductRequest, 'userId'>,
    value: string | boolean | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as keyof ProductFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
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
        // En modo edición, solo enviar campos que han cambiado (description: null si vacío, según API)
        const updateData: UpdateProductRequest = {};
        if (formData.name !== initialData!.name) {
          updateData.name = formData.name;
        }
        const initialDesc = initialData!.description ?? '';
        if ((formData.description ?? '') !== initialDesc) {
          updateData.description = (formData.description?.trim() ?? '') || null;
        }
        if (formData.status !== initialData!.status) {
          updateData.status = formData.status;
        }
        await onSubmit(updateData);
      } else {
        // En modo creación, enviar todos los campos requeridos
        await onSubmit(formData as CreateProductRequest);
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
          placeholder="Ej: Coca Cola 500ml"
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

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Descripción
        </Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Descripción del producto (opcional)"
          className={cn(
            'min-h-[100px] resize-y',
            errors.description && 'border-destructive'
          )}
          maxLength={1000}
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description}</p>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {(formData.description || '').length}/1000 caracteres
        </p>
      </div>

      {/* Estado */}
      <div className="flex items-center justify-between space-x-2 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="space-y-0.5">
          <Label htmlFor="status" className="text-sm font-medium">
            Estado
          </Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formData.status ? 'Producto activo' : 'Producto inactivo'}
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

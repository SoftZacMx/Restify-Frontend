import React, { useState, useEffect } from 'react';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';
import { Switch } from '@/presentation/components/ui/switch';
import type {
  MenuCategoryResponse,
  CreateMenuCategoryRequest,
  UpdateMenuCategoryRequest,
  MenuCategoryFormErrors,
} from '@/domain/types';
import { cn } from '@/shared/lib/utils';

interface MenuCategoryFormProps {
  initialData?: MenuCategoryResponse | null;
  onSubmit: (categoryData: CreateMenuCategoryRequest | UpdateMenuCategoryRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Componente MenuCategoryForm reutilizable
 * Puede usarse tanto para crear como para editar categorías
 * Responsabilidad única: Renderizar y manejar el formulario de categoría
 */
export const MenuCategoryForm: React.FC<MenuCategoryFormProps> = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState<CreateMenuCategoryRequest>({
    name: '',
    status: true,
  });

  const [errors, setErrors] = useState<MenuCategoryFormErrors>({});

  // Cargar datos iniciales si estamos en modo edición
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        status: initialData.status,
      });
    }
  }, [initialData]);

  /**
   * Valida el formulario
   */
  const validateForm = (): boolean => {
    const newErrors: MenuCategoryFormErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length > 200) {
      newErrors.name = 'El nombre no puede exceder 200 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handler para cambios en los campos
   */
  const handleChange = (
    field: keyof CreateMenuCategoryRequest,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as keyof MenuCategoryFormErrors]) {
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
        // En modo edición, solo enviar campos que han cambiado
        const updateData: UpdateMenuCategoryRequest = {};
        if (formData.name !== initialData!.name) {
          updateData.name = formData.name;
        }
        if (formData.status !== initialData!.status) {
          updateData.status = formData.status;
        }
        await onSubmit(updateData);
      } else {
        // En modo creación, enviar todos los campos
        await onSubmit(formData);
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
          placeholder="Ej: Bebidas, Postres, Platos Fuertes"
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

      {/* Estado */}
      <div className="flex items-center justify-between space-x-2 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="space-y-0.5">
          <Label htmlFor="status" className="text-sm font-medium">
            Estado
          </Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formData.status ? 'Categoría activa' : 'Categoría inactiva'}
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

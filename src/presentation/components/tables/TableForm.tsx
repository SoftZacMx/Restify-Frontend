import React, { useState, useEffect } from 'react';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';
import { Switch } from '@/presentation/components/ui/switch';
import type {
  TableResponse,
  CreateTableRequest,
  UpdateTableRequest,
  TableFormErrors,
} from '@/domain/types';
import { cn } from '@/shared/lib/utils';
import { validateTableName } from '@/shared/utils/table.utils';

interface TableFormProps {
  initialData?: TableResponse | null;
  onSubmit: (tableData: CreateTableRequest | UpdateTableRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  userId?: string;
}

/**
 * Table create/edit form — free-text table name (e.g. 1, 1A, Terraza).
 */
export const TableForm: React.FC<TableFormProps> = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
  userId,
}) => {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    name: '',
    status: true,
    availabilityStatus: true,
  });

  const [errors, setErrors] = useState<TableFormErrors>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        status: initialData.status,
        availabilityStatus: initialData.availabilityStatus,
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: TableFormErrors = {};
    const nameError = validateTableName(formData.name);
    if (nameError) {
      newErrors.name = nameError;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field as keyof TableFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const name = formData.name.trim();

      if (isEditMode) {
        const updateData: UpdateTableRequest = {};
        if (name !== initialData!.name) {
          updateData.name = name;
        }
        if (formData.status !== initialData!.status) {
          updateData.status = formData.status;
        }
        if (formData.availabilityStatus !== initialData!.availabilityStatus) {
          updateData.availabilityStatus = formData.availabilityStatus;
        }
        await onSubmit(updateData);
      } else {
        if (!userId) {
          throw new Error('userId is required to create a table');
        }
        const createData: CreateTableRequest = {
          name,
          status: formData.status,
          availabilityStatus: formData.availabilityStatus,
          userId,
        };
        await onSubmit(createData);
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="table-name-input" className="text-sm font-medium">
          Nombre de la mesa <span className="text-destructive">*</span>
        </Label>
        <Input
          id="table-name-input"
          name="name"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ej: 1, 1A, 1B, Terraza..."
          className={cn(errors.name && 'border-destructive')}
          maxLength={64}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Identificador único para la mesa (letras, números o ambos). Máximo 64 caracteres.
        </p>
      </div>

      <div className="flex items-center justify-between space-x-2 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="space-y-0.5">
          <Label htmlFor="status" className="text-sm font-medium">
            Estado de la Mesa
          </Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formData.status
              ? 'Mesa activa en el sistema'
              : 'Mesa inactiva (no visible para operaciones)'}
          </p>
        </div>
        <Switch
          id="status"
          checked={formData.status}
          onCheckedChange={(checked) => handleChange('status', checked)}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-between space-x-2 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="space-y-0.5">
          <Label htmlFor="availabilityStatus" className="text-sm font-medium">
            Disponibilidad
          </Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formData.availabilityStatus
              ? 'Mesa libre (disponible para nuevas órdenes)'
              : 'Mesa ocupada (tiene una orden activa)'}
          </p>
        </div>
        <Switch
          id="availabilityStatus"
          checked={formData.availabilityStatus}
          onCheckedChange={(checked) => handleChange('availabilityStatus', checked)}
          disabled={isLoading}
        />
      </div>

      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Estado actual de la mesa:
        </p>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-block w-3 h-3 rounded-full',
              !formData.status
                ? 'bg-gray-400'
                : formData.availabilityStatus
                  ? 'bg-green-500'
                  : 'bg-red-500'
            )}
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {!formData.status
              ? 'Deshabilitada'
              : formData.availabilityStatus
                ? 'Libre'
                : 'Ocupada'}
          </span>
        </div>
      </div>

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

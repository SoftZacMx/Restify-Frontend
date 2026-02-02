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
import { validateTableNumber } from '@/shared/utils/table.utils';

interface TableFormProps {
  initialData?: TableResponse | null;
  onSubmit: (tableData: CreateTableRequest | UpdateTableRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  userId?: string;
}

/**
 * Componente TableForm reutilizable
 * Puede usarse tanto para crear como para editar mesas
 * Responsabilidad única: Renderizar y manejar el formulario de mesa
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
    numberTable: '',
    status: true,
    availabilityStatus: true,
  });

  const [errors, setErrors] = useState<TableFormErrors>({});

  // Cargar datos iniciales si estamos en modo edición
  useEffect(() => {
    if (initialData) {
      setFormData({
        numberTable: String(initialData.numberTable),
        status: initialData.status,
        availabilityStatus: initialData.availabilityStatus,
      });
    }
  }, [initialData]);

  /**
   * Valida el formulario
   */
  const validateForm = (): boolean => {
    const newErrors: TableFormErrors = {};

    // Validar número de mesa
    const numberError = validateTableNumber(formData.numberTable);
    if (numberError) {
      newErrors.numberTable = numberError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handler para cambios en los campos
   */
  const handleChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as keyof TableFormErrors]) {
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
      const numberTable = parseInt(formData.numberTable, 10);

      if (isEditMode) {
        // En modo edición, solo enviar campos que han cambiado
        const updateData: UpdateTableRequest = {};
        if (numberTable !== initialData!.numberTable) {
          updateData.numberTable = numberTable;
        }
        if (formData.status !== initialData!.status) {
          updateData.status = formData.status;
        }
        if (formData.availabilityStatus !== initialData!.availabilityStatus) {
          updateData.availabilityStatus = formData.availabilityStatus;
        }
        await onSubmit(updateData);
      } else {
        // En modo creación, enviar todos los campos
        if (!userId) {
          throw new Error('El userId es requerido para crear una mesa');
        }
        const createData: CreateTableRequest = {
          numberTable,
          status: formData.status,
          availabilityStatus: formData.availabilityStatus,
          userId,
        };
        await onSubmit(createData);
      }
    } catch (error) {
      // El error se maneja en el componente padre
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Número de Mesa */}
      <div className="space-y-2">
        <Label htmlFor="numberTable" className="text-sm font-medium">
          Número de Mesa <span className="text-destructive">*</span>
        </Label>
        <Input
          id="numberTable"
          type="number"
          value={formData.numberTable}
          onChange={(e) => handleChange('numberTable', e.target.value)}
          placeholder="Ej: 1, 2, 3..."
          className={cn(errors.numberTable && 'border-destructive')}
          min="1"
          step="1"
          disabled={isLoading}
        />
        {errors.numberTable && (
          <p className="text-sm text-destructive">{errors.numberTable}</p>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ingresa un número entero positivo para identificar la mesa
        </p>
      </div>

      {/* Estado */}
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

      {/* Disponibilidad */}
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

      {/* Indicador de estados */}
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

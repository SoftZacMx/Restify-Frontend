import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';
import { Switch } from '@/presentation/components/ui/switch';
import { tableFormSchema, type TableFormValues } from '@/shared/schemas/table.schema';
import type {
  TableResponse,
  CreateTableRequest,
  UpdateTableRequest,
} from '@/domain/types';
import { cn } from '@/shared/lib/utils';

interface TableFormProps {
  initialData?: TableResponse | null;
  onSubmit: (tableData: CreateTableRequest | UpdateTableRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  userId?: string;
}

export const TableForm: React.FC<TableFormProps> = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
  userId,
}) => {
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TableFormValues>({
    resolver: zodResolver(tableFormSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      status: initialData?.status ?? true,
      availabilityStatus: initialData?.availabilityStatus ?? true,
    },
  });

  const status = watch('status');
  const availabilityStatus = watch('availabilityStatus');

  const onFormSubmit = async (data: TableFormValues) => {
    const name = data.name.trim();

    if (isEditMode) {
      const updateData: UpdateTableRequest = {};
      if (name !== initialData!.name) updateData.name = name;
      if (data.status !== initialData!.status) updateData.status = data.status;
      if (data.availabilityStatus !== initialData!.availabilityStatus) updateData.availabilityStatus = data.availabilityStatus;
      await onSubmit(updateData);
    } else {
      if (!userId) throw new Error('userId is required to create a table');
      const createData: CreateTableRequest = {
        name,
        status: data.status,
        availabilityStatus: data.availabilityStatus,
        userId,
      };
      await onSubmit(createData);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="table-name-input" className="text-sm font-medium">
          Nombre de la mesa <span className="text-destructive">*</span>
        </Label>
        <Input
          id="table-name-input"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          {...register('name')}
          placeholder="Ej: 1, 1A, 1B, Terraza..."
          className={cn(errors.name && 'border-destructive')}
          maxLength={64}
          disabled={isLoading}
          aria-required
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Identificador único para la mesa (letras, números o ambos). Máximo 64 caracteres.
        </p>
      </div>

      <div className="flex items-center justify-between space-x-2 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="space-y-0.5">
          <Label htmlFor="status" className="text-sm font-medium">Estado de la Mesa</Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {status ? 'Mesa activa en el sistema' : 'Mesa inactiva (no visible para operaciones)'}
          </p>
        </div>
        <Switch
          id="status"
          checked={status}
          onCheckedChange={(checked) => setValue('status', checked)}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-between space-x-2 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="space-y-0.5">
          <Label htmlFor="availabilityStatus" className="text-sm font-medium">Disponibilidad</Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {availabilityStatus ? 'Mesa libre (disponible para nuevas órdenes)' : 'Mesa ocupada (tiene una orden activa)'}
          </p>
        </div>
        <Switch
          id="availabilityStatus"
          checked={availabilityStatus}
          onCheckedChange={(checked) => setValue('availabilityStatus', checked)}
          disabled={isLoading}
        />
      </div>

      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Estado actual de la mesa:</p>
        <div className="flex items-center gap-2">
          <span className={cn('inline-block w-3 h-3 rounded-full', !status ? 'bg-gray-400' : availabilityStatus ? 'bg-green-500' : 'bg-red-500')} />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {!status ? 'Deshabilitada' : availabilityStatus ? 'Libre' : 'Ocupada'}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};

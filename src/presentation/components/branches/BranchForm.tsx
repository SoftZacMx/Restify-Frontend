import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image as ImageIcon, Clock } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';
import { branchFormSchema, type BranchFormValues } from '@/shared/schemas/branch.schema';
import type { BranchDetail, CreateBranchRequest, UpdateBranchRequest } from '@/domain/types';
import { cn } from '@/shared/lib/utils';

interface BranchFormProps {
  initialData?: BranchDetail | null;
  onSubmit: (data: CreateBranchRequest | UpdateBranchRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const inputClass =
  'bg-slate-100 dark:bg-card border-slate-200 dark:border-border focus:border-primary';

const sectionTitleClass =
  'text-xs font-semibold uppercase tracking-widest text-primary';

/** '' → null para los campos opcionales que el backend acepta como nullable. */
const emptyToNull = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

const buildCreatePayload = (data: BranchFormValues): CreateBranchRequest => ({
  name: data.name.trim(),
  state: data.state.trim(),
  city: data.city.trim(),
  street: data.street.trim(),
  exteriorNumber: data.exteriorNumber.trim(),
  phone: data.phone.trim(),
  rfc: emptyToNull(data.rfc),
  logoUrl: emptyToNull(data.logoUrl),
  startOperations: emptyToNull(data.startOperations),
  endOperations: emptyToNull(data.endOperations),
});

/** Diff contra el detalle original: solo los campos que cambiaron viajan en el PATCH. */
const buildUpdatePayload = (
  data: BranchFormValues,
  initial: BranchDetail
): UpdateBranchRequest => {
  const next = buildCreatePayload(data);
  const patch: UpdateBranchRequest = {};

  if (next.name !== initial.name) patch.name = next.name;
  if (next.state !== initial.state) patch.state = next.state;
  if (next.city !== initial.city) patch.city = next.city;
  if (next.street !== initial.street) patch.street = next.street;
  if (next.exteriorNumber !== initial.exteriorNumber) patch.exteriorNumber = next.exteriorNumber;
  if (next.phone !== initial.phone) patch.phone = next.phone;
  if (next.rfc !== (initial.rfc ?? null)) patch.rfc = next.rfc;
  if (next.logoUrl !== (initial.logoUrl ?? null)) patch.logoUrl = next.logoUrl;
  if (next.startOperations !== (initial.startOperations ?? null)) {
    patch.startOperations = next.startOperations;
  }
  if (next.endOperations !== (initial.endOperations ?? null)) {
    patch.endOperations = next.endOperations;
  }

  return patch;
};

export const BranchForm: React.FC<BranchFormProps> = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEditMode = !!initialData;
  const [logoBroken, setLogoBroken] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: initialData?.name ?? '',
      state: initialData?.state ?? '',
      city: initialData?.city ?? '',
      street: initialData?.street ?? '',
      exteriorNumber: initialData?.exteriorNumber ?? '',
      phone: initialData?.phone ?? '',
      rfc: initialData?.rfc ?? '',
      logoUrl: initialData?.logoUrl ?? '',
      startOperations: initialData?.startOperations ?? '',
      endOperations: initialData?.endOperations ?? '',
    },
  });

  const logoUrl = watch('logoUrl');

  const logoIsValid = /^https?:\/\//i.test(logoUrl.trim());

  const onFormSubmit = async (data: BranchFormValues) => {
    if (isEditMode) {
      await onSubmit(buildUpdatePayload(data, initialData!));
    } else {
      await onSubmit(buildCreatePayload(data));
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Información General + Branding */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className={sectionTitleClass}>Información general</h3>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre de la sucursal <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ej: Restify Central - Polanco"
              className={cn(inputClass, errors.name && 'border-destructive')}
              maxLength={200}
              disabled={isLoading}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Teléfono de contacto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                {...register('phone')}
                placeholder="5550000000"
                className={cn(inputClass, errors.phone && 'border-destructive')}
                maxLength={10}
                disabled={isLoading}
              />
              {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rfc" className="text-sm font-medium">
                RFC
              </Label>
              <Input
                id="rfc"
                {...register('rfc')}
                placeholder="ABCD123456XYZ"
                className={cn(inputClass, errors.rfc && 'border-destructive')}
                maxLength={20}
                disabled={isLoading}
              />
              {errors.rfc && <p className="text-sm text-destructive mt-1">{errors.rfc.message}</p>}
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="space-y-4">
          <h3 className={sectionTitleClass}>Branding</h3>
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-border bg-slate-50 dark:bg-card/40 p-4 h-[140px]">
            <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-card flex items-center justify-center overflow-hidden">
              {logoIsValid && !logoBroken ? (
                <img
                  src={logoUrl.trim()}
                  alt="Logo de la sucursal"
                  className="w-full h-full object-cover"
                  onError={() => setLogoBroken(true)}
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-slate-400 dark:text-muted-foreground" />
              )}
            </div>
            <span className="text-xs text-slate-500 dark:text-muted-foreground text-center">
              Vista previa del logo
            </span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoUrl" className="text-sm font-medium">
              URL del logo
            </Label>
            <Input
              id="logoUrl"
              {...register('logoUrl', { onChange: () => setLogoBroken(false) })}
              placeholder="https://mi-marca.com/logo.png"
              className={cn(inputClass, errors.logoUrl && 'border-destructive')}
              maxLength={500}
              disabled={isLoading}
            />
            {errors.logoUrl && <p className="text-sm text-destructive mt-1">{errors.logoUrl.message}</p>}
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-200 dark:bg-card" />

      {/* Ubicación Geográfica */}
      <div className="space-y-4">
        <h3 className={sectionTitleClass}>Ubicación geográfica</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="state" className="text-sm font-medium">
              Estado <span className="text-destructive">*</span>
            </Label>
            <Input
              id="state"
              {...register('state')}
              placeholder="Ej: Ciudad de México"
              className={cn(inputClass, errors.state && 'border-destructive')}
              maxLength={100}
              disabled={isLoading}
            />
            {errors.state && <p className="text-sm text-destructive mt-1">{errors.state.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium">
              Ciudad <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              {...register('city')}
              placeholder="Ej: Miguel Hidalgo"
              className={cn(inputClass, errors.city && 'border-destructive')}
              maxLength={100}
              disabled={isLoading}
            />
            {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="street" className="text-sm font-medium">
              Calle <span className="text-destructive">*</span>
            </Label>
            <Input
              id="street"
              {...register('street')}
              placeholder="Av. Presidente Masaryk"
              className={cn(inputClass, errors.street && 'border-destructive')}
              maxLength={200}
              disabled={isLoading}
            />
            {errors.street && <p className="text-sm text-destructive mt-1">{errors.street.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="exteriorNumber" className="text-sm font-medium">
              Número exterior <span className="text-destructive">*</span>
            </Label>
            <Input
              id="exteriorNumber"
              {...register('exteriorNumber')}
              placeholder="123, 154C, 12-B"
              className={cn(inputClass, errors.exteriorNumber && 'border-destructive')}
              maxLength={10}
              disabled={isLoading}
            />
            {errors.exteriorNumber && (
              <p className="text-sm text-destructive mt-1">{errors.exteriorNumber.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-200 dark:bg-card" />

      {/* Horarios de operación */}
      <div className="space-y-4">
        <h3 className={sectionTitleClass}>Horarios de operación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startOperations" className="text-sm font-medium">
              Apertura
            </Label>
            <div className="relative">
              <Input
                id="startOperations"
                type="time"
                {...register('startOperations')}
                className={cn(inputClass, 'pr-10', errors.startOperations && 'border-destructive')}
                disabled={isLoading}
              />
              <Clock className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-muted-foreground" />
            </div>
            {errors.startOperations && (
              <p className="text-sm text-destructive mt-1">{errors.startOperations.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="endOperations" className="text-sm font-medium">
              Cierre
            </Label>
            <div className="relative">
              <Input
                id="endOperations"
                type="time"
                {...register('endOperations')}
                className={cn(inputClass, 'pr-10', errors.endOperations && 'border-destructive')}
                disabled={isLoading}
              />
              <Clock className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-muted-foreground" />
            </div>
            {errors.endOperations && (
              <p className="text-sm text-destructive mt-1">{errors.endOperations.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear sucursal'}
        </Button>
      </div>
    </form>
  );
};

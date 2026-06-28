import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image as ImageIcon, Clock } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/presentation/components/ui/select';
import { branchFormSchema, type BranchFormValues } from '@/shared/schemas/branch.schema';
import type { BranchDetail, CreateBranchRequest, UpdateBranchRequest } from '@/domain/types';
import { APP_TIMEZONE } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';

interface BranchFormProps {
  initialData?: BranchDetail | null;
  onSubmit: (data: CreateBranchRequest | UpdateBranchRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const TIMEZONES = [
  'America/Mexico_City', 'America/Tijuana', 'America/Monterrey', 'America/Cancun',
  'America/Hermosillo', 'America/Mazatlan', 'America/Merida',
];

const CURRENCIES: { value: string; label: string }[] = [
  { value: 'MXN', label: 'MXN (Pesos)' },
  { value: 'USD', label: 'USD (Dólares)' },
  { value: 'EUR', label: 'EUR (Euros)' },
];

const inputClass =
  'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary';

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
  timezone: data.timezone.trim(),
  currency: data.currency.trim(),
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
  if (next.timezone !== initial.timezone) patch.timezone = next.timezone;
  if (next.currency !== initial.currency) patch.currency = next.currency;

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
    setValue,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
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
      timezone: initialData?.timezone ?? APP_TIMEZONE,
      currency: initialData?.currency ?? 'MXN',
    },
  });

  const timezone = watch('timezone');
  const currency = watch('currency');
  const logoUrl = watch('logoUrl');

  const logoIsValid = /^https?:\/\//i.test(logoUrl.trim());
  const currencyLabel = CURRENCIES.find((c) => c.value === currency)?.label ?? currency;

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
                {...register('phone')}
                placeholder="+52 55 0000 0000"
                className={cn(inputClass, errors.phone && 'border-destructive')}
                maxLength={30}
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
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-4 h-[140px]">
            <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
              {logoIsValid && !logoBroken ? (
                <img
                  src={logoUrl.trim()}
                  alt="Logo de la sucursal"
                  className="w-full h-full object-cover"
                  onError={() => setLogoBroken(true)}
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              )}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 text-center">
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

      <div className="h-px bg-slate-200 dark:bg-slate-700" />

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

      <div className="h-px bg-slate-200 dark:bg-slate-700" />

      {/* Configuración operativa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-6">
        <div className="space-y-4">
          <h3 className={sectionTitleClass}>Horarios de operación</h3>
          <div className="grid grid-cols-2 gap-4">
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
                <Clock className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
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
                <Clock className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              </div>
              {errors.endOperations && (
                <p className="text-sm text-destructive mt-1">{errors.endOperations.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className={sectionTitleClass}>Ajustes regionales</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-sm font-medium">
                Zona horaria
              </Label>
              <Select value={timezone} onValueChange={(value) => setValue('timezone', value)}>
                <SelectTrigger
                  id="timezone"
                  className={cn('h-11 rounded-lg', inputClass, errors.timezone && 'border-destructive')}
                >
                  <span className="truncate">{timezone}</span>
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.timezone && (
                <p className="text-sm text-destructive mt-1">{errors.timezone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium">
                Moneda
              </Label>
              <Select value={currency} onValueChange={(value) => setValue('currency', value)}>
                <SelectTrigger
                  id="currency"
                  className={cn('h-11 rounded-lg', inputClass, errors.currency && 'border-destructive')}
                >
                  <span className="truncate">{currencyLabel}</span>
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currency && (
                <p className="text-sm text-destructive mt-1">{errors.currency.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
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

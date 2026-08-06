import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Eye, EyeOff, Briefcase, Lock, Settings, Save, UtensilsCrossed, ChefHat, UserCog, Shield, Store, Plus } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';
import { Badge } from '@/presentation/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/presentation/components/ui/select';
import { Switch } from '@/presentation/components/ui/switch';
import { branchService } from '@/application/services';
import { userFormSchema, type UserFormValues } from '@/shared/schemas/user.schema';
import type { CreateUserRequest, UpdateUserRequest, User } from '@/domain/types';
import { BranchAssignDialog } from './BranchAssignDialog';

// Roles asignables desde el formulario de usuarios. OWNER se excluye: solo se crea vía signup.
type AssignableRole = UserFormValues['rol'];

// ADMIN accede a todas las sucursales sin asignación explícita; los demás requieren ≥1.
const ROLES_REQUIRING_BRANCHES: AssignableRole[] = ['WAITER', 'CHEF', 'MANAGER'];
import {
  getPasswordStrengthPercentage,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  getPasswordStrengthTextColor,
} from '@/shared/utils/password.utils';
import { cn } from '@/shared/lib/utils';
import { INPUT_LENGTH } from '@/shared/constants';

const PHONE_DIGITS = 10;

const roleConfig: Record<AssignableRole, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  WAITER: { label: 'Mesero', Icon: UtensilsCrossed },
  CHEF: { label: 'Cocinero', Icon: ChefHat },
  MANAGER: { label: 'Gerente', Icon: UserCog },
  ADMIN: { label: 'Administrador', Icon: Shield },
};

interface UserFormProps {
  initialData?: User | null;
  onSubmit: (userData: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEditMode = !!initialData;
  const [showPassword, setShowPassword] = useState(false);
  const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      last_name: initialData?.last_name ?? '',
      second_last_name: initialData?.second_last_name ?? '',
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      password: '',
      // OWNER no es asignable desde este formulario (solo se crea vía signup).
      rol: initialData && initialData.rol !== 'OWNER' ? initialData.rol : 'WAITER',
      status: initialData?.status ?? true,
      branchIds: initialData?.branchIds ?? [],
    },
  });

  const name = watch('name');
  const lastName = watch('last_name');
  const secondLastName = watch('second_last_name');
  const password = watch('password');
  const rol = watch('rol');
  const status = watch('status');
  const branchIds = watch('branchIds');

  const requiresBranches = ROLES_REQUIRING_BRANCHES.includes(rol);

  // Solo se pueden asignar sucursales activas de la organización.
  const { data: branches = [], isLoading: isLoadingBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.listBranches(false),
  });

  const selectedBranches = useMemo(
    () => branches.filter((b) => branchIds.includes(b.id)),
    [branches, branchIds]
  );

  const passwordStrengthPercentage = getPasswordStrengthPercentage(password);
  const passwordStrengthLabel = getPasswordStrengthLabel(password);
  const passwordStrengthColor = getPasswordStrengthColor(password);
  const passwordStrengthTextColor = getPasswordStrengthTextColor(password);

  const onFormSubmit = async (data: UserFormValues) => {
    // Validación condicional de password (requerida en creación, min 8 si se proporciona)
    if (!isEditMode && !data.password) {
      setError('password', { message: 'La contraseña es requerida' });
      return;
    }
    if (data.password && data.password.length < 8) {
      setError('password', { message: 'La contraseña debe tener al menos 8 caracteres' });
      return;
    }

    const phoneDigits = data.phone?.replace(/\D/g, '') || '';
    const phoneValue = phoneDigits.length === PHONE_DIGITS ? phoneDigits : (data.phone?.trim() || null);

    // Roles operativos: enviamos las sucursales elegidas (puede ir vacío; el usuario
    // simplemente no verá ninguna hasta que se le asigne). ADMIN accede a todas sin asignación.
    const roleRequiresBranches = ROLES_REQUIRING_BRANCHES.includes(data.rol);
    const branchIdsPayload = roleRequiresBranches ? data.branchIds : undefined;

    if (isEditMode) {
      const updateData: UpdateUserRequest = {
        name: data.name,
        last_name: data.last_name,
        second_last_name: data.second_last_name?.trim() || null,
        email: data.email,
        phone: phoneValue,
        rol: data.rol,
        status: data.status,
        branchIds: branchIdsPayload,
      };
      if (data.password && data.password.trim()) {
        updateData.password = data.password;
      }
      await onSubmit(updateData);
    } else {
      await onSubmit({
        ...data,
        second_last_name: data.second_last_name?.trim() || null,
        phone: phoneValue,
        branchIds: branchIdsPayload,
      } as CreateUserRequest);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* INFORMACIÓN PERSONAL */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-slate-500 dark:text-slate-400 shrink-0" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">Información personal</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input id="name" type="text" placeholder="Ej. Juan" maxLength={INPUT_LENGTH.simple_input}
              {...register('name')}
              className={cn('h-11 rounded-lg', errors.name && 'border-red-500 focus-visible:ring-red-500')} />
            <p className="text-xs text-slate-500 dark:text-slate-400">{name.length}/{INPUT_LENGTH.simple_input}</p>
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="last_name" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Apellido <span className="text-red-500">*</span>
            </Label>
            <Input id="last_name" type="text" placeholder="Ej. Pérez" maxLength={INPUT_LENGTH.simple_input}
              {...register('last_name')}
              className={cn('h-11 rounded-lg', errors.last_name && 'border-red-500 focus-visible:ring-red-500')} />
            <p className="text-xs text-slate-500 dark:text-slate-400">{lastName.length}/{INPUT_LENGTH.simple_input}</p>
            {errors.last_name && <p className="text-destructive text-xs">{errors.last_name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="second_last_name" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Segundo apellido <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">(opcional)</span>
            </Label>
            <Input id="second_last_name" type="text" placeholder="Ej. García" maxLength={INPUT_LENGTH.simple_input}
              {...register('second_last_name')}
              className={cn('h-11 rounded-lg', errors.second_last_name && 'border-red-500 focus-visible:ring-red-500')} />
            <p className="text-xs text-slate-500 dark:text-slate-400">{(secondLastName || '').length}/{INPUT_LENGTH.simple_input}</p>
            {errors.second_last_name && <p className="text-destructive text-xs">{errors.second_last_name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Teléfono <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">(opcional, 10 dígitos)</span>
            </Label>
            <Input id="phone" type="tel" inputMode="numeric" placeholder="Ej. 5512345678" maxLength={PHONE_DIGITS + 4}
              {...register('phone')}
              className={cn('h-11 rounded-lg', errors.phone && 'border-red-500 focus-visible:ring-red-500')} />
            {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700" />

      {/* CREDENCIALES Y ACCESO */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-slate-500 dark:text-slate-400 shrink-0" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">Credenciales y acceso</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input id="email" type="email" placeholder="usuario@empresa.com"
              {...register('email')}
              className={cn('h-11 rounded-lg', errors.email && 'border-red-500 focus-visible:ring-red-500')} />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>
          {/* La contraseña solo se define al crear. En edición, el reset se hace desde
              el menú de acciones del usuario (el empleado define su propia clave). */}
          {!isEditMode && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Contraseña <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={cn('h-11 rounded-lg pr-10', errors.password && 'border-red-500 focus-visible:ring-red-500')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
              {password && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', passwordStrengthColor)} style={{ width: `${passwordStrengthPercentage}%` }} />
                  </div>
                  <p className={cn('text-xs font-medium', passwordStrengthTextColor)}>{passwordStrengthLabel}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700" />

      {/* CONFIGURACIÓN DEL SISTEMA */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-slate-500 dark:text-slate-400 shrink-0" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">Configuración del sistema</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-2">
            <Label htmlFor="rol" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Rol del usuario <span className="text-red-500">*</span>
            </Label>
            <Select value={rol} onValueChange={(value) => setValue('rol', value as AssignableRole)}>
              <SelectTrigger id="rol" className="h-11 rounded-lg">
                <span className="flex items-center justify-between w-full gap-3">
                  <span>{roleConfig[rol].label}</span>
                  {React.createElement(roleConfig[rol].Icon, { className: 'h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0 ml-1' })}
                </span>
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(roleConfig) as [AssignableRole, typeof roleConfig[AssignableRole]][]).map(([role, { label, Icon }]) => (
                  <SelectItem key={role} value={role}>
                    <span className="flex items-center justify-between w-full gap-3">
                      <span>{label}</span>
                      <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0 ml-1" />
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rol && <p className="text-destructive text-xs">{errors.rol.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-slate-800 dark:text-slate-200">Estado de la cuenta</Label>
            <div className="flex items-center gap-3 h-11">
              <Switch checked={status} onCheckedChange={(checked) => setValue('status', checked)} />
              <span className="text-sm text-slate-700 dark:text-slate-300">Permitir acceso inmediato</span>
            </div>
          </div>
        </div>

        {/* Sucursales asignadas: solo roles operativos (ADMIN accede a todas). */}
        {requiresBranches && (
          <div className="flex flex-col gap-2 mt-6">
            <Label className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Sucursales asignadas{' '}
              <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">(opcional)</span>
            </Label>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              {selectedBranches.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Sin sucursales asignadas
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedBranches.map((branch) => (
                    <Badge
                      key={branch.id}
                      className="inline-flex items-center gap-1.5 rounded-full border-0 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      <Store className="h-3 w-3" />
                      {branch.name}
                    </Badge>
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setIsBranchDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Seleccionar sucursales
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="rounded-lg px-5 py-2.5">Cancelar</Button>
        <Button type="submit" disabled={isLoading} className="rounded-lg px-5 py-2.5 bg-primary text-white hover:bg-primary/90 inline-flex items-center gap-2">
          <Save className="h-4 w-4" />
          {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar Usuario' : 'Guardar Usuario'}
        </Button>
      </div>
    </form>

    <BranchAssignDialog
      open={isBranchDialogOpen}
      onClose={() => setIsBranchDialogOpen(false)}
      branches={branches}
      isLoading={isLoadingBranches}
      selectedIds={branchIds}
      onApply={(ids) => {
        setValue('branchIds', ids);
        setIsBranchDialogOpen(false);
      }}
    />
    </>
  );
};

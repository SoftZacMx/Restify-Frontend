import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Briefcase, Lock, Settings, Save, UtensilsCrossed, ChefHat, UserCog, Shield } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/presentation/components/ui/select';
import { Switch } from '@/presentation/components/ui/switch';
import { userFormSchema, type UserFormValues } from '@/shared/schemas/user.schema';
import type { CreateUserRequest, UpdateUserRequest, UserRole, User } from '@/domain/types';
import {
  getPasswordStrengthPercentage,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  getPasswordStrengthTextColor,
} from '@/shared/utils/password.utils';
import { cn } from '@/shared/lib/utils';
import { INPUT_LENGTH } from '@/shared/constants';

const PHONE_DIGITS = 10;

const roleConfig: Record<UserRole, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
      rol: initialData?.rol ?? 'WAITER',
      status: initialData?.status ?? true,
    },
  });

  const name = watch('name');
  const lastName = watch('last_name');
  const secondLastName = watch('second_last_name');
  const password = watch('password');
  const rol = watch('rol');
  const status = watch('status');

  const passwordStrengthPercentage = getPasswordStrengthPercentage(password);
  const passwordStrengthLabel = getPasswordStrengthLabel(password);
  const passwordStrengthColor = getPasswordStrengthColor(password);
  const passwordStrengthTextColor = getPasswordStrengthTextColor(password);

  const onFormSubmit = async (data: UserFormValues) => {
    const phoneDigits = data.phone?.replace(/\D/g, '') || '';
    const phoneValue = phoneDigits.length === PHONE_DIGITS ? phoneDigits : (data.phone?.trim() || null);

    if (isEditMode) {
      const updateData: UpdateUserRequest = {
        name: data.name,
        last_name: data.last_name,
        second_last_name: data.second_last_name?.trim() || null,
        email: data.email,
        phone: phoneValue,
        rol: data.rol,
        status: data.status,
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
      } as CreateUserRequest);
    }
  };

  return (
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
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="last_name" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Apellido <span className="text-red-500">*</span>
            </Label>
            <Input id="last_name" type="text" placeholder="Ej. Pérez" maxLength={INPUT_LENGTH.simple_input}
              {...register('last_name')}
              className={cn('h-11 rounded-lg', errors.last_name && 'border-red-500 focus-visible:ring-red-500')} />
            <p className="text-xs text-slate-500 dark:text-slate-400">{lastName.length}/{INPUT_LENGTH.simple_input}</p>
            {errors.last_name && <p className="text-red-500 text-xs">{errors.last_name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="second_last_name" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Segundo apellido <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">(opcional)</span>
            </Label>
            <Input id="second_last_name" type="text" placeholder="Ej. García" maxLength={INPUT_LENGTH.simple_input}
              {...register('second_last_name')}
              className={cn('h-11 rounded-lg', errors.second_last_name && 'border-red-500 focus-visible:ring-red-500')} />
            <p className="text-xs text-slate-500 dark:text-slate-400">{(secondLastName || '').length}/{INPUT_LENGTH.simple_input}</p>
            {errors.second_last_name && <p className="text-red-500 text-xs">{errors.second_last_name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Teléfono <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">(opcional, 10 dígitos)</span>
            </Label>
            <Input id="phone" type="tel" inputMode="numeric" placeholder="Ej. 5512345678" maxLength={PHONE_DIGITS + 4}
              {...register('phone')}
              className={cn('h-11 rounded-lg', errors.phone && 'border-red-500 focus-visible:ring-red-500')} />
            {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
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
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Contraseña {!isEditMode && <span className="text-red-500">*</span>}
              {isEditMode && <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">(opcional)</span>}
            </Label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'}
                placeholder={isEditMode ? 'Dejar vacío para mantener la actual' : '••••••••'}
                {...register('password')}
                className={cn('h-11 rounded-lg pr-10', errors.password && 'border-red-500 focus-visible:ring-red-500')} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            {password && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', passwordStrengthColor)} style={{ width: `${passwordStrengthPercentage}%` }} />
                </div>
                <p className={cn('text-xs font-medium', passwordStrengthTextColor)}>{passwordStrengthLabel}</p>
              </div>
            )}
          </div>
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
            <Select value={rol} onValueChange={(value) => setValue('rol', value as UserRole)}>
              <SelectTrigger id="rol" className="h-11 rounded-lg">
                <span className="flex items-center justify-between w-full gap-3">
                  <span>{roleConfig[rol].label}</span>
                  {React.createElement(roleConfig[rol].Icon, { className: 'h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0 ml-1' })}
                </span>
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(roleConfig) as [UserRole, typeof roleConfig[UserRole]][]).map(([role, { label, Icon }]) => (
                  <SelectItem key={role} value={role}>
                    <span className="flex items-center justify-between w-full gap-3">
                      <span>{label}</span>
                      <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0 ml-1" />
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rol && <p className="text-red-500 text-xs">{errors.rol.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-slate-800 dark:text-slate-200">Estado de la cuenta</Label>
            <div className="flex items-center gap-3 h-11">
              <Switch checked={status} onCheckedChange={(checked) => setValue('status', checked)} />
              <span className="text-sm text-slate-700 dark:text-slate-300">Permitir acceso inmediato</span>
            </div>
          </div>
        </div>
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
  );
};

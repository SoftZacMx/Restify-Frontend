import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Briefcase, Lock, Save } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';
import { profileFormSchema, type ProfileFormValues } from '@/shared/schemas/profile.schema';
import type { UpdateUserRequest, User } from '@/domain/types';
import {
  getPasswordStrengthPercentage,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  getPasswordStrengthTextColor,
} from '@/shared/utils/password.utils';
import { PasswordRequirements } from '@/presentation/components/ui/password-requirements';
import { cn } from '@/shared/lib/utils';
import { INPUT_LENGTH } from '@/shared/constants';

const PHONE_DIGITS = 10;

interface ProfileFormProps {
  user: User;
  onSubmit: (userData: UpdateUserRequest) => Promise<void>;
  isLoading?: boolean;
}

/**
 * ProfileForm
 * Formulario de autogestión: nombre, apellidos, email, teléfono y contraseña.
 * A diferencia de UserForm (gestión de usuarios), nunca envía rol/estado/
 * sucursales — esos campos están fuera del alcance de "editar mi perfil".
 */
export const ProfileForm: React.FC<ProfileFormProps> = ({ user, onSubmit, isLoading = false }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name ?? '',
      last_name: user.last_name ?? '',
      second_last_name: user.second_last_name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      password: '',
    },
  });

  const name = watch('name');
  const lastName = watch('last_name');
  const secondLastName = watch('second_last_name');
  const password = watch('password');

  const passwordStrengthPercentage = getPasswordStrengthPercentage(password);
  const passwordStrengthLabel = getPasswordStrengthLabel(password);
  const passwordStrengthColor = getPasswordStrengthColor(password);
  const passwordStrengthTextColor = getPasswordStrengthTextColor(password);

  const onFormSubmit = async (data: ProfileFormValues) => {
    const phoneDigits = data.phone?.replace(/\D/g, '') || '';
    const phoneValue = phoneDigits.length === PHONE_DIGITS ? phoneDigits : (data.phone?.trim() || null);

    const updateData: UpdateUserRequest = {
      name: data.name,
      last_name: data.last_name,
      second_last_name: data.second_last_name?.trim() || null,
      email: data.email,
      phone: phoneValue,
    };
    if (data.password && data.password.trim()) {
      updateData.password = data.password;
    }
    await onSubmit(updateData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* INFORMACIÓN PERSONAL */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-muted-foreground shrink-0" />
          <h2 className="text-h3 text-foreground">Información personal</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input id="name" type="text" placeholder="Ej. Juan" maxLength={INPUT_LENGTH.simple_input}
              {...register('name')}
              className={cn('h-11 rounded-lg', errors.name && 'border-destructive focus-visible:ring-destructive')} />
            <p className="text-xs text-muted-foreground">{name.length}/{INPUT_LENGTH.simple_input}</p>
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="last_name" className="text-sm font-medium text-foreground">
              Apellido <span className="text-destructive">*</span>
            </Label>
            <Input id="last_name" type="text" placeholder="Ej. Pérez" maxLength={INPUT_LENGTH.simple_input}
              {...register('last_name')}
              className={cn('h-11 rounded-lg', errors.last_name && 'border-destructive focus-visible:ring-destructive')} />
            <p className="text-xs text-muted-foreground">{lastName.length}/{INPUT_LENGTH.simple_input}</p>
            {errors.last_name && <p className="text-destructive text-xs">{errors.last_name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="second_last_name" className="text-sm font-medium text-foreground">
              Segundo apellido <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
            </Label>
            <Input id="second_last_name" type="text" placeholder="Ej. García" maxLength={INPUT_LENGTH.simple_input}
              {...register('second_last_name')}
              className={cn('h-11 rounded-lg', errors.second_last_name && 'border-destructive focus-visible:ring-destructive')} />
            <p className="text-xs text-muted-foreground">{(secondLastName || '').length}/{INPUT_LENGTH.simple_input}</p>
            {errors.second_last_name && <p className="text-destructive text-xs">{errors.second_last_name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="text-sm font-medium text-foreground">
              Teléfono <span className="text-muted-foreground font-normal text-xs">(opcional, 10 dígitos)</span>
            </Label>
            <Input id="phone" type="tel" inputMode="numeric" placeholder="Ej. 5512345678" maxLength={PHONE_DIGITS}
              {...register('phone')}
              className={cn('h-11 rounded-lg', errors.phone && 'border-destructive focus-visible:ring-destructive')} />
            {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* CREDENCIALES */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
          <h2 className="text-h3 text-foreground">Credenciales</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input id="email" type="email" placeholder="usuario@empresa.com"
              {...register('email')}
              className={cn('h-11 rounded-lg', errors.email && 'border-destructive focus-visible:ring-destructive')} />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Nueva contraseña <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
            </Label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'}
                placeholder="Dejar en blanco para no cambiarla"
                {...register('password')}
                className={cn('h-11 rounded-lg pr-10', errors.password && 'border-destructive focus-visible:ring-destructive')} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground dark:hover:text-foreground"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
            {password && (
              <>
                <PasswordRequirements password={password} />
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', passwordStrengthColor)} style={{ width: `${passwordStrengthPercentage}%` }} />
                  </div>
                  <p className={cn('text-xs font-medium', passwordStrengthTextColor)}>{passwordStrengthLabel}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Botón */}
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading} className="rounded-lg px-5 py-2.5 bg-primary text-white hover:bg-primary/90 inline-flex items-center gap-2">
          <Save className="h-4 w-4" />
          {isLoading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
};

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Briefcase, Lock, Settings, Save, UtensilsCrossed, ChefHat, UserCog, Shield } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/presentation/components/ui/select';
import { Switch } from '@/presentation/components/ui/switch';
import type { CreateUserRequest, UpdateUserRequest, UserRole, UserFormErrors, User } from '@/domain/types';
import {
  getPasswordStrengthPercentage,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  getPasswordStrengthTextColor,
} from '@/shared/utils/password.utils';
import { cn } from '@/shared/lib/utils';
import { INPUT_LENGTH } from '@/shared/constants';

const PHONE_DIGITS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const roleConfig: Record<UserRole, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  WAITER: { label: 'Mesero', Icon: UtensilsCrossed },
  CHEF: { label: 'Cocinero', Icon: ChefHat },
  MANAGER: { label: 'Gerente', Icon: UserCog },
  ADMIN: { label: 'Administrador', Icon: Shield },
};

interface UserFormProps {
  initialData?: User | null; // Si se proporciona, es modo edición
  onSubmit: (userData: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Componente UserForm reutilizable
 * Puede usarse tanto para crear como para editar usuarios
 * Responsabilidad única: Renderizar y manejar el formulario de usuario
 */
export const UserForm: React.FC<UserFormProps> = ({
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState<CreateUserRequest>({
    name: '',
    last_name: '',
    second_last_name: '',
    email: '',
    phone: '',
    password: '',
    rol: 'WAITER',
    status: true,
  });

  const [errors, setErrors] = useState<UserFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  // Cargar datos iniciales si estamos en modo edición
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        last_name: initialData.last_name,
        second_last_name: initialData.second_last_name || '',
        email: initialData.email,
        phone: initialData.phone || '',
        password: '', // No prellenar contraseña por seguridad
        rol: initialData.rol,
        status: initialData.status,
      });
    }
  }, [initialData]);

  /**
   * Valida el formulario
   */
  const validateForm = (): boolean => {
    const newErrors: UserFormErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length > INPUT_LENGTH.simple_input) {
      newErrors.name = `El nombre no puede superar ${INPUT_LENGTH.simple_input} caracteres`;
    }

    // Validar apellido
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    } else if (formData.last_name.length > INPUT_LENGTH.simple_input) {
      newErrors.last_name = `El apellido no puede superar ${INPUT_LENGTH.simple_input} caracteres`;
    }

    // Validar segundo apellido (solo longitud si tiene valor)
    if (formData.second_last_name && formData.second_last_name.length > INPUT_LENGTH.simple_input) {
      newErrors.second_last_name = `El segundo apellido no puede superar ${INPUT_LENGTH.simple_input} caracteres`;
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    // Validar teléfono: si tiene valor, debe ser exactamente 10 dígitos
    if (formData.phone && formData.phone.trim()) {
      const digitsOnly = formData.phone.replace(/\D/g, '');
      if (digitsOnly.length !== PHONE_DIGITS) {
        newErrors.phone = `El teléfono debe tener ${PHONE_DIGITS} dígitos`;
      }
    }

    // Validar contraseña (solo requerida en modo creación)
    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      }
    } else {
      // En modo edición, la contraseña es opcional
      if (formData.password && formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      }
    }

    // Validar rol
    if (!formData.rol) {
      newErrors.rol = 'El rol es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el cambio en los campos del formulario
   */
  const handleChange = (field: keyof CreateUserRequest, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Normalizar teléfono: solo dígitos, si tiene 10 se envía
      const phoneDigits = formData.phone?.replace(/\D/g, '') || '';
      const phoneValue = phoneDigits.length === PHONE_DIGITS ? phoneDigits : (formData.phone?.trim() || null);

      const userData: CreateUserRequest | UpdateUserRequest = {
        ...formData,
        second_last_name: formData.second_last_name?.trim() || null,
        phone: phoneValue,
      };

      // En modo edición, solo incluir password si se proporcionó
      if (isEditMode) {
        const updateData: UpdateUserRequest = {
          name: userData.name,
          last_name: userData.last_name,
          second_last_name: userData.second_last_name,
          email: userData.email,
          phone: userData.phone,
          rol: userData.rol,
          status: userData.status,
        };
        // Solo agregar password si se proporcionó una nueva
        if (userData.password && userData.password.trim()) {
          updateData.password = userData.password;
        }
        await onSubmit(updateData);
      } else {
        await onSubmit(userData as CreateUserRequest);
      }
    } catch (error) {
      // Los errores se manejan en el componente padre
      console.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} usuario:`, error);
    }
  };

  const passwordStrengthPercentage = getPasswordStrengthPercentage(formData.password);
  const passwordStrengthLabel = getPasswordStrengthLabel(formData.password);
  const passwordStrengthColor = getPasswordStrengthColor(formData.password);
  const passwordStrengthTextColor = getPasswordStrengthTextColor(formData.password);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* INFORMACIÓN PERSONAL */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-slate-500 dark:text-slate-400 shrink-0" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
            Información personal
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej. Juan"
              maxLength={INPUT_LENGTH.simple_input}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={cn('h-11 rounded-lg', errors.name && 'border-red-500 focus-visible:ring-red-500')}
              required
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">{formData.name.length}/{INPUT_LENGTH.simple_input}</p>
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="last_name" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Apellido <span className="text-red-500">*</span>
            </Label>
            <Input
              id="last_name"
              type="text"
              placeholder="Ej. Pérez"
              maxLength={INPUT_LENGTH.simple_input}
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              className={cn('h-11 rounded-lg', errors.last_name && 'border-red-500 focus-visible:ring-red-500')}
              required
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">{formData.last_name.length}/{INPUT_LENGTH.simple_input}</p>
            {errors.last_name && <p className="text-red-500 text-xs">{errors.last_name}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="second_last_name" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Segundo apellido <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">(opcional)</span>
            </Label>
            <Input
              id="second_last_name"
              type="text"
              placeholder="Ej. García"
              maxLength={INPUT_LENGTH.simple_input}
              value={formData.second_last_name || ''}
              onChange={(e) => handleChange('second_last_name', e.target.value)}
              className={cn('h-11 rounded-lg', errors.second_last_name && 'border-red-500 focus-visible:ring-red-500')}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">{(formData.second_last_name || '').length}/{INPUT_LENGTH.simple_input}</p>
            {errors.second_last_name && <p className="text-red-500 text-xs">{errors.second_last_name}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Teléfono <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">(opcional, 10 dígitos)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="Ej. 5512345678"
              maxLength={PHONE_DIGITS + 4}
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={cn('h-11 rounded-lg', errors.phone && 'border-red-500 focus-visible:ring-red-500')}
            />
            {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700" />

      {/* CREDENCIALES Y ACCESO */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-slate-500 dark:text-slate-400 shrink-0" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
            Credenciales y acceso
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@empresa.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={cn('h-11 rounded-lg', errors.email && 'border-red-500 focus-visible:ring-red-500')}
              required
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Contraseña {!isEditMode && <span className="text-red-500">*</span>}
              {isEditMode && <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">(opcional)</span>}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={isEditMode ? 'Dejar vacío para mantener la actual' : '••••••••'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={cn('h-11 rounded-lg pr-10', errors.password && 'border-red-500 focus-visible:ring-red-500')}
                required={!isEditMode}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
            {formData.password && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', passwordStrengthColor)}
                    style={{ width: `${passwordStrengthPercentage}%` }}
                  />
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
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
            Configuración del sistema
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-2">
            <Label htmlFor="rol" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Rol del usuario <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.rol} onValueChange={(value) => handleChange('rol', value as UserRole)}>
              <SelectTrigger id="rol" className="h-11 rounded-lg">
                <span className="flex items-center justify-between w-full gap-3">
                  <span>{roleConfig[formData.rol].label}</span>
                  {React.createElement(roleConfig[formData.rol].Icon, { className: 'h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0 ml-1' })}
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
            {errors.rol && <p className="text-red-500 text-xs">{errors.rol}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Estado de la cuenta
            </Label>
            <div className="flex items-center gap-3 h-11">
              <Switch
                checked={formData.status}
                onCheckedChange={(checked) => handleChange('status', checked)}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Permitir acceso inmediato
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="rounded-lg px-5 py-2.5">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="rounded-lg px-5 py-2.5 bg-primary text-white hover:bg-primary/90 inline-flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar Usuario' : 'Guardar Usuario'}
        </Button>
      </div>
    </form>
  );
};


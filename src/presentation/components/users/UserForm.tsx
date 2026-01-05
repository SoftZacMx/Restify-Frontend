import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
    }

    // Validar apellido
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
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
      // Limpiar campos opcionales vacíos
      const userData: CreateUserRequest | UpdateUserRequest = {
        ...formData,
        second_last_name: formData.second_last_name?.trim() || null,
        phone: formData.phone?.trim() || null,
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
      {/* Sección: Información Personal */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Información Personal
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Datos básicos {isEditMode ? 'del usuario' : 'del nuevo miembro del equipo'}.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div className="flex flex-col">
            <Label htmlFor="name" className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal pb-2">
              Nombre <span className="text-red-600 dark:text-red-400">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Ingrese el nombre"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={cn(
                'h-11',
                errors.name && 'border-red-600 dark:border-red-400 focus:ring-red-600/50 focus:border-red-600'
              )}
              required
            />
            {errors.name && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1.5">{errors.name}</p>
            )}
          </div>

          {/* Apellido */}
          <div className="flex flex-col">
            <Label htmlFor="last_name" className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal pb-2">
              Apellido <span className="text-red-600 dark:text-red-400">*</span>
            </Label>
            <Input
              id="last_name"
              type="text"
              placeholder="Ingrese el apellido"
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              className={cn(
                'h-11',
                errors.last_name && 'border-red-600 dark:border-red-400 focus:ring-red-600/50 focus:border-red-600'
              )}
              required
            />
            {errors.last_name && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1.5">{errors.last_name}</p>
            )}
          </div>

          {/* Segundo Apellido */}
          <div className="flex flex-col">
            <Label htmlFor="second_last_name" className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal pb-2">
              Segundo apellido (opcional)
            </Label>
            <Input
              id="second_last_name"
              type="text"
              placeholder="Ingrese el segundo apellido"
              value={formData.second_last_name || ''}
              onChange={(e) => handleChange('second_last_name', e.target.value)}
              className="h-11"
            />
          </div>

          {/* Teléfono */}
          <div className="flex flex-col">
            <Label htmlFor="phone" className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal pb-2">
              Teléfono (opcional)
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="h-11"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800" />

      {/* Sección: Credenciales y Acceso */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Credenciales y Acceso
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Información para el inicio de sesión y contacto.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="flex flex-col">
            <Label htmlFor="email" className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal pb-2">
              Email <span className="text-red-600 dark:text-red-400">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="ejemplo@dominio.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={cn(
                'h-11',
                errors.email && 'border-red-600 dark:border-red-400 focus:ring-red-600/50 focus:border-red-600'
              )}
              required
            />
            {errors.email && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1.5">{errors.email}</p>
            )}
          </div>

          {/* Contraseña */}
          <div className="flex flex-col">
            <Label htmlFor="password" className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal pb-2">
              {isEditMode ? 'Nueva contraseña (opcional)' : 'Contraseña'} <span className="text-red-600 dark:text-red-400">{!isEditMode && '*'}</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={isEditMode ? 'Dejar vacío para mantener la actual' : 'Ingrese la contraseña'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={cn(
                  'h-11 pr-10',
                  errors.password && 'border-red-600 dark:border-red-400 focus:ring-red-600/50 focus:border-red-600'
                )}
                required={!isEditMode}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1.5">{errors.password}</p>
            )}
            {/* Indicador de fortaleza de contraseña */}
            {formData.password && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', passwordStrengthColor)}
                    style={{ width: `${passwordStrengthPercentage}%` }}
                  />
                </div>
                <p className={cn('text-xs font-medium', passwordStrengthTextColor)}>
                  {passwordStrengthLabel}
                </p>
              </div>
            )}
            {isEditMode && !formData.password && (
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1.5">
                Dejar vacío para mantener la contraseña actual
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800" />

      {/* Sección: Configuración del Sistema */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Configuración del Sistema
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Define los permisos y el estado {isEditMode ? 'del usuario' : 'inicial del usuario'}.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Rol */}
          <div className="flex flex-col">
            <Label htmlFor="rol" className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal pb-2">
              Rol del usuario <span className="text-red-600 dark:text-red-400">*</span>
            </Label>
            <Select
              value={formData.rol}
              onValueChange={(value) => handleChange('rol', value as UserRole)}
            >
              <SelectTrigger id="rol" className="h-11">
                {formData.rol === 'WAITER' && 'Mesero (Waiter)'}
                {formData.rol === 'CHEF' && 'Cocinero (Chef)'}
                {formData.rol === 'MANAGER' && 'Gerente (Manager)'}
                {formData.rol === 'ADMIN' && 'Administrador'}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WAITER">Mesero (Waiter)</SelectItem>
                <SelectItem value="CHEF">Cocinero (Chef)</SelectItem>
                <SelectItem value="MANAGER">Gerente (Manager)</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
            {errors.rol && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1.5">{errors.rol}</p>
            )}
          </div>

          {/* Estado */}
          <div className="flex flex-col">
            <Label className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal pb-2">
              Estado de la cuenta
            </Label>
            <div className="flex items-center space-x-3 h-11">
              <Switch
                checked={formData.status}
                onCheckedChange={(checked) => handleChange('status', checked)}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formData.status ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="px-5 py-2.5 text-sm font-semibold"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 text-sm font-semibold bg-primary text-white hover:bg-primary/90"
        >
          {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar Usuario' : 'Guardar Usuario'}
        </Button>
      </div>
    </form>
  );
};


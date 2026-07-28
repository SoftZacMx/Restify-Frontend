import { z } from 'zod';

/** "HH:mm" 24h, o vacío (campo opcional). */
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const optionalTime = z
  .string()
  .trim()
  .regex(timeRegex, 'Usa el formato HH:mm (24h)')
  .or(z.literal(''));

/**
 * Schema del formulario de sucursal.
 * Refleja los límites de `createBranchSchema` del backend.
 * `paymentConfig`/`ticketConfig` quedan fuera de este módulo (se administran en settings/payments).
 * `currency`/`timezone` no se editan: el backend les pone default y toda la app opera en
 * MXN y `APP_TIMEZONE`, así que ofrecerlos prometía algo que ningún cálculo respetaba.
 */
export const branchFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es requerido')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  state: z
    .string()
    .trim()
    .min(1, 'El estado es requerido')
    .max(100, 'El estado no puede exceder 100 caracteres'),
  city: z
    .string()
    .trim()
    .min(1, 'La ciudad es requerida')
    .max(100, 'La ciudad no puede exceder 100 caracteres'),
  street: z
    .string()
    .trim()
    .min(1, 'La calle es requerida')
    .max(200, 'La calle no puede exceder 200 caracteres'),
  exteriorNumber: z
    .string()
    .trim()
    .min(1, 'El número exterior es requerido')
    .max(10, 'El número exterior no puede exceder 10 caracteres')
    .regex(
      /^[A-Za-z0-9\s-]+$/,
      'El número exterior solo puede contener letras, números, espacios y guiones'
    ),
  phone: z
    .string()
    .trim()
    .min(1, 'El teléfono es requerido')
    .regex(/^\d+$/, 'El teléfono solo puede contener números')
    .length(10, 'El teléfono debe tener 10 dígitos'),
  rfc: z
    .string()
    .trim()
    .max(20, 'El RFC no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9]+$/, 'El RFC solo puede contener letras mayúsculas y números')
    .or(z.literal('')),
  logoUrl: z
    .string()
    .trim()
    .url('Debe ser una URL válida')
    .max(500, 'La URL no puede exceder 500 caracteres')
    .or(z.literal('')),
  startOperations: optionalTime,
  endOperations: optionalTime,
});

export type BranchFormValues = z.infer<typeof branchFormSchema>;

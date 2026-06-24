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
    .max(20, 'El número exterior no puede exceder 20 caracteres'),
  phone: z
    .string()
    .trim()
    .min(1, 'El teléfono es requerido')
    .max(30, 'El teléfono no puede exceder 30 caracteres'),
  rfc: z
    .string()
    .trim()
    .max(20, 'El RFC no puede exceder 20 caracteres')
    .or(z.literal('')),
  logoUrl: z
    .string()
    .trim()
    .url('Debe ser una URL válida')
    .max(500, 'La URL no puede exceder 500 caracteres')
    .or(z.literal('')),
  startOperations: optionalTime,
  endOperations: optionalTime,
  timezone: z
    .string()
    .trim()
    .min(1, 'La zona horaria es requerida')
    .max(64, 'La zona horaria no puede exceder 64 caracteres'),
  currency: z
    .string()
    .trim()
    .min(1, 'La moneda es requerida')
    .max(8, 'La moneda no puede exceder 8 caracteres'),
});

export type BranchFormValues = z.infer<typeof branchFormSchema>;

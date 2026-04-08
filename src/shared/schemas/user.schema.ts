import { z } from 'zod';

const PHONE_DIGITS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const userFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  last_name: z.string().min(1, 'El apellido paterno es requerido').max(100, 'El apellido no puede exceder 100 caracteres'),
  second_last_name: z.string().max(100, 'El apellido no puede exceder 100 caracteres'),
  email: z.string().min(1, 'El email es requerido').regex(EMAIL_REGEX, 'El email no tiene un formato válido'),
  phone: z.string().refine(
    (val) => !val || val.replace(/\D/g, '').length === PHONE_DIGITS,
    `El teléfono debe tener ${PHONE_DIGITS} dígitos`
  ),
  password: z.string(),
  rol: z.enum(['WAITER', 'CHEF', 'MANAGER', 'ADMIN'], { error: 'El rol es requerido' }),
  status: z.boolean(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

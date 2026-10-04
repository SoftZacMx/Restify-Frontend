import { z } from 'zod';

const PHONE_DIGITS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mismas reglas de complejidad que el backend y el resto de los formularios de usuario. */
const passwordComplexitySchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[a-z]/, 'Debe incluir al menos una minúscula')
  .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
  .regex(/\d/, 'Debe incluir al menos un número')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/,
    'Debe incluir al menos un carácter especial'
  );

/**
 * Schema de "Mi perfil": a diferencia de userFormSchema, no incluye rol/estado/
 * sucursales — esos campos no se editan desde el propio perfil.
 */
export const profileFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede superar 100 caracteres'),
  last_name: z.string().min(1, 'El apellido es requerido').max(100, 'El apellido no puede superar 100 caracteres'),
  second_last_name: z.string().max(100, 'El segundo apellido no puede superar 100 caracteres'),
  email: z.string().min(1, 'El email es requerido').regex(EMAIL_REGEX, 'El formato del email no es válido'),
  phone: z.string().refine((val) => !val || /^[0-9]+$/.test(val), 'El teléfono solo puede contener números').refine(
    (val) => !val || val.length === PHONE_DIGITS,
    `El teléfono debe tener ${PHONE_DIGITS} dígitos`
  ),
  // Vacía = no se cambia la contraseña.
  password: z.string().superRefine((val, ctx) => {
    if (!val) return;
    const result = passwordComplexitySchema.safeParse(val);
    if (!result.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.error.issues[0]?.message ?? 'Formato de contraseña inválido',
      });
    }
  }),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

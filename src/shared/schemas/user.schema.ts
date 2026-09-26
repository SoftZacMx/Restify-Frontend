import { z } from 'zod';

const PHONE_DIGITS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mismas reglas de complejidad que el backend (createUserSchema) y auth reset/change. */
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

export const userFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede superar 100 caracteres'),
  last_name: z.string().min(1, 'El apellido es requerido').max(100, 'El apellido no puede superar 100 caracteres'),
  second_last_name: z.string().max(100, 'El segundo apellido no puede superar 100 caracteres'),
  email: z.string().min(1, 'El email es requerido').regex(EMAIL_REGEX, 'El formato del email no es válido'),
  phone: z.string().refine(
    (val) => !val || val.replace(/\D/g, '').length === PHONE_DIGITS,
    `El teléfono debe tener ${PHONE_DIGITS} dígitos`
  ).regex(/^[0-9]+$/,'El teléfono solo puede contener números'),
  // Vacía permitida a nivel schema (edición no envía password); en creación se exige en el form.
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
  rol: z.enum(['WAITER', 'CHEF', 'MANAGER', 'ADMIN'], { error: 'El rol es requerido' }),
  status: z.boolean(),
  // Sucursales asignadas. La regla "≥1 para roles operativos" se valida en el form
  // (depende del rol elegido); ADMIN accede a todas y no requiere selección.
  branchIds: z.array(z.string()),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

import { z } from 'zod';

/** Límites de longitud de los campos del signup. */
export const SIGNUP_LIMITS = {
  name: 50,
  lastName: 50,
  branchName: 100,
  rfc: 13, // RFC mexicano: 12 (moral) o 13 (física)
  phoneDigits: 10,
} as const;

/**
 * Paso 1 del wizard: datos del owner + organización.
 * Password espejo del backend de signup: min 8 + minúscula + mayúscula + número
 * (SIN carácter especial, a diferencia de recover-password).
 */
export const signupOwnerSchema = z
  .object({
    name: z.string().min(2, 'Mínimo 2 caracteres').max(SIGNUP_LIMITS.name, `Máximo ${SIGNUP_LIMITS.name} caracteres`),
    lastName: z
      .string()
      .min(2, 'Mínimo 2 caracteres')
      .max(SIGNUP_LIMITS.lastName, `Máximo ${SIGNUP_LIMITS.lastName} caracteres`),
    email: z.string().email('Email inválido'),
    organizationName: z
      .string()
      .min(2, 'Mínimo 2 caracteres')
      .max(SIGNUP_LIMITS.branchName, `Máximo ${SIGNUP_LIMITS.branchName} caracteres`),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[a-z]/, 'Debe incluir una minúscula')
      .regex(/[A-Z]/, 'Debe incluir una mayúscula')
      .regex(/\d/, 'Debe incluir un número'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

/**
 * Paso 2 del wizard: datos de la primera sucursal.
 */
export const signupBranchSchema = z.object({
  name: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(SIGNUP_LIMITS.branchName, `Máximo ${SIGNUP_LIMITS.branchName} caracteres`),
  state: z.string().min(1, 'Requerido'),
  city: z.string().min(1, 'Requerido'),
  street: z.string().min(1, 'Requerido'),
  exteriorNumber: z.string().min(1, 'Requerido'),
  phone: z
    .string()
    .regex(/^\d{10}$/, `El teléfono debe tener ${SIGNUP_LIMITS.phoneDigits} dígitos`),
  rfc: z
    .string()
    .max(SIGNUP_LIMITS.rfc, `El RFC no puede superar ${SIGNUP_LIMITS.rfc} caracteres`)
    .optional()
    .or(z.literal('')),
});

export type SignupOwnerFormData = z.infer<typeof signupOwnerSchema>;
export type SignupBranchFormData = z.infer<typeof signupBranchSchema>;

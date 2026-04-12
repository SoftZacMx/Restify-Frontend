import { z } from 'zod';

export const verifyEmailSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const resetPasswordSchema = z
  .object({
    password: z.string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[a-z]/, 'Debe incluir al menos una minúscula')
      .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
      .regex(/\d/, 'Debe incluir al menos un número')
      .regex(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/, 'Debe incluir al menos un carácter especial'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

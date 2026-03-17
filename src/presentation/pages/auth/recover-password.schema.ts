import { z } from 'zod';

export const verifyEmailSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

import { z } from 'zod';

export const productFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200, 'El nombre no puede exceder 200 caracteres'),
  description: z.string().max(1000, 'La descripción no puede exceder 1000 caracteres'),
  status: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

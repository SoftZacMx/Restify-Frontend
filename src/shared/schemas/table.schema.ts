import { z } from 'zod';

export const tableFormSchema = z.object({
  name: z.string()
    .min(1, 'El nombre de la mesa es requerido')
    .max(64, 'El nombre no puede exceder 64 caracteres'),
  status: z.boolean(),
  availabilityStatus: z.boolean(),
});

export type TableFormValues = z.infer<typeof tableFormSchema>;

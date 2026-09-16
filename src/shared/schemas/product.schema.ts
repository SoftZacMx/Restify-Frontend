import { z } from 'zod';

const unitOfMeasureValues = ['KG', 'G', 'L', 'ML', 'PCS', 'OTHER'] as const;

export const productFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200, 'El nombre no puede exceder 200 caracteres'),
  description: z.string().max(1000, 'La descripción no puede exceder 1000 caracteres'),
  status: z.boolean(),
  // Stock config — opcional. Por defecto trackStock arranca en true al crear.
  trackStock: z.boolean(),
  unitOfMeasure: z.enum(unitOfMeasureValues).nullable().optional(),
  minStockAlert: z.number().min(0, 'No puede ser negativo').nullable().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

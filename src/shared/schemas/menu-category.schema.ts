import { z } from 'zod';

export const menuCategoryFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200, 'El nombre no puede exceder 200 caracteres'),
  status: z.boolean(),
});

export type MenuCategoryFormValues = z.infer<typeof menuCategoryFormSchema>;

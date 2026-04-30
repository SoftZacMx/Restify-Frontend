import { z } from 'zod';

export const menuItemFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200, 'El nombre no puede exceder 200 caracteres'),
  price: z.number({ error: 'El precio es requerido' })
    .positive('El precio debe ser mayor a 0')
    .refine(
      (val) => Number(val.toFixed(2)) === val,
      'El precio puede tener máximo 2 decimales'
    ),
  status: z.boolean(),
  isExtra: z.boolean(),
  categoryId: z.string().optional(),
});

export type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;
//
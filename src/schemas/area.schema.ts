import { z } from 'zod';

export const createAreaSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  description: z.string().max(1000).optional().or(z.literal('')),
  process_identifier: z.string().max(100).optional().or(z.literal('')),
  manager_user_id: z.number().int().positive().optional().nullable(),
  icon_key: z.string().optional(),
});

export const updateAreaSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  description: z.string().max(1000).optional().or(z.literal('')),
  process_identifier: z.string().max(100).optional().or(z.literal('')),
  active: z.boolean().optional(),
  icon_key: z.string().optional(),
});

export type CreateAreaFormData = z.infer<typeof createAreaSchema>;
export type UpdateAreaFormData = z.infer<typeof updateAreaSchema>;

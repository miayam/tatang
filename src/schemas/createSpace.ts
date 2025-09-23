import { z } from 'zod';

export const CreateSpaceSchema = z.object({
  name: z
    .string()
    .min(1, 'Space name is required')
    .max(50, 'Space name is too long')
    .trim(),
  description: z
    .string()
    .max(500, 'Description is too long')
    .optional()
    .nullable(),
});

export type CreateSpaceData = z.infer<typeof CreateSpaceSchema>;

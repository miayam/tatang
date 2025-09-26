import { z } from 'zod';

export const CreateMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Content name is required')
    .max(3000, 'Content is too long')
    .trim(),
  messageType: z.enum(['TEXT', 'SYSTEM']),
  parentMessageId: z.string().optional(),
});

export type CreateMessageData = z.infer<typeof CreateMessageSchema>;

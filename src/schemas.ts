import { z } from 'zod';

// tip comun pentru UUID
export const uuidSchema = z.string().uuid();

export const objectSchema = z.object({
  user_id: uuidSchema,
  title: z.string().min(1),
  description: z.string().min(1),
});

export const messageSchema = z.object({
  from_user_id: uuidSchema,
  to_user_id: uuidSchema,
  text: z.string().min(1),
});

export const feedbackSchema = z.object({
  from_user_id: uuidSchema,
  to_user_id: uuidSchema,
  comment: z.string().min(1),
});
